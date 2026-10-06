const express = require('express');
const salesController = require('../controllers/salesController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// LEADS
router.get('/leads', requirePermission(PERMISSIONS.LEAD_VIEW), salesController.getLeads);
router.get('/leads/:id', requirePermission(PERMISSIONS.LEAD_VIEW), salesController.getLeadById);
router.post(
  '/leads',
  requirePermission(PERMISSIONS.LEAD_CREATE),
  validateBody({
    customerName: { required: true, type: 'string' },
    contactPerson: { required: true, type: 'string' },
    phone: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    requirement: { required: true, type: 'string' }
  }),
  salesController.createLead
);
router.patch('/leads/:id', requirePermission(PERMISSIONS.LEAD_UPDATE), salesController.updateLead);
router.post('/leads/:id/qualify', requirePermission(PERMISSIONS.LEAD_QUALIFY), salesController.qualifyLead);
router.post(
  '/leads/:id/follow-ups',
  requirePermission(PERMISSIONS.LEAD_UPDATE),
  validateBody({
    discussion: { required: true, type: 'string' }
  }),
  salesController.addFollowUp
);
router.post('/leads/:id/convert-to-enquiry', requirePermission(PERMISSIONS.LEAD_CONVERT), salesController.convertToEnquiry);
router.post('/leads/:id/mark-lost', requirePermission(PERMISSIONS.LEAD_UPDATE), salesController.markLeadLost);

// ENQUIRIES
router.get('/enquiries', requirePermission(PERMISSIONS.ENQUIRY_VIEW), salesController.getEnquiries);
router.get('/enquiries/:id', requirePermission(PERMISSIONS.ENQUIRY_VIEW), salesController.getEnquiryById);
router.post(
  '/enquiries',
  requirePermission(PERMISSIONS.ENQUIRY_CREATE),
  validateBody({
    lead: { required: true, type: 'string' },
    customer: { required: true, type: 'string' }
  }),
  salesController.createEnquiry
);

// QUOTATIONS
router.get('/quotations', requirePermission(PERMISSIONS.QUOTATION_VIEW), salesController.getQuotations);
router.get('/quotations/:id', requirePermission(PERMISSIONS.QUOTATION_VIEW), salesController.getQuotationById);
router.post(
  '/quotations',
  requirePermission(PERMISSIONS.QUOTATION_CREATE),
  validateBody({
    customer: { required: true, type: 'string' },
    items: { required: true, type: 'array' }
  }),
  salesController.createQuotation
);
router.post('/quotations/:id/submit', requirePermission(PERMISSIONS.QUOTATION_SUBMIT), salesController.submitQuotation);
router.post('/quotations/:id/approve', requirePermission(PERMISSIONS.QUOTATION_APPROVE), salesController.approveQuotation);
router.post('/quotations/:id/reject', requirePermission(PERMISSIONS.QUOTATION_REJECT), salesController.rejectQuotation);
router.post('/quotations/:id/send', requirePermission(PERMISSIONS.QUOTATION_SEND), salesController.sendQuotation);
router.post(
  '/quotations/:id/negotiate',
  requirePermission(PERMISSIONS.QUOTATION_UPDATE),
  validateBody({
    customerMessage: { required: true, type: 'string' }
  }),
  salesController.negotiateQuotation
);
router.post('/quotations/:id/revise', requirePermission(PERMISSIONS.QUOTATION_REVISE), salesController.reviseQuotation);
router.post('/quotations/:id/accept', requirePermission(PERMISSIONS.QUOTATION_ACCEPT), salesController.acceptQuotation);

// PROFORMA INVOICES
router.get('/proforma-invoices', requirePermission(PERMISSIONS.QUOTATION_VIEW), salesController.getProformaInvoices);
router.get('/proforma-invoices/:id', requirePermission(PERMISSIONS.QUOTATION_VIEW), salesController.getProformaInvoiceById);
router.post(
  '/proforma-invoices',
  requirePermission(PERMISSIONS.QUOTATION_CREATE),
  validateBody({
    quotationId: { required: true, type: 'string' }
  }),
  salesController.createProformaInvoice
);

// CUSTOMER PO
router.get('/customer-pos', requirePermission(PERMISSIONS.CUSTOMER_PO_VIEW), salesController.getCustomerPOs);
router.get('/customer-pos/:id', requirePermission(PERMISSIONS.CUSTOMER_PO_VIEW), salesController.getCustomerPOById);
router.post(
  '/customer-pos',
  requirePermission(PERMISSIONS.CUSTOMER_PO_CREATE),
  validateBody({
    quotation: { required: true, type: 'string' },
    customerPoReference: { required: true, type: 'string' },
    customerPoDate: { required: true, type: 'string' }
  }),
  salesController.createCustomerPO
);
router.post('/customer-pos/:id/verify', requirePermission(PERMISSIONS.CUSTOMER_PO_VERIFY), salesController.verifyCustomerPO);
router.post(
  '/customer-pos/:id/resolve-mismatch',
  requirePermission(PERMISSIONS.CUSTOMER_PO_VERIFY),
  validateBody({
    resolutionNotes: { required: true, type: 'string' }
  }),
  salesController.resolveCustomerPOMismatch
);

// SALES ORDERS
router.get('/sales-orders', requirePermission(PERMISSIONS.SALES_ORDER_VIEW), salesController.getSalesOrders);
router.get('/sales-orders/:id', requirePermission(PERMISSIONS.SALES_ORDER_VIEW), salesController.getSalesOrderById);
router.post('/sales-orders/:id/cancel', requirePermission(PERMISSIONS.SALES_ORDER_CANCEL), salesController.cancelSalesOrder);
router.get('/sales-orders/:id/timeline', requirePermission(PERMISSIONS.SALES_ORDER_VIEW), salesController.getSalesOrderTimeline);
router.get('/sales-orders/:id/traceability', requirePermission(PERMISSIONS.SALES_ORDER_VIEW), salesController.getSalesOrderTraceability);

module.exports = router;
