const FinishedGoods = require('../models/FinishedGoods');
const Packing = require('../models/Packing');
const FinalInvoice = require('../models/FinalInvoice');
const Dispatch = require('../models/Dispatch');
const Delivery = require('../models/Delivery');
const SerialNumber = require('../models/SerialNumber');
const SalesOrder = require('../models/SalesOrder');
const Transporter = require('../models/Transporter');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

// FINISHED GOODS
const getFinishedGoods = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['serialNumberString'], ['status', 'warehouse', 'product', 'customer']);
  const [items, total] = await Promise.all([
    FinishedGoods.find(filter).populate('serialNumber').populate('product').populate('warehouse').populate('customer').sort(sort).skip(skip).limit(limit),
    FinishedGoods.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

// PACKING
const getPackings = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['packingNumber'], ['status', 'customer', 'salesOrder']);
  const [items, total] = await Promise.all([
    Packing.find(filter).populate('salesOrder').populate('customer').populate('serialNumbers').sort(sort).skip(skip).limit(limit),
    Packing.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createPacking = async (data, req) => {
  const packingNumber = await getNextSequence('PACKING');
  const salesOrder = await SalesOrder.findById(data.salesOrder);
  if (!salesOrder) throw ApiError.notFound('Sales order not found');

  const rawSerials = Array.isArray(data.serialNumbers) ? data.serialNumbers : [data.serialNumbers];
  const serialIds = (await Promise.all(
    rawSerials.filter(Boolean).map(async (id) => {
      const sn = await SerialNumber.findById(id);
      if (sn) return sn._id;
      const fg = await FinishedGoods.findById(id);
      if (fg && fg.serialNumber) return fg.serialNumber;
      return id;
    })
  )).filter(Boolean);

  const packing = await Packing.create({
    ...data,
    serialNumbers: serialIds,
    packingNumber,
    customer: salesOrder.customer,
    packedBy: req.user._id,
    status: WORKFLOW_STATUS.PACKING.PACKED
  });

  // Update serials to PACKED
  await SerialNumber.updateMany(
    { _id: { $in: serialIds } },
    { $set: { packing: packing._id, currentStatus: 'PACKED' } }
  );

  // Update finished goods to PACKED
  await FinishedGoods.updateMany(
    { serialNumber: { $in: serialIds } },
    { $set: { status: 'PACKED' } }
  );

  await recordAudit({
    req,
    action: 'CREATE_PACKING',
    module: 'PACKING',
    entityType: 'Packing',
    entityId: packing._id,
    documentNumber: packing.packingNumber
  });

  return packing;
};

// FINAL INVOICE
const getFinalInvoices = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['invoiceNumber', 'customerPoReference'], ['status', 'customer']);
  const [items, total] = await Promise.all([
    FinalInvoice.find(filter).populate('salesOrder').populate('customer').sort(sort).skip(skip).limit(limit),
    FinalInvoice.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getFinalInvoiceById = async (id) => {
  const inv = await FinalInvoice.findById(id).populate('salesOrder').populate('customer').populate('serialNumbers');
  if (!inv) throw ApiError.notFound('Final Invoice not found');
  return inv;
};

const createFinalInvoice = async (salesOrderId, invoiceData = {}, req) => {
  const salesOrder = await SalesOrder.findById(salesOrderId).populate('customer').populate('customerPo');
  if (!salesOrder) throw ApiError.notFound('Sales order not found');

  const invoiceNumber = await getNextSequence('FINAL_INVOICE');
  const serials = await SerialNumber.find({ salesOrder: salesOrder._id });

  const finalInvoice = await FinalInvoice.create({
    invoiceNumber,
    salesOrder: salesOrder._id,
    customer: salesOrder.customer._id,
    customerPoReference: salesOrder.customerPo?.customerPoReference || '',
    serialNumbers: serials.map((s) => s._id),
    items: salesOrder.items,
    subtotal: salesOrder.subtotal,
    totalTax: salesOrder.totalTax,
    grandTotal: salesOrder.grandTotal,
    dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentTerms: invoiceData.paymentTerms || 'Payment due within 30 days',
    status: 'ISSUED',
    createdBy: req.user._id
  });

  await SerialNumber.updateMany(
    { salesOrder: salesOrder._id },
    { $set: { finalInvoice: finalInvoice._id } }
  );

  await recordAudit({
    req,
    action: 'CREATE_FINAL_INVOICE',
    module: 'INVOICE',
    entityType: 'FinalInvoice',
    entityId: finalInvoice._id,
    documentNumber: finalInvoice.invoiceNumber,
    remarks: `Grand Total: ₹${finalInvoice.grandTotal}`
  });

  return finalInvoice;
};

// DISPATCH
const getDispatches = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['dispatchNumber', 'trackingNumber'], ['status', 'customer', 'transporter']);
  const [items, total] = await Promise.all([
    Dispatch.find(filter).populate('salesOrder').populate('customer').populate('finalInvoice').populate('serialNumbers').sort(sort).skip(skip).limit(limit),
    Dispatch.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createDispatch = async (data, req) => {
  const dispatchNumber = await getNextSequence('DISPATCH');
  const salesOrder = await SalesOrder.findById(data.salesOrder);
  if (!salesOrder) throw ApiError.notFound('Sales order not found');

  const rawSerials = Array.isArray(data.serialNumbers) ? data.serialNumbers : [data.serialNumbers];
  const serialIds = (await Promise.all(
    rawSerials.filter(Boolean).map(async (id) => {
      const sn = await SerialNumber.findById(id);
      if (sn) return sn._id;
      const fg = await FinishedGoods.findById(id);
      if (fg && fg.serialNumber) return fg.serialNumber;
      return id;
    })
  )).filter(Boolean);

  const dispatch = await Dispatch.create({
    ...data,
    serialNumbers: serialIds,
    dispatchNumber,
    customer: salesOrder.customer,
    status: WORKFLOW_STATUS.DISPATCH.DISPATCHED
  });

  // Update serials to DISPATCHED
  await SerialNumber.updateMany(
    { _id: { $in: serialIds } },
    { $set: { dispatch: dispatch._id, currentStatus: 'DISPATCHED' } }
  );

  // Update SalesOrder status
  salesOrder.status = WORKFLOW_STATUS.SALES_ORDER.DISPATCHED;
  await salesOrder.save();

  await recordAudit({
    req,
    action: 'CREATE_DISPATCH',
    module: 'DISPATCH',
    entityType: 'Dispatch',
    entityId: dispatch._id,
    documentNumber: dispatch.dispatchNumber,
    remarks: `Dispatched via ${data.transporterName} (LR: ${data.trackingNumber})`
  });

  return dispatch;
};

// DELIVERY & POD (PROOF OF DELIVERY)
const getDeliveries = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['deliveryNumber'], ['status', 'customer']);
  const [items, total] = await Promise.all([
    Delivery.find(filter).populate('dispatch').populate('salesOrder').populate('customer').sort(sort).skip(skip).limit(limit),
    Delivery.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const completePOD = async (dispatchId, podData, req) => {
  const dispatch = await Dispatch.findById(dispatchId).populate('salesOrder');
  if (!dispatch) throw ApiError.notFound('Dispatch record not found');

  const deliveryNumber = await getNextSequence('DELIVERY');

  const delivery = await Delivery.create({
    deliveryNumber,
    dispatch: dispatch._id,
    salesOrder: dispatch.salesOrder._id,
    customer: dispatch.customer,
    serialNumbers: dispatch.serialNumbers,
    podDetails: podData,
    status: 'DELIVERED',
    confirmedBy: req.user._id
  });

  dispatch.status = WORKFLOW_STATUS.DISPATCH.DELIVERED;
  await dispatch.save();

  // Update Serials to DELIVERED
  await SerialNumber.updateMany(
    { _id: { $in: dispatch.serialNumbers } },
    { $set: { delivery: delivery._id, currentStatus: 'DELIVERED' } }
  );

  // Update Sales Order
  await SalesOrder.findByIdAndUpdate(dispatch.salesOrder._id, {
    status: WORKFLOW_STATUS.SALES_ORDER.DELIVERED
  });

  await recordAudit({
    req,
    action: 'COMPLETE_POD',
    module: 'DELIVERY',
    entityType: 'Delivery',
    entityId: delivery._id,
    documentNumber: delivery.deliveryNumber,
    remarks: `Delivery confirmed. Received by ${podData.receivedBy}`
  });

  return delivery;
};

const recordDeliveryFailure = async (dispatchId, { reason }, req) => {
  const dispatch = await Dispatch.findById(dispatchId);
  if (!dispatch) throw ApiError.notFound('Dispatch not found');

  dispatch.status = WORKFLOW_STATUS.DISPATCH.FAILED;
  await dispatch.save();

  const delivery = await Delivery.create({
    deliveryNumber: await getNextSequence('DELIVERY'),
    dispatch: dispatch._id,
    salesOrder: dispatch.salesOrder,
    customer: dispatch.customer,
    serialNumbers: dispatch.serialNumbers,
    status: 'FAILED_ATTEMPT',
    failureReason: reason || 'Customer facility closed / delivery refused',
    podDetails: { receivedBy: 'N/A', remarks: reason },
    confirmedBy: req.user._id
  });

  await recordAudit({
    req,
    action: 'DELIVERY_FAIL',
    module: 'DELIVERY',
    entityType: 'Delivery',
    entityId: delivery._id,
    documentNumber: delivery.deliveryNumber,
    remarks: `Delivery failed: ${reason}`
  });

  return delivery;
};

module.exports = {
  getFinishedGoods,
  getPackings,
  createPacking,
  getFinalInvoices,
  getFinalInvoiceById,
  createFinalInvoice,
  getDispatches,
  createDispatch,
  getDeliveries,
  completePOD,
  recordDeliveryFailure
};
