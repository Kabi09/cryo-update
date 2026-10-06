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

describe('QA & Serialization Tests', () => {
  let qaToken;
  let qaInspectionId;

  beforeAll(async () => {
    const qaLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'qa@cryo.com', password: 'Password@123' });
    qaToken = qaLogin.body.data.tokens.accessToken;

    const listRes = await request(app)
      .get('/api/v1/inspections')
      .set('Authorization', `Bearer ${qaToken}`);
    qaInspectionId = listRes.body.data[0]._id;
  });

  test('GET /api/v1/inspections - should list QA inspections', async () => {
    const res = await request(app)
      .get('/api/v1/inspections')
      .set('Authorization', `Bearer ${qaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/v1/serials - should list tracked serial numbers', async () => {
    const res = await request(app)
      .get('/api/v1/serials')
      .set('Authorization', `Bearer ${qaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].serialNumber).toMatch(/^CRYO-SN-\d{6}$/);
  });

  test('GET /api/v1/serials/trace/:serialNumber - should return full lifecycle traceability', async () => {
    const res = await request(app)
      .get('/api/v1/serials/trace/CRYO-SN-000001')
      .set('Authorization', `Bearer ${qaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serial).toBeDefined();
    expect(res.body.data.serial.salesOrder).toBeDefined();
    expect(res.body.data.serial.productionOrder).toBeDefined();
  });
});
