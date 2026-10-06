const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config/env');
const User = require('../src/models/User');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUri);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication & RBAC Tests', () => {
  let adminToken;
  let salesToken;

  test('POST /api/v1/auth/login - should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@cryo.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login - should successfully login admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@cryo.com', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    adminToken = res.body.data.tokens.accessToken;
  });

  test('POST /api/v1/auth/login - should successfully login sales executive', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sales@cryo.com', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    salesToken = res.body.data.tokens.accessToken;
  });

  test('GET /api/v1/auth/me - should get user profile with Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@cryo.com');
  });

  test('GET /api/v1/auth/me - should reject request without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('RBAC - Sales executive should be forbidden from accessing admin settings', async () => {
    const res = await request(app)
      .get('/api/v1/master/configurations')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
