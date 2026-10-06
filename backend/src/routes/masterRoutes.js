const express = require('express');
const masterController = require('../controllers/masterController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Customers
router.get('/customers', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getCustomers);
router.get('/customers/:id', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getCustomerById);
router.post(
  '/customers',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    companyName: { required: true, type: 'string' },
    contactPerson: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    phone: { required: true, type: 'string' }
  }),
  masterController.createCustomer
);
router.patch('/customers/:id', requirePermission(PERMISSIONS.MASTER_MANAGE), masterController.updateCustomer);

// Products
router.get('/products', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getProducts);
router.get('/products/:id', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getProductById);
router.post(
  '/products',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    name: { required: true, type: 'string' },
    modelNumber: { required: true, type: 'string' },
    standardPrice: { required: true, type: 'number', min: 0 }
  }),
  masterController.createProduct
);
router.patch('/products/:id', requirePermission(PERMISSIONS.MASTER_MANAGE), masterController.updateProduct);

// Materials
router.get('/materials', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getMaterials);
router.get('/materials/:id', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getMaterialById);
router.post(
  '/materials',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    name: { required: true, type: 'string' },
    unitOfMeasure: { required: true, type: 'string' }
  }),
  masterController.createMaterial
);
router.patch('/materials/:id', requirePermission(PERMISSIONS.MASTER_MANAGE), masterController.updateMaterial);

// Vendors
router.get('/vendors', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getVendors);
router.get('/vendors/:id', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getVendorById);
router.post(
  '/vendors',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    name: { required: true, type: 'string' },
    contactPerson: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    phone: { required: true, type: 'string' }
  }),
  masterController.createVendor
);
router.patch('/vendors/:id', requirePermission(PERMISSIONS.MASTER_MANAGE), masterController.updateVendor);

// Warehouses
router.get('/warehouses', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getWarehouses);
router.post(
  '/warehouses',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    code: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    location: { required: true, type: 'string' }
  }),
  masterController.createWarehouse
);

// Work Centers
router.get('/work-centers', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getWorkCenters);
router.post(
  '/work-centers',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    code: { required: true, type: 'string' },
    name: { required: true, type: 'string' }
  }),
  masterController.createWorkCenter
);

// Transporters
router.get('/transporters', requirePermission(PERMISSIONS.MASTER_VIEW), masterController.getTransporters);
router.post(
  '/transporters',
  requirePermission(PERMISSIONS.MASTER_MANAGE),
  validateBody({
    code: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    phone: { required: true, type: 'string' }
  }),
  masterController.createTransporter
);

// Configurations
router.get('/configurations', requirePermission(PERMISSIONS.SETTINGS_MANAGE), masterController.getConfigurations);
router.post(
  '/configurations',
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  validateBody({
    key: { required: true, type: 'string' }
  }),
  masterController.setConfiguration
);

module.exports = router;
