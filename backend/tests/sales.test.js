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

describe('Sales Workflow Integration Tests', () => {
  let salesToken;
  let managerToken;
  let customerId;
  let createdLeadId;
  let createdQuoteId;
  let createdPoId;

  beforeAll(async () => {
    const salesLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sales@cryo.com', password: 'Password@123' });
    salesToken = salesLogin.body.data.tokens.accessToken;

    const managerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'salesmanager@cryo.com', password: 'Password@123' });
    managerToken = managerLogin.body.data.tokens.accessToken;

    const custRes = await request(app)
      .get('/api/v1/master/customers')
      .set('Authorization', `Bearer ${salesToken}`);
    customerId = custRes.body.data[0]._id;
  });

  test('POST /api/v1/leads - should create a new Lead with auto-numbering', async () => {
    const res = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerName: 'Apollo Research Center',
        contactPerson: 'Dr. Anand',
        phone: '9840055667',
        email: 'anand@apollo.org',
        requirement: 'Blood Bank Refrigerator 300L'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leadNumber).toMatch(/^LEAD-\d{6}$/);
    expect(res.body.data.status).toBe('NEW');
    createdLeadId = res.body.data._id;
  });

  test('POST /api/v1/leads/:id/qualify - should qualify lead and link customer', async () => {
    const res = await request(app)
      .post(`/api/v1/leads/${createdLeadId}/qualify`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('QUALIFIED');
    expect(res.body.data.customer).toBeDefined();
  });

  test('POST /api/v1/quotations - should create quotation draft with revision R0', async () => {
    const res = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customer: customerId,
        lead: createdLeadId,
        items: [
          {
            product: new mongoose.Types.ObjectId(),
            productName: '-80°C Cryo Freezer',
            quantity: 1,
            unitPrice: 1000000,
            discountPercent: 0,
            taxPercent: 18
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.revisionCode).toMatch(/^QT-\d{6}-R0$/);
    expect(res.body.data.grandTotal).toBe(1180000);
    expect(res.body.data.status).toBe('DRAFT');
    createdQuoteId = res.body.data._id;
  });

  test('POST /api/v1/quotations/:id/submit - should submit quotation for approval', async () => {
    const res = await request(app)
      .post(`/api/v1/quotations/${createdQuoteId}/submit`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
  });

  test('POST /api/v1/quotations/:id/approve - should approve quotation by manager', async () => {
    const res = await request(app)
      .post(`/api/v1/quotations/${createdQuoteId}/approve`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  test('POST /api/v1/quotations/:id/accept - should accept quotation by customer', async () => {
    const res = await request(app)
      .post(`/api/v1/quotations/${createdQuoteId}/accept`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ acceptedByCustomerPerson: 'Procurement Head' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  test('POST /api/v1/customer-pos - should record customer PO', async () => {
    const res = await request(app)
      .post('/api/v1/customer-pos')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        quotation: createdQuoteId,
        customerPoReference: 'APOLLO/PO/2026/001',
        customerPoDate: '2026-10-06'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.poNumber).toMatch(/^CPO-\d{6}$/);
    expect(res.body.data.status).toBe('RECEIVED');
    createdPoId = res.body.data._id;
  });

  test('POST /api/v1/customer-pos/:id/verify - should verify PO and create internal Sales Order', async () => {
    const res = await request(app)
      .post(`/api/v1/customer-pos/${createdPoId}/verify`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ discrepancies: [] });

    expect(res.status).toBe(200);
    expect(res.body.data.customerPO.status).toBe('VERIFIED');
    expect(res.body.data.salesOrder).toBeDefined();
    expect(res.body.data.salesOrder.salesOrderNumber).toMatch(/^SO-\d{6}$/);
  });
});
