const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Document = require('../models/Document');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const Payment = require('../models/Payment');
const ProductionOrder = require('../models/ProductionOrder');
const Inventory = require('../models/Inventory');
const PurchaseRequest = require('../models/PurchaseRequest');
const VendorPO = require('../models/VendorPO');
const QAInspection = require('../models/QAInspection');
const ServiceTicket = require('../models/ServiceTicket');
const RDProject = require('../models/RDProject');

const ApiError = require('../utils/apiError');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

// NOTIFICATIONS
const getNotifications = async (userId) => {
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(50);
};

const markNotificationRead = async (id, userId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
  if (!notif) throw ApiError.notFound('Notification not found');
  return notif;
};

// AUDIT TRAIL
const getAuditLogs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['action', 'module', 'documentNumber'], ['entityType', 'user']);
  const [items, total] = await Promise.all([
    AuditLog.find(filter).populate('user', 'name email role').sort(sort).skip(skip).limit(limit),
    AuditLog.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getEntityAuditLogs = async (entityType, entityId) => {
  return AuditLog.find({ entityType, entityId }).populate('user', 'name email role').sort({ createdAt: -1 });
};

// DOCUMENTS
const getDocuments = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['filename', 'originalName'], ['entityType', 'entityId', 'category']);
  const [items, total] = await Promise.all([
    Document.find(filter).populate('uploadedBy', 'name email').sort(sort).skip(skip).limit(limit),
    Document.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createDocumentMetadata = async (data, req) => {
  return Document.create({
    ...data,
    uploadedBy: req.user._id
  });
};

// REPORTS & ANALYTICS
const getSalesReport = async () => {
  const [totalLeads, convertedLeads, quotations, salesOrders] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: WORKFLOW_STATUS.LEAD.CONVERTED }),
    Quotation.find({ isLatestRevision: true }),
    SalesOrder.find({ status: { $ne: 'CANCELLED' } })
  ]);

  const totalSalesValue = salesOrders.reduce((sum, so) => sum + so.grandTotal, 0);
  const acceptedQuotes = quotations.filter((q) => q.status === WORKFLOW_STATUS.QUOTATION.ACCEPTED).length;

  return {
    leads: {
      total: totalLeads,
      converted: convertedLeads,
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) + '%' : '0%'
    },
    quotations: {
      total: quotations.length,
      accepted: acceptedQuotes,
      acceptanceRate: quotations.length > 0 ? ((acceptedQuotes / quotations.length) * 100).toFixed(2) + '%' : '0%'
    },
    salesOrders: {
      count: salesOrders.length,
      totalValue: totalSalesValue
    }
  };
};

const getProductionReport = async () => {
  const [planned, inProgress, completed, total] = await Promise.all([
    ProductionOrder.countDocuments({ status: WORKFLOW_STATUS.PRODUCTION_ORDER.PLANNED }),
    ProductionOrder.countDocuments({ status: { $in: ['IN_PROGRESS', 'FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY'] } }),
    ProductionOrder.countDocuments({ status: WORKFLOW_STATUS.PRODUCTION_ORDER.COMPLETED }),
    ProductionOrder.countDocuments()
  ]);

  return {
    total,
    planned,
    inProgress,
    completed
  };
};

const getQualityReport = async () => {
  const [passed, failed, scrapped, total] = await Promise.all([
    QAInspection.countDocuments({ status: WORKFLOW_STATUS.QA_INSPECTION.PASSED }),
    QAInspection.countDocuments({ status: WORKFLOW_STATUS.QA_INSPECTION.FAILED }),
    QAInspection.countDocuments({ status: WORKFLOW_STATUS.QA_INSPECTION.SCRAPPED }),
    QAInspection.countDocuments()
  ]);

  return {
    total,
    passed,
    failed,
    scrapped,
    passRate: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '100%'
  };
};

const getServiceReport = async () => {
  const [open, inProgress, closed, total] = await Promise.all([
    ServiceTicket.countDocuments({ status: WORKFLOW_STATUS.SERVICE_TICKET.OPEN }),
    ServiceTicket.countDocuments({ status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'DIAGNOSED', 'WAITING_FOR_PARTS'] } }),
    ServiceTicket.countDocuments({ status: WORKFLOW_STATUS.SERVICE_TICKET.CLOSED }),
    ServiceTicket.countDocuments()
  ]);

  return {
    total,
    open,
    inProgress,
    closed
  };
};

// MANAGEMENT DASHBOARD METRICS
const getDashboardMetrics = async () => {
  const [
    totalLeads,
    openQuotations,
    confirmedOrders,
    productionActive,
    materialShortages,
    qaPending,
    openServiceTickets,
    payments,
    salesOrders,
    rndProjects
  ] = await Promise.all([
    Lead.countDocuments({ status: { $in: ['NEW', 'CONTACTED', 'FOLLOW_UP'] } }),
    Quotation.countDocuments({ status: { $in: ['DRAFT', 'PENDING_APPROVAL', 'SENT', 'NEGOTIATION'] } }),
    SalesOrder.countDocuments({ status: { $ne: 'CANCELLED' } }),
    ProductionOrder.countDocuments({ status: { $in: ['RELEASED', 'MATERIAL_READY', 'IN_PROGRESS', 'FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY'] } }),
    PurchaseRequest.countDocuments({ status: { $in: ['APPROVED', 'DRAFT'] } }),
    QAInspection.countDocuments({ status: 'PENDING' }),
    ServiceTicket.countDocuments({ status: { $ne: 'CLOSED' } }),
    Payment.find({ status: WORKFLOW_STATUS.PAYMENT.VERIFIED }),
    SalesOrder.find({ status: { $ne: 'CANCELLED' } }),
    RDProject.countDocuments({ status: 'PROPOSED' })
  ]);

  const totalRevenue = salesOrders.reduce((sum, so) => sum + so.grandTotal, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, totalRevenue - totalCollected);

  return {
    sales: {
      activeLeads: totalLeads,
      openQuotations,
      confirmedOrders,
      totalRevenue,
      totalCollected,
      outstandingReceivables: outstanding
    },
    operations: {
      activeProductionJobs: productionActive,
      pendingMaterialProcurements: materialShortages,
      qaInspectionsPending: qaPending
    },
    customerSupport: {
      openServiceTickets
    },
    innovation: {
      rndProjectsPendingApproval: rndProjects
    }
  };
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
