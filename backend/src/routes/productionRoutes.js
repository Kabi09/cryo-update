const express = require('express');
const productionController = require('../controllers/productionController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// BOM
router.get('/boms', requirePermission(PERMISSIONS.BOM_VIEW), productionController.getBOMs);
router.get('/boms/:id', requirePermission(PERMISSIONS.BOM_VIEW), productionController.getBOMById);
router.post(
  '/boms',
  requirePermission(PERMISSIONS.BOM_CREATE),
  validateBody({
    product: { required: true, type: 'string' },
    components: { required: true, type: 'array' }
  }),
  productionController.createBOM
);
router.post('/boms/:id/approve', requirePermission(PERMISSIONS.BOM_APPROVE), productionController.approveBOM);

// PRODUCTION ORDERS
router.get('/production-orders', requirePermission(PERMISSIONS.PRODUCTION_VIEW), productionController.getProductionOrders);
router.get('/production-orders/:id', requirePermission(PERMISSIONS.PRODUCTION_VIEW), productionController.getProductionOrderById);
router.post(
  '/production-orders',
  requirePermission(PERMISSIONS.PRODUCTION_CREATE),
  validateBody({
    salesOrder: { required: true, type: 'string' }
  }),
  productionController.createProductionOrder
);
router.post('/production-orders/:id/release', requirePermission(PERMISSIONS.PRODUCTION_RELEASE), productionController.releaseProductionOrder);
router.post('/production-orders/:id/request-materials', requirePermission(PERMISSIONS.PRODUCTION_UPDATE), productionController.requestMaterials);
router.post('/production-orders/:id/advance-stage', requirePermission(PERMISSIONS.PRODUCTION_UPDATE), productionController.advanceStage);

// MATERIAL REQUEST ISSUANCE
router.post('/material-requests/:id/issue', requirePermission(PERMISSIONS.INVENTORY_ISSUE), productionController.issueMaterials);

module.exports = router;
