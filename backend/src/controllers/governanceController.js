const governanceService = require('../services/governanceService');
const ApiResponse = require('../utils/apiResponse');

// Notifications
const getNotifications = async (req, res, next) => {
  try {
    const list = await governanceService.getNotifications(req.user._id);
    return ApiResponse.success(res, { data: list });
  } catch (error) { next(error); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await governanceService.markNotificationRead(req.params.id, req.user._id);
    return ApiResponse.success(res, { data: notif });
  } catch (error) { next(error); }
};

// Audit Trail
const getAuditLogs = async (req, res, next) => {
  try {
    const result = await governanceService.getAuditLogs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getEntityAuditLogs = async (req, res, next) => {
  try {
    const list = await governanceService.getEntityAuditLogs(req.params.entityType, req.params.entityId);
    return ApiResponse.success(res, { data: list });
  } catch (error) { next(error); }
};

// Documents
const getDocuments = async (req, res, next) => {
  try {
    const result = await governanceService.getDocuments(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createDocumentMetadata = async (req, res, next) => {
  try {
    const doc = await governanceService.createDocumentMetadata(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Document metadata logged', data: doc });
  } catch (error) { next(error); }
};

// Reports
const getSalesReport = async (req, res, next) => {
  try {
    const report = await governanceService.getSalesReport();
    return ApiResponse.success(res, { data: report });
  } catch (error) { next(error); }
};

const getProductionReport = async (req, res, next) => {
  try {
    const report = await governanceService.getProductionReport();
    return ApiResponse.success(res, { data: report });
  } catch (error) { next(error); }
};

const getQualityReport = async (req, res, next) => {
  try {
    const report = await governanceService.getQualityReport();
    return ApiResponse.success(res, { data: report });
  } catch (error) { next(error); }
};

const getServiceReport = async (req, res, next) => {
  try {
    const report = await governanceService.getServiceReport();
    return ApiResponse.success(res, { data: report });
  } catch (error) { next(error); }
};

// Dashboard
const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await governanceService.getDashboardMetrics();
    return ApiResponse.success(res, { data: metrics });
  } catch (error) { next(error); }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  getAuditLogs,
  getEntityAuditLogs,
  getDocuments,
  createDocumentMetadata,
  getSalesReport,
  getProductionReport,
  getQualityReport,
  getServiceReport,
  getDashboardMetrics
};
