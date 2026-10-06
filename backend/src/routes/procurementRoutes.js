const express = require('express');
const procurementController = require('../controllers/procurementController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Purchase Requests
router.get('/purchase-requests', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getPurchaseRequests);
router.get('/purchase-requests/:id', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getPurchaseRequestById);
router.post(
  '/purchase-requests',
  requirePermission(PERMISSIONS.PROCUREMENT_CREATE),
  validateBody({
    items: { required: true, type: 'array' }
  }),
  procurementController.createPurchaseRequest
);
router.post('/purchase-requests/:id/approve', requirePermission(PERMISSIONS.PROCUREMENT_APPROVE), procurementController.approvePurchaseRequest);

// RFQ
router.get('/rfqs', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getRFQs);
router.get('/rfqs/:id', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getRFQById);
router.post(
  '/rfqs',
  requirePermission(PERMISSIONS.PROCUREMENT_RFQ),
  validateBody({
    purchaseRequest: { required: true, type: 'string' }
  }),
  procurementController.createRFQ
);
router.post(
  '/rfqs/:id/select-vendor',
  requirePermission(PERMISSIONS.PROCUREMENT_VENDOR_SELECT),
  validateBody({
    vendorId: { required: true, type: 'string' }
  }),
  procurementController.selectVendorForRFQ
);

// Vendor Quotations
router.get('/rfqs/:rfqId/vendor-quotations', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getVendorQuotations);
router.post(
  '/vendor-quotations',
  requirePermission(PERMISSIONS.PROCUREMENT_CREATE),
  validateBody({
    rfq: { required: true, type: 'string' },
    vendor: { required: true, type: 'string' },
    quotationReference: { required: true, type: 'string' },
    totalAmount: { required: true, type: 'number', min: 0 }
  }),
  procurementController.recordVendorQuotation
);

// Vendor PO
router.get('/vendor-pos', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getVendorPOs);
router.get('/vendor-pos/:id', requirePermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getVendorPOById);
router.post(
  '/vendor-pos',
  requirePermission(PERMISSIONS.PROCUREMENT_PO_CREATE),
  validateBody({
    vendor: { required: true, type: 'string' },
    items: { required: true, type: 'array' }
  }),
  procurementController.createVendorPO
);
router.post('/vendor-pos/:id/approve', requirePermission(PERMISSIONS.PROCUREMENT_PO_APPROVE), procurementController.approveVendorPO);

// GRN
router.get('/grns', requirePermission(PERMISSIONS.GRN_VIEW), procurementController.getGRNs);
router.get('/grns/:id', requirePermission(PERMISSIONS.GRN_VIEW), procurementController.getGRNById);
router.post(
  '/grns',
  requirePermission(PERMISSIONS.GRN_CREATE),
  validateBody({
    vendorPo: { required: true, type: 'string' },
    warehouse: { required: true, type: 'string' },
    challanNumber: { required: true, type: 'string' },
    items: { required: true, type: 'array' }
  }),
  procurementController.createGRN
);

module.exports = router;
