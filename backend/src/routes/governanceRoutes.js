const express = require('express');
const governanceController = require('../controllers/governanceController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Notifications
router.get('/notifications', governanceController.getNotifications);
router.patch('/notifications/:id/read', governanceController.markNotificationRead);

// Audit Trail
router.get('/audit-logs', requirePermission(PERMISSIONS.AUDIT_VIEW), governanceController.getAuditLogs);
router.get('/audit-logs/:entityType/:entityId', requirePermission(PERMISSIONS.AUDIT_VIEW), governanceController.getEntityAuditLogs);

// Documents Metadata
router.get('/documents', governanceController.getDocuments);
router.post(
  '/documents',
  validateBody({
    filename: { required: true, type: 'string' },
    originalName: { required: true, type: 'string' },
    mimeType: { required: true, type: 'string' },
    size: { required: true, type: 'number' },
    storageKey: { required: true, type: 'string' },
    url: { required: true, type: 'string' },
    entityType: { required: true, type: 'string' },
    entityId: { required: true, type: 'string' }
  }),
  governanceController.createDocumentMetadata
);

// Reports
router.get('/reports/sales', requirePermission(PERMISSIONS.REPORTS_VIEW), governanceController.getSalesReport);
router.get('/reports/production', requirePermission(PERMISSIONS.REPORTS_VIEW), governanceController.getProductionReport);
router.get('/reports/quality', requirePermission(PERMISSIONS.REPORTS_VIEW), governanceController.getQualityReport);
router.get('/reports/service', requirePermission(PERMISSIONS.REPORTS_VIEW), governanceController.getServiceReport);

// Dashboard
router.get('/dashboard/metrics', governanceController.getDashboardMetrics);

module.exports = router;
