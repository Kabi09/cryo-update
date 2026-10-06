const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Maintenance
router.get('/tasks', requirePermission(PERMISSIONS.MAINTENANCE_VIEW), maintenanceController.getMaintenanceTasks);
router.post(
  '/tasks',
  requirePermission(PERMISSIONS.MAINTENANCE_MANAGE),
  validateBody({
    equipmentName: { required: true, type: 'string' },
    scheduledDate: { required: true, type: 'string' },
    taskDescription: { required: true, type: 'string' }
  }),
  maintenanceController.createMaintenanceTask
);
router.post('/tasks/:id/complete', requirePermission(PERMISSIONS.MAINTENANCE_MANAGE), maintenanceController.completeMaintenanceTask);

// R&D
router.get('/rnd', requirePermission(PERMISSIONS.RND_VIEW), maintenanceController.getRDProjects);
router.post(
  '/rnd',
  requirePermission(PERMISSIONS.RND_CREATE),
  validateBody({
    title: { required: true, type: 'string' },
    objective: { required: true, type: 'string' }
  }),
  maintenanceController.createRDProject
);
router.post('/rnd/:id/approve', requirePermission(PERMISSIONS.RND_APPROVE), maintenanceController.approveRDProject);
router.post('/rnd/:id/test-result', requirePermission(PERMISSIONS.RND_CREATE), maintenanceController.recordRDTestResult);

module.exports = router;
