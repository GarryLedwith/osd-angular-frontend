'use strict';

const VALID_EQUIPMENT_ID = '507f1f77bcf86cd799439011';
const VALID_USER_ID = '507f1f77bcf86cd799439012';
const VALID_TOKEN = 'test.jwt.token';

function makeEvent({ method = 'POST', id = VALID_EQUIPMENT_ID, body = {}, authHeader = `Bearer ${VALID_TOKEN}` } = {}) {
  return {
    httpMethod: method,
    pathParameters: { id },
    headers: authHeader ? { Authorization: authHeader } : {},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

describe('Lambda handler - unit tests', () => {
  let handler;
  let mockUpdateOne;

  beforeEach(() => {
    jest.resetModules();

    mockUpdateOne = jest.fn().mockResolvedValue({ matchedCount: 1 });
    const mockCollection = { updateOne: mockUpdateOne };
    const mockDb = { collection: jest.fn().mockReturnValue(mockCollection) };
    const mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
    };

    jest.doMock('mongodb', () => {
      const actual = jest.requireActual('mongodb');
      return {
        MongoClient: jest.fn().mockImplementation(() => mockClient),
        ObjectId: actual.ObjectId,
      };
    });

    jest.doMock('jsonwebtoken', () => ({
      verify: jest.fn().mockReturnValue({ userId: VALID_USER_ID }),
    }));

    process.env.JWTSECRET = 'test-secret';
    process.env.DB_CONN_STRING = 'mongodb://localhost:27017';
    process.env.DB_NAME = 'test_db';

    handler = require('../index').handler;
  });

  //  CORS preflight 

  test('returns 200 for OPTIONS preflight', async () => {
    const event = makeEvent({ method: 'OPTIONS' });
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  // ── Auth checks ────────────────────────────────────────────────────────────

  test('returns 401 when no Authorization header', async () => {
    const event = makeEvent({ authHeader: null });
    const result = await handler(event);
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body).message).toBe('No token provided');
  });

  test('returns 401 when Authorization header has no Bearer prefix', async () => {
    const event = makeEvent({ authHeader: 'Basic sometoken' });
    const result = await handler(event);
    expect(result.statusCode).toBe(401);
  });

  test('returns 403 for an invalid or expired JWT', async () => {
    const jwt = require('jsonwebtoken');
    jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });
    const event = makeEvent();
    const result = await handler(event);
    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body).message).toBe('Invalid or expired token');
  });

  //  Equipment ID validation

  test('returns 400 for an invalid equipment ID', async () => {
    const event = makeEvent({ id: 'not-a-valid-objectid' });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toContain('Invalid equipment ID');
  });

  //  Body validation

  test('returns 400 for malformed JSON body', async () => {
    const event = makeEvent();
    event.body = '{invalid json{{';
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Invalid JSON body');
  });

  test('returns 400 when userId is missing', async () => {
    const event = makeEvent({ body: { startDate: '2025-06-01', endDate: '2025-06-07' } });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Invalid user ID');
  });

  test('returns 400 when userId is not a valid ObjectId', async () => {
    const event = makeEvent({ body: { userId: 'bad-id', startDate: '2025-06-01', endDate: '2025-06-07' } });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Invalid user ID');
  });

  test('returns 400 when startDate is missing', async () => {
    const event = makeEvent({ body: { userId: VALID_USER_ID, endDate: '2025-06-07' } });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toContain('startDate');
  });

  test('returns 400 when startDate is not a valid date', async () => {
    const event = makeEvent({ body: { userId: VALID_USER_ID, startDate: 'not-a-date', endDate: '2025-06-07' } });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toContain('startDate');
  });

  test('returns 400 when endDate is missing', async () => {
    const event = makeEvent({ body: { userId: VALID_USER_ID, startDate: '2025-06-01' } });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toContain('endDate');
  });

  test('returns 400 when endDate is not a valid date', async () => {
    const event = makeEvent({ body: { userId: VALID_USER_ID, startDate: '2025-06-01', endDate: 'not-a-date' } });
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toContain('endDate');
  });

  //  Success & DB edge-cases

  test('returns 201 with booking data for a valid payload', async () => {
    const event = makeEvent({
      body: { userId: VALID_USER_ID, startDate: '2025-06-01', endDate: '2025-06-07' },
    });
    const result = await handler(event);
    expect(result.statusCode).toBe(201);
    const booking = JSON.parse(result.body);
    expect(booking.userId).toBe(VALID_USER_ID);
    expect(booking.status).toBe('pending');
    expect(booking).toHaveProperty('_id');
    expect(booking).toHaveProperty('createdAt');
  });

  test('returns 404 when equipment document is not found', async () => {
    mockUpdateOne.mockResolvedValue({ matchedCount: 0 });
    const event = makeEvent({
      body: { userId: VALID_USER_ID, startDate: '2025-06-01', endDate: '2025-06-07' },
    });
    const result = await handler(event);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toContain('not found');
  });

  test('returns 500 when the DB write throws an error', async () => {
    mockUpdateOne.mockRejectedValue(new Error('DB connection lost'));
    const event = makeEvent({
      body: { userId: VALID_USER_ID, startDate: '2025-06-01', endDate: '2025-06-07' },
    });
    const result = await handler(event);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Unable to create booking');
  });
});
