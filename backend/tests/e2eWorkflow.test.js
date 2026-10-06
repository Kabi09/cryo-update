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

describe('Complete ERP Business Workflow E2E Test', () => {
  let salesToken;
  let managerToken;
  let accountsToken;
  let productionToken;
  let qaToken;
  let storeToken;

  let leadId;
  let customerId;
  let enquiryId;
  let quoteId;
  let revisedQuoteId;
  let piId;
  let poId;
  let salesOrderId;
  let prodOrderId;
  let qaInspectionId;
  let serialNumberString;

  beforeAll(async () => {
    // Authenticate all functional actors
    const [salesLog, mgrLog, accLog, prdLog, qaLog, strLog] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({ email: 'sales@cryo.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'salesmanager@cryo.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'accounts@cryo.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'production@cryo.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'qa@cryo.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'store@cryo.com', password: 'Password@123' })
    ]);

    salesToken = salesLog.body.data.tokens.accessToken;
    managerToken = mgrLog.body.data.tokens.accessToken;
    accountsToken = accLog.body.data.tokens.accessToken;
    productionToken = prdLog.body.data.tokens.accessToken;
    qaToken = qaLog.body.data.tokens.accessToken;
    storeToken = strLog.body.data.tokens.accessToken;
  });

  test('Step 1: Capture Lead', async () => {
    const res = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerName: 'Fortis Healthcare Research Division',
        contactPerson: 'Dr. M. Senthil',
        phone: '9840199887',
        email: 'senthil@fortis.in',
        requirement: '-80°C Ultra-Low Freezer'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.leadNumber).toMatch(/^LEAD-\d{6}$/);
    leadId = res.body.data._id;
  });

  test('Step 2: Qualify Lead and Link Customer', async () => {
    const res = await request(app)
      .post(`/api/v1/leads/${leadId}/qualify`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('QUALIFIED');
    expect(res.body.data.customer).toBeDefined();
    customerId = res.body.data.customer;
  });

  test('Step 3: Convert Lead to Enquiry', async () => {
    const res = await request(app)
      .post(`/api/v1/leads/${leadId}/convert-to-enquiry`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.enquiry).toBeDefined();
    enquiryId = res.body.data.enquiry._id;
  });

  test('Step 4: Create Commercial Quotation (R0)', async () => {
    const prodRes = await request(app)
      .get('/api/v1/master/products')
      .set('Authorization', `Bearer ${salesToken}`);
    const product = prodRes.body.data[0];

    const res = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customer: customerId,
        enquiry: enquiryId,
        lead: leadId,
        items: [
          {
            product: product._id,
            productName: product.name,
            quantity: 1,
            unitPrice: 1000000,
            discountPercent: 0,
            taxPercent: 18
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.revisionCode).toMatch(/-R0$/);
    quoteId = res.body.data._id;
  });

  test('Step 5: Submit and Approve Quotation R0', async () => {
    await request(app)
      .post(`/api/v1/quotations/${quoteId}/submit`)
      .set('Authorization', `Bearer ${salesToken}`);

    const appRes = await request(app)
      .post(`/api/v1/quotations/${quoteId}/approve`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(appRes.status).toBe(200);
    expect(appRes.body.data.status).toBe('APPROVED');
  });

  test('Step 6: Send Quotation & Record Negotiation', async () => {
    await request(app)
      .post(`/api/v1/quotations/${quoteId}/send`)
      .set('Authorization', `Bearer ${salesToken}`);

    const negRes = await request(app)
      .post(`/api/v1/quotations/${quoteId}/negotiate`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerMessage: 'Please provide 5% institutional discount',
        requestedPrice: 950000
      });

    expect(negRes.status).toBe(200);
    expect(negRes.body.data.status).toBe('NEGOTIATION');
  });

  test('Step 7: Create Revision R1 and Customer Acceptance', async () => {
    const revRes = await request(app)
      .post(`/api/v1/quotations/${quoteId}/revise`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        items: [
          {
            product: (await request(app).get('/api/v1/master/products').set('Authorization', `Bearer ${salesToken}`)).body.data[0]._id,
            productName: '-80°C Ultra-Low Freezer',
            quantity: 1,
            unitPrice: 950000,
            discountPercent: 5,
            taxPercent: 18
          }
        ]
      });

    expect(revRes.status).toBe(201);
    expect(revRes.body.data.revisionCode).toMatch(/-R1$/);
    revisedQuoteId = revRes.body.data._id;

    // Accept R1
    const accRes = await request(app)
      .post(`/api/v1/quotations/${revisedQuoteId}/accept`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ acceptedByCustomerPerson: 'Dr. M. Senthil' });

    expect(accRes.status).toBe(200);
    expect(accRes.body.data.status).toBe('ACCEPTED');
  });

  test('Step 8: Generate Proforma Invoice', async () => {
    const res = await request(app)
      .post('/api/v1/proforma-invoices')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        quotationId: revisedQuoteId,
        advancePercent: 30
      });

    expect(res.status).toBe(201);
    expect(res.body.data.piNumber).toMatch(/^PI-\d{6}$/);
    piId = res.body.data._id;
  });

  test('Step 9: Customer PO and Verification creating internal Sales Order', async () => {
    const cpoRes = await request(app)
      .post('/api/v1/customer-pos')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        quotation: revisedQuoteId,
        customerPoReference: 'FORTIS/PO/2026/088',
        customerPoDate: '2026-10-06'
      });
    poId = cpoRes.body.data._id;

    const verifyRes = await request(app)
      .post(`/api/v1/customer-pos/${poId}/verify`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ discrepancies: [] });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.customerPO.status).toBe('VERIFIED');
    expect(verifyRes.body.data.salesOrder).toBeDefined();
    salesOrderId = verifyRes.body.data.salesOrder._id;
  });

  test('Step 10: Advance Payment Gate releases Sales Order to Production', async () => {
    const soRes = await request(app)
      .get(`/api/v1/sales-orders/${salesOrderId}`)
      .set('Authorization', `Bearer ${salesToken}`);
    const advanceNeeded = soRes.body.data.advanceRequiredAmount;

    // Pay advance
    const payRes = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        salesOrder: salesOrderId,
        amount: advanceNeeded,
        paymentType: 'ADVANCE',
        paymentMethod: 'NEFT',
        transactionReference: 'NEFT-FORTIS-00998877'
      });

    const verifyPayRes = await request(app)
      .post(`/api/v1/payments/${payRes.body.data._id}/verify`)
      .set('Authorization', `Bearer ${accountsToken}`);

    expect(verifyPayRes.status).toBe(200);
    expect(verifyPayRes.body.data.salesOrder.advancePaid).toBe(true);
    expect(verifyPayRes.body.data.salesOrder.isReleasedToProduction).toBe(true);
    expect(verifyPayRes.body.data.salesOrder.status).toBe('RELEASED_TO_PRODUCTION');
  });

  test('Step 11: Production Planning & Material Requisition', async () => {
    const prodRes = await request(app)
      .post('/api/v1/production-orders')
      .set('Authorization', `Bearer ${productionToken}`)
      .send({
        salesOrder: salesOrderId,
        quantity: 1
      });

    expect(prodRes.status).toBe(201);
    expect(prodRes.body.data.productionOrderNumber).toMatch(/^PROD-\d{6}$/);
    prodOrderId = prodRes.body.data._id;

    // Request materials
    const mrRes = await request(app)
      .post(`/api/v1/production-orders/${prodOrderId}/request-materials`)
      .set('Authorization', `Bearer ${productionToken}`);

    expect(mrRes.status).toBe(200);
    expect(mrRes.body.data.materialRequest).toBeDefined();
  });

  test('Step 12: Advance Production Stages to Completion', async () => {
    // Advance FABRICATION
    await request(app)
      .post(`/api/v1/production-orders/${prodOrderId}/advance-stage`)
      .set('Authorization', `Bearer ${productionToken}`)
      .send({ nextStage: 'FABRICATION' });

    // Advance REFRIGERATION
    await request(app)
      .post(`/api/v1/production-orders/${prodOrderId}/advance-stage`)
      .set('Authorization', `Bearer ${productionToken}`)
      .send({ nextStage: 'REFRIGERATION' });

    // Advance ELECTRICAL
    await request(app)
      .post(`/api/v1/production-orders/${prodOrderId}/advance-stage`)
      .set('Authorization', `Bearer ${productionToken}`)
      .send({ nextStage: 'ELECTRICAL' });

    // Advance ASSEMBLY
    await request(app)
      .post(`/api/v1/production-orders/${prodOrderId}/advance-stage`)
      .set('Authorization', `Bearer ${productionToken}`)
      .send({ nextStage: 'ASSEMBLY' });

    // Complete Production
    const compRes = await request(app)
      .post(`/api/v1/production-orders/${prodOrderId}/advance-stage`)
      .set('Authorization', `Bearer ${productionToken}`)
      .send({ nextStage: 'COMPLETED' });

    expect(compRes.status).toBe(200);
    expect(compRes.body.data.status).toBe('COMPLETED');
    expect(compRes.body.data.qaInspection).toBeDefined();
    qaInspectionId = compRes.body.data.qaInspection;
  });

  test('Step 13: QA Testing & Serial Number Issuance', async () => {
    const passRes = await request(app)
      .post(`/api/v1/inspections/${qaInspectionId}/pass`)
      .set('Authorization', `Bearer ${qaToken}`)
      .send({
        testParameters: [
          { parameter: 'Pull-down test', expectedValue: '-80°C', actualValue: '-82.1°C', status: 'PASS' }
        ]
      });

    expect(passRes.status).toBe(200);
    expect(passRes.body.data.qa.result).toBe('PASSED');
    expect(passRes.body.data.serialNumber).toBeDefined();
    serialNumberString = passRes.body.data.serialNumber.serialNumber;
  });

  test('Step 14: Traceability Chain Verification', async () => {
    const traceRes = await request(app)
      .get(`/api/v1/serials/trace/${serialNumberString}`)
      .set('Authorization', `Bearer ${qaToken}`);

    expect(traceRes.status).toBe(200);
    expect(traceRes.body.data.serial.salesOrder._id).toBe(String(salesOrderId));
    expect(traceRes.body.data.serial.productionOrder._id).toBe(String(prodOrderId));
    expect(traceRes.body.data.serial.customer._id).toBe(String(customerId));
  });
});
