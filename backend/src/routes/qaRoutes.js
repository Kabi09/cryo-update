const express = require('express');
const qaController = require('../controllers/qaController');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

// QA INSPECTIONS
router.get('/inspections', requirePermission(PERMISSIONS.QA_VIEW), qaController.getQAInspections);
router.get('/inspections/:id', requirePermission(PERMISSIONS.QA_VIEW), qaController.getQAInspectionById);
router.post('/inspections/:id/pass', requirePermission(PERMISSIONS.QA_PASS), qaController.passQAInspection);
router.post('/inspections/:id/fail', requirePermission(PERMISSIONS.QA_FAIL), qaController.failQAInspection);
router.post('/inspections/:id/retest', requirePermission(PERMISSIONS.QA_RETEST), qaController.retestQAInspection);

// SERIAL NUMBERS & TRACEABILITY
router.get('/serials', requirePermission(PERMISSIONS.SERIAL_VIEW), qaController.getSerialNumbers);
router.get('/serials/:id', requirePermission(PERMISSIONS.SERIAL_VIEW), qaController.getSerialNumberById);
router.get('/serials/trace/:serialNumber', requirePermission(PERMISSIONS.SERIAL_VIEW), qaController.getSerialNumberTrace);

module.exports = router;
