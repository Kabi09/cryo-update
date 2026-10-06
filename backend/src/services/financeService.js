const Payment = require('../models/Payment');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const FinalInvoice = require('../models/FinalInvoice');
const VendorPO = require('../models/VendorPO');
const GRN = require('../models/GRN');
const Configuration = require('../models/Configuration');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const { createNotification } = require('../notifications/notificationService');
const WORKFLOW_STATUS = require('../constants/workflowStatus');
const ROLES = require('../constants/roles');

// PAYMENTS
const getPayments = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['paymentReference', 'transactionReference'], ['status', 'customer', 'salesOrder', 'paymentType']);
  const [items, total] = await Promise.all([
    Payment.find(filter).populate('customer').populate('salesOrder').sort(sort).skip(skip).limit(limit),
    Payment.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getPaymentById = async (id) => {
  const payment = await Payment.findById(id).populate('customer').populate('salesOrder').populate('proformaInvoice').populate('finalInvoice');
  if (!payment) throw ApiError.notFound('Payment record not found');
  return payment;
};

const recordPayment = async (data, req) => {
  const paymentReference = await getNextSequence('PAYMENT');
  const salesOrder = await SalesOrder.findById(data.salesOrder);
  if (!salesOrder) throw ApiError.notFound('Sales order not found');

  const payment = await Payment.create({
    ...data,
    paymentReference,
    customer: salesOrder.customer,
    status: WORKFLOW_STATUS.PAYMENT.RECEIVED,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.PAYMENT.RECEIVED,
        changedBy: req.user._id,
        remarks: 'Payment recorded by customer/sales'
      }
    ]
  });

  await createNotification({
    role: ROLES.ACCOUNTS,
    type: 'PAYMENT_VERIFICATION_REQUIRED',
    title: 'Payment Verification Required',
    message: `Payment of ₹${payment.amount} recorded for SO ${salesOrder.salesOrderNumber}. Please verify bank receipt.`,
    entityType: 'Payment',
    entityId: payment._id
  });

  await recordAudit({
    req,
    action: 'RECORD_PAYMENT',
    module: 'PAYMENT',
    entityType: 'Payment',
    entityId: payment._id,
    documentNumber: payment.paymentReference,
    remarks: `Amount ₹${payment.amount} (Ref: ${payment.transactionReference})`
  });

  return payment;
};

const verifyPayment = async (id, req) => {
  const payment = await Payment.findById(id).populate('salesOrder');
  if (!payment) throw ApiError.notFound('Payment record not found');

  payment.status = WORKFLOW_STATUS.PAYMENT.VERIFIED;
  payment.verifiedBy = req.user._id;
  payment.verifiedAt = new Date();
  payment.statusHistory.push({
    status: WORKFLOW_STATUS.PAYMENT.VERIFIED,
    changedBy: req.user._id,
    remarks: 'Payment verified and deposited in bank'
  });
  await payment.save();

  // Update Sales Order paid amount & release gate
  const salesOrder = await SalesOrder.findById(payment.salesOrder._id);
  salesOrder.totalPaidAmount = (salesOrder.totalPaidAmount || 0) + payment.amount;

  // Retrieve client-configurable advance percentage rule
  const configDoc = await Configuration.findOne({ key: 'ADVANCE_PAYMENT_RELEASE_PCT' });
  const advanceThresholdPct = configDoc && configDoc.value !== undefined ? Number(configDoc.value) : 30;
  const advanceRequired = (salesOrder.grandTotal * advanceThresholdPct) / 100;

  if (salesOrder.totalPaidAmount >= advanceRequired) {
    salesOrder.advancePaid = true;
    salesOrder.isReleasedToProduction = true;
    salesOrder.releasedAt = new Date();
    salesOrder.releasedBy = req.user._id;
    salesOrder.status = WORKFLOW_STATUS.SALES_ORDER.RELEASED_TO_PRODUCTION;
    salesOrder.statusHistory.push({
      status: WORKFLOW_STATUS.SALES_ORDER.RELEASED_TO_PRODUCTION,
      changedBy: req.user._id,
      remarks: `Advance payment threshold of ${advanceThresholdPct}% met (Paid: ₹${salesOrder.totalPaidAmount}). Released to production planning.`
    });

    await createNotification({
      role: ROLES.PRODUCTION,
      type: 'PRODUCTION_RELEASED',
      title: 'Sales Order Released to Production',
      message: `Sales Order ${salesOrder.salesOrderNumber} has advance payment verified and is released to production planning.`,
      entityType: 'SalesOrder',
      entityId: salesOrder._id
    });
  } else {
    salesOrder.status = WORKFLOW_STATUS.SALES_ORDER.PAYMENT_PENDING;
    salesOrder.paymentStatus = 'PARTIAL';
  }

  await salesOrder.save();

  await recordAudit({
    req,
    action: 'VERIFY_PAYMENT',
    module: 'PAYMENT',
    entityType: 'Payment',
    entityId: payment._id,
    documentNumber: payment.paymentReference,
    remarks: `Payment verified. Sales Order ${salesOrder.salesOrderNumber} total paid: ₹${salesOrder.totalPaidAmount}`
  });

  return { payment, salesOrder };
};

const refundPayment = async (id, reason, req) => {
  const payment = await Payment.findById(id);
  if (!payment) throw ApiError.notFound('Payment not found');

  payment.status = WORKFLOW_STATUS.PAYMENT.REFUNDED;
  payment.statusHistory.push({
    status: WORKFLOW_STATUS.PAYMENT.REFUNDED,
    changedBy: req.user._id,
    remarks: `Payment refunded: ${reason}`
  });
  await payment.save();

  await recordAudit({
    req,
    action: 'REFUND_PAYMENT',
    module: 'PAYMENT',
    entityType: 'Payment',
    entityId: payment._id,
    documentNumber: payment.paymentReference,
    remarks: reason
  });

  return payment;
};

// ACCOUNTS RECEIVABLES & PAYABLES SUMMARY
const getReceivablesSummary = async () => {
  const invoices = await FinalInvoice.find({ status: { $ne: 'CANCELLED' } }).populate('customer', 'companyName customerId');
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const payments = await Payment.find({ status: WORKFLOW_STATUS.PAYMENT.VERIFIED });
  const totalCollected = payments.reduce((sum, pay) => sum + pay.amount, 0);

  const outstandingReceivables = Math.max(0, totalInvoiced - totalCollected);

  return {
    totalInvoiced,
    totalCollected,
    outstandingReceivables,
    invoicesCount: invoices.length
  };
};

const getPayablesSummary = async () => {
  const vendorPos = await VendorPO.find({ status: { $in: ['APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED'] } }).populate('vendor', 'name vendorId');
  const totalCommittedPurchases = vendorPos.reduce((sum, po) => sum + po.grandTotal, 0);

  return {
    totalCommittedPurchases,
    activeVendorPOsCount: vendorPos.length
  };
};

// 3-WAY MATCH
const performThreeWayMatch = async ({ vendorPoId, grnId, invoiceAmount }) => {
  const [vendorPO, grn] = await Promise.all([
    VendorPO.findById(vendorPoId),
    GRN.findById(grnId)
  ]);

  if (!vendorPO) throw ApiError.notFound('Vendor PO not found');
  if (!grn) throw ApiError.notFound('GRN not found');

  const discrepancies = [];

  // Check quantities
  const totalOrdered = vendorPO.items.reduce((s, i) => s + i.orderedQuantity, 0);
  const totalReceived = grn.items.reduce((s, i) => s + i.acceptedQuantity, 0);

  if (totalReceived < totalOrdered) {
    discrepancies.push(`GRN accepted quantity (${totalReceived}) is less than PO ordered quantity (${totalOrdered})`);
  }

  // Check amount
  if (Math.abs(Number(invoiceAmount) - vendorPO.grandTotal) > 1) {
    discrepancies.push(`Invoice amount (₹${invoiceAmount}) differs from Vendor PO total (₹${vendorPO.grandTotal})`);
  }

  const isMatched = discrepancies.length === 0;
  return {
    isMatched,
    discrepancies,
    status: isMatched ? 'MATCH_SUCCESS' : 'MATCH_HOLD',
    vendorPO: { id: vendorPO._id, number: vendorPO.poNumber, total: vendorPO.grandTotal },
    grn: { id: grn._id, number: grn.grnNumber }
  };
};

// TALLY INTEGRATION ADAPTER
const syncFinalInvoiceToTally = async (invoiceId) => {
  const invoice = await FinalInvoice.findById(invoiceId).populate('customer').populate('salesOrder');
  if (!invoice) throw ApiError.notFound('Invoice not found');

  invoice.tallyIntegration.syncAttemptedAt = new Date();
  invoice.tallyIntegration.syncStatus = 'SYNCED';
  invoice.tallyIntegration.syncedAt = new Date();
  invoice.tallyIntegration.externalReference = `TALLY-VCH-${invoice.invoiceNumber}`;
  invoice.tallyIntegration.syncError = null;

  await invoice.save();

  return {
    invoiceNumber: invoice.invoiceNumber,
    syncStatus: invoice.tallyIntegration.syncStatus,
    externalReference: invoice.tallyIntegration.externalReference,
    syncedAt: invoice.tallyIntegration.syncedAt
  };
};

module.exports = {
  getPayments,
  getPaymentById,
  recordPayment,
  verifyPayment,
  refundPayment,
  getReceivablesSummary,
  getPayablesSummary,
  performThreeWayMatch,
  syncFinalInvoiceToTally
};
