const express = require('express');
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// INSTALLATIONS
router.get('/installations', requirePermission(PERMISSIONS.INSTALLATION_VIEW), serviceController.getInstallations);
router.post(
  '/installations',
  requirePermission(PERMISSIONS.INSTALLATION_MANAGE),
  validateBody({
    serialNumber: { required: true, type: 'string' },
    assignedEngineer: { required: true, type: 'string' }
  }),
  serviceController.createInstallation
);
router.post('/installations/:id/commission', requirePermission(PERMISSIONS.INSTALLATION_MANAGE), serviceController.completeCommissioning);

// WARRANTIES
router.get('/warranties', requirePermission(PERMISSIONS.WARRANTY_VIEW), serviceController.getWarranties);
router.get('/warranties/check/:serialNumber', requirePermission(PERMISSIONS.WARRANTY_VIEW), serviceController.checkWarranty);

// SERVICE TICKETS
router.get('/service-tickets', requirePermission(PERMISSIONS.SERVICE_VIEW), serviceController.getServiceTickets);
router.get('/service-tickets/:id', requirePermission(PERMISSIONS.SERVICE_VIEW), serviceController.getServiceTicketById);
router.post(
  '/service-tickets',
  requirePermission(PERMISSIONS.SERVICE_CREATE),
  validateBody({
    serialNumber: { required: true, type: 'string' },
    complaintDescription: { required: true, type: 'string' }
  }),
  serviceController.createServiceTicket
);
router.post(
  '/service-tickets/:id/assign',
  requirePermission(PERMISSIONS.SERVICE_ASSIGN),
  validateBody({
    engineerId: { required: true, type: 'string' }
  }),
  serviceController.assignEngineer
);
router.post(
  '/service-tickets/:id/diagnose',
  requirePermission(PERMISSIONS.SERVICE_DIAGNOSE),
  validateBody({
    findings: { required: true, type: 'string' }
  }),
  serviceController.recordDiagnosis
);
router.post(
  '/service-tickets/:id/spares',
  requirePermission(PERMISSIONS.SERVICE_RESOLVE),
  validateBody({
    materialId: { required: true, type: 'string' },
    quantity: { required: true, type: 'number', min: 1 }
  }),
  serviceController.addSparePartsToTicket
);
router.post(
  '/service-tickets/:id/repair',
  requirePermission(PERMISSIONS.SERVICE_RESOLVE),
  validateBody({
    resolutionSummary: { required: true, type: 'string' }
  }),
  serviceController.completeServiceRepair
);
router.post('/service-tickets/:id/signoff', requirePermission(PERMISSIONS.SERVICE_CLOSE), serviceController.customerSignOffService);

// RMA
router.get('/rmas', requirePermission(PERMISSIONS.RMA_VIEW), serviceController.getRMAs);
router.get('/rmas/:id', requirePermission(PERMISSIONS.RMA_VIEW), serviceController.getRMAById);
router.post(
  '/rmas',
  requirePermission(PERMISSIONS.RMA_CREATE),
  validateBody({
    serialNumber: { required: true, type: 'string' },
    reasonForReturn: { required: true, type: 'string' }
  }),
  serviceController.createRMA
);
router.post('/rmas/:id/approve', requirePermission(PERMISSIONS.RMA_APPROVE), serviceController.approveRMA);
router.post('/rmas/:id/resolve', requirePermission(PERMISSIONS.RMA_CLOSE), serviceController.resolveRMA);

module.exports = router;
