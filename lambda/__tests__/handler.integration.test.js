'use strict';

/**
 * Integration tests against the live AWS Lambda / API Gateway endpoint.
 *
 * Required environment variables:
 *   INTEGRATION_TEST_TOKEN   – a valid JWT signed with the same JWTSECRET the Lambda uses
 *   TEST_EQUIPMENT_ID        – ObjectId of a dedicated test equipment document in MongoDB
 *
 * Optional:
 *   LAMBDA_URL               – override the default API Gateway base URL
 *
 * Run with:
 *   INTEGRATION_TEST_TOKEN=<jwt> TEST_EQUIPMENT_ID=<id> npm run test:integration
 */

const LAMBDA_URL = process.env.LAMBDA_URL || 'https://bvukez92l4.execute-api.eu-west-1.amazonaws.com/prod';
const AUTH_TOKEN = process.env.INTEGRATION_TEST_TOKEN;
const TEST_EQUIPMENT_ID = process.env.TEST_EQUIPMENT_ID;

// A valid ObjectId-format user ID used as the test booking owner
const TEST_USER_ID = '507f1f77bcf86cd799439099';

const skipAll = !AUTH_TOKEN || !TEST_EQUIPMENT_ID;

// eslint-disable-next-line jest/no-disabled-tests
const describeOrSkip = skipAll ? describe.skip : describe;

describeOrSkip('Lambda handler – integration tests (live endpoint)', () => {
  const bookingUrl = `${LAMBDA_URL}/equipment/${TEST_EQUIPMENT_ID}/bookings`;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  // ── Success path ───────────────────────────────────────────────────────────

  test('POST valid booking → 201 with correct booking shape', async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    const dayAfter  = new Date(Date.now() + 172_800_000).toISOString();

    const res = await fetch(bookingUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ userId: TEST_USER_ID, startDate: tomorrow, endDate: dayAfter }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty('_id');
    expect(data).toHaveProperty('status', 'pending');
    expect(data).toHaveProperty('userId', TEST_USER_ID);
    expect(data).toHaveProperty('startDate');
    expect(data).toHaveProperty('endDate');
  }, 15_000);

  // ── Validation errors ──────────────────────────────────────────────────────

  test('POST with missing fields → 400 with error message', async () => {
    const res = await fetch(bookingUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ startDate: '2025-06-01' }), // missing userId and endDate
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('message');
  }, 15_000);

  test('POST with invalid equipment ID → 400', async () => {
    const badUrl = `${LAMBDA_URL}/equipment/not-a-valid-id/bookings`;

    const res = await fetch(badUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain('Invalid equipment ID');
  }, 15_000);

  // ── Auth errors ────────────────────────────────────────────────────────────

  test('POST without Authorization header → 401', async () => {
    const res = await fetch(bookingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toHaveProperty('message', 'No token provided');
  }, 15_000);

  test('POST with an invalid JWT → 403', async () => {
    const res = await fetch(bookingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer this.is.not.a.real.token',
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data).toHaveProperty('message', 'Invalid or expired token');
  }, 15_000);

  // ── CORS preflight ─────────────────────────────────────────────────────────

  test('OPTIONS preflight → 200 with CORS headers', async () => {
    const res = await fetch(bookingUrl, {
      method: 'OPTIONS',
      headers: { Origin: 'https://atu-loaner-frontend-production.up.railway.app' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBeTruthy();
  }, 15_000);
});

// Guard message when env vars are missing
if (skipAll) {
  test('Integration tests skipped – set INTEGRATION_TEST_TOKEN and TEST_EQUIPMENT_ID to run', () => {
    console.warn('⚠️  Integration tests were skipped. Set the required env vars and re-run with: npm run test:integration');
    expect(true).toBe(true);
  });
}
