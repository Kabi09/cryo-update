const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config/env');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUri);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Field Service & Warranty Tests', () => {
  let serviceToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'servicemanager@cryo.com', password: 'Password@123' });
    serviceToken = loginRes.body.data.tokens.accessToken;
  });

  test('GET /api/v1/warranties/check/:serialNumber - should check active warranty coverage', async () => {
    const res = await request(app)
      .get('/api/v1/warranties/check/CRYO-SN-000001')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasWarranty).toBe(true);
    expect(res.body.data.isValid).toBe(true);
  });

  test('GET /api/v1/service-tickets - should list service tickets', async () => {
    const res = await request(app)
      .get('/api/v1/service-tickets')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/v1/rmas - should list RMA records', async () => {
    const res = await request(app)
      .get('/api/v1/rmas')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
