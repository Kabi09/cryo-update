const express = require('express');
const logisticsController = require('../controllers/logisticsController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Finished Goods
router.get('/finished-goods', requirePermission(PERMISSIONS.SERIAL_VIEW), logisticsController.getFinishedGoods);

// Packing
router.get('/packing', requirePermission(PERMISSIONS.PACKING_VIEW), logisticsController.getPackings);
router.post(
  '/packing',
  requirePermission(PERMISSIONS.PACKING_MANAGE),
  validateBody({
    salesOrder: { required: true, type: 'string' },
    serialNumbers: { required: true, type: 'array' }
  }),
  logisticsController.createPacking
);

// Final Invoice
router.get('/final-invoices', requirePermission(PERMISSIONS.FINANCE_VIEW), logisticsController.getFinalInvoices);
router.get('/final-invoices/:id', requirePermission(PERMISSIONS.FINANCE_VIEW), logisticsController.getFinalInvoiceById);
router.post(
  '/final-invoices',
  requirePermission(PERMISSIONS.FINANCE_MANAGE),
  validateBody({
    salesOrderId: { required: true, type: 'string' }
  }),
  logisticsController.createFinalInvoice
);

// Dispatch
router.get('/dispatch', requirePermission(PERMISSIONS.DISPATCH_VIEW), logisticsController.getDispatches);
router.post(
  '/dispatch',
  requirePermission(PERMISSIONS.DISPATCH_CREATE),
  validateBody({
    salesOrder: { required: true, type: 'string' },
    finalInvoice: { required: true, type: 'string' },
    packing: { required: true, type: 'string' },
    serialNumbers: { required: true, type: 'array' },
    transporterName: { required: true, type: 'string' },
    trackingNumber: { required: true, type: 'string' }
  }),
  logisticsController.createDispatch
);

// Delivery & POD
router.get('/deliveries', requirePermission(PERMISSIONS.DELIVERY_VIEW), logisticsController.getDeliveries);
router.post(
  '/dispatch/:dispatchId/pod',
  requirePermission(PERMISSIONS.DELIVERY_UPDATE),
  validateBody({
    receivedBy: { required: true, type: 'string' }
  }),
  logisticsController.completePOD
);
router.post(
  '/dispatch/:dispatchId/fail-delivery',
  requirePermission(PERMISSIONS.DELIVERY_UPDATE),
  validateBody({
    reason: { required: true, type: 'string' }
  }),
  logisticsController.recordDeliveryFailure
);

module.exports = router;
