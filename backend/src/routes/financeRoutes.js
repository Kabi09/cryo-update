const express = require('express');
const financeController = require('../controllers/financeController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

router.get('/payments', requirePermission(PERMISSIONS.PAYMENT_VIEW), financeController.getPayments);
router.get('/payments/:id', requirePermission(PERMISSIONS.PAYMENT_VIEW), financeController.getPaymentById);
router.post(
  '/payments',
  requirePermission(PERMISSIONS.PAYMENT_CREATE),
  validateBody({
    salesOrder: { required: true, type: 'string' },
    amount: { required: true, type: 'number', min: 0.01 },
    transactionReference: { required: true, type: 'string' }
  }),
  financeController.recordPayment
);
router.post('/payments/:id/verify', requirePermission(PERMISSIONS.PAYMENT_VERIFY), financeController.verifyPayment);
router.post('/payments/:id/refund', requirePermission(PERMISSIONS.PAYMENT_REFUND), financeController.refundPayment);

router.get('/receivables-summary', requirePermission(PERMISSIONS.FINANCE_VIEW), financeController.getReceivablesSummary);
router.get('/payables-summary', requirePermission(PERMISSIONS.FINANCE_VIEW), financeController.getPayablesSummary);

router.post(
  '/three-way-match',
  requirePermission(PERMISSIONS.FINANCE_VIEW),
  validateBody({
    vendorPoId: { required: true, type: 'string' },
    grnId: { required: true, type: 'string' },
    invoiceAmount: { required: true, type: 'number', min: 0 }
  }),
  financeController.performThreeWayMatch
);

router.post('/invoices/:id/tally-sync', requirePermission(PERMISSIONS.FINANCE_MANAGE), financeController.syncFinalInvoiceToTally);

module.exports = router;
