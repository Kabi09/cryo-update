const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

router.get('/stock', requirePermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getInventory);
router.get('/stock-ledger', requirePermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getStockLedger);
router.get('/low-stock', requirePermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getLowStockItems);

router.post(
  '/transfer',
  requirePermission(PERMISSIONS.INVENTORY_TRANSFER),
  validateBody({
    fromWarehouseId: { required: true, type: 'string' },
    toWarehouseId: { required: true, type: 'string' },
    materialId: { required: true, type: 'string' },
    quantity: { required: true, type: 'number', min: 0.001 }
  }),
  inventoryController.transferStock
);

router.post(
  '/adjust',
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  validateBody({
    warehouseId: { required: true, type: 'string' },
    materialId: { required: true, type: 'string' },
    actualPhysicalQuantity: { required: true, type: 'number', min: 0 },
    reason: { required: true, type: 'string' }
  }),
  inventoryController.adjustStock
);

module.exports = router;
