'use strict';

const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Reuse DB connection across warm Lambda invocations
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.DB_CONN_STRING);
  await client.connect();
  cachedClient = client;
  return client;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // 1. Validate JWT from Authorization header
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'No token provided' })
    };
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWTSECRET);
  } catch (err) {
    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Invalid or expired token' })
    };
  }

  // 2. Validate equipment ID path parameter
  const equipmentId = event.pathParameters?.id;
  if (!equipmentId || !ObjectId.isValid(equipmentId)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: `Invalid equipment ID: ${equipmentId}` })
    };
  }

  // 3. Parse and validate request body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Invalid JSON body' })
    };
  }

  const { userId, startDate, endDate } = body;

  if (!userId || !ObjectId.isValid(userId)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Invalid user ID' })
    };
  }
  if (!startDate || isNaN(Date.parse(startDate))) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Invalid startDate – must be an ISO date string' })
    };
  }
  if (!endDate || isNaN(Date.parse(endDate))) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Invalid endDate – must be an ISO date string' })
    };
  }

  // 4. Persist booking to MongoDB Atlas
  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.DB_NAME || 'lab_equipment_loaner_project');
    const equipmentCollection = db.collection('equipment');

    const booking = {
      _id: new ObjectId(),
      userId: userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await equipmentCollection.updateOne(
      { _id: new ObjectId(equipmentId) },
      { $push: { bookings: booking }, $set: { status: 'unavailable', updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: `Equipment item with ID ${equipmentId} not found` })
      };
    }

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(booking)
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Unable to create booking' })
    };
  }
};
