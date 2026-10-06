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

describe('Inventory & Stock Movement Tests', () => {
  let storeToken;
  let warehouse1Id;
  let warehouse2Id;
  let materialId;

  beforeAll(async () => {
    const storeLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'store@cryo.com', password: 'Password@123' });
    storeToken = storeLogin.body.data.tokens.accessToken;

    const whRes = await request(app)
      .get('/api/v1/master/warehouses')
      .set('Authorization', `Bearer ${storeToken}`);
    const sourceWh = whRes.body.data.find((w) => w.isDefault) || whRes.body.data[0];
    const destWh = whRes.body.data.find((w) => !w.isDefault) || whRes.body.data[1];
    warehouse1Id = sourceWh._id;
    warehouse2Id = destWh._id;

    const stockRes = await request(app)
      .get(`/api/v1/stock?warehouse=${warehouse1Id}`)
      .set('Authorization', `Bearer ${storeToken}`);
    if (stockRes.body.data && stockRes.body.data.length > 0) {
      materialId = stockRes.body.data[0].material._id || stockRes.body.data[0].material;
    } else {
      const matRes = await request(app)
        .get('/api/v1/master/materials')
        .set('Authorization', `Bearer ${storeToken}`);
      materialId = matRes.body.data[0]._id;
    }
  });

  test('GET /api/v1/stock - should list current warehouse stock', async () => {
    const res = await request(app)
      .get('/api/v1/stock')
      .set('Authorization', `Bearer ${storeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/v1/transfer - should transfer material between warehouses and post to stock ledger', async () => {
    const res = await request(app)
      .post('/api/v1/transfer')
      .set('Authorization', `Bearer ${storeToken}`)
      .send({
        fromWarehouseId: warehouse1Id,
        toWarehouseId: warehouse2Id,
        materialId,
        quantity: 1
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.destInv.quantityOnHand).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/v1/adjust - should adjust stock variance and record audit', async () => {
    const res = await request(app)
      .post('/api/v1/adjust')
      .set('Authorization', `Bearer ${storeToken}`)
      .send({
        warehouseId: warehouse1Id,
        materialId,
        actualPhysicalQuantity: 25,
        reason: 'Periodic physical audit count'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inventory.quantityOnHand).toBe(25);
  });

  test('GET /api/v1/stock-ledger - should return stock movements audit trail', async () => {
    const res = await request(app)
      .get('/api/v1/stock-ledger')
      .set('Authorization', `Bearer ${storeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
