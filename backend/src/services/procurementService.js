const PurchaseRequest = require('../models/PurchaseRequest');
const RFQ = require('../models/RFQ');
const VendorQuotation = require('../models/VendorQuotation');
const VendorPO = require('../models/VendorPO');
const GRN = require('../models/GRN');
const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const Vendor = require('../models/Vendor');
const Material = require('../models/Material');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const { createNotification } = require('../notifications/notificationService');
const WORKFLOW_STATUS = require('../constants/workflowStatus');
const ROLES = require('../constants/roles');

// ========================== PURCHASE REQUESTS ==========================
const getPurchaseRequests = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['prNumber'], ['status', 'priority']);
  const [items, total] = await Promise.all([
    PurchaseRequest.find(filter).populate('requestedBy', 'name email').populate('productionOrder').sort(sort).skip(skip).limit(limit),
    PurchaseRequest.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getPurchaseRequestById = async (id) => {
  const pr = await PurchaseRequest.findById(id).populate('requestedBy', 'name email').populate('productionOrder').populate('rfq');
  if (!pr) throw ApiError.notFound('Purchase request not found');
  return pr;
};

const createPurchaseRequest = async (data, req) => {
  const prNumber = await getNextSequence('PURCHASE_REQUEST');
  const pr = await PurchaseRequest.create({
    ...data,
    prNumber,
    requestedBy: req.user._id,
    status: WORKFLOW_STATUS.PURCHASE_REQUEST.DRAFT
  });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'PURCHASE_REQUEST',
    entityType: 'PurchaseRequest',
    entityId: pr._id,
    documentNumber: pr.prNumber,
    after: pr.toObject()
  });

  return pr;
};

const approvePurchaseRequest = async (id, req) => {
  const pr = await PurchaseRequest.findById(id);
  if (!pr) throw ApiError.notFound('Purchase request not found');

  pr.status = WORKFLOW_STATUS.PURCHASE_REQUEST.APPROVED;
  await pr.save();

  await recordAudit({
    req,
    action: 'APPROVE',
    module: 'PURCHASE_REQUEST',
    entityType: 'PurchaseRequest',
    entityId: pr._id,
    documentNumber: pr.prNumber
  });

  return pr;
};

// ========================== RFQ ==========================
const getRFQs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['rfqNumber'], ['status', 'selectedVendor']);
  const [items, total] = await Promise.all([
    RFQ.find(filter).populate('purchaseRequest').populate('selectedVendor').populate('invitedVendors').sort(sort).skip(skip).limit(limit),
    RFQ.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getRFQById = async (id) => {
  const rfq = await RFQ.findById(id).populate('purchaseRequest').populate('selectedVendor').populate('invitedVendors');
  if (!rfq) throw ApiError.notFound('RFQ not found');
  return rfq;
};

const createRFQ = async (data, req) => {
  const rfqNumber = await getNextSequence('RFQ');
  const pr = await PurchaseRequest.findById(data.purchaseRequest);
  if (!pr) throw ApiError.notFound('Purchase request not found');

  const rfq = await RFQ.create({
    ...data,
    rfqNumber,
    items: data.items || pr.items.map((i) => ({
      material: i.material,
      materialName: i.materialName,
      quantity: i.quantity,
      unitOfMeasure: i.unitOfMeasure
    })),
    status: WORKFLOW_STATUS.RFQ.DRAFT,
    createdBy: req.user._id
  });

  pr.rfq = rfq._id;
  pr.status = WORKFLOW_STATUS.PURCHASE_REQUEST.RFQ_CREATED;
  await pr.save();

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'RFQ',
    entityType: 'RFQ',
    entityId: rfq._id,
    documentNumber: rfq.rfqNumber
  });

  return rfq;
};

const selectVendorForRFQ = async (id, { vendorId, reason }, req) => {
  const rfq = await RFQ.findById(id);
  if (!rfq) throw ApiError.notFound('RFQ not found');

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw ApiError.notFound('Vendor not found');

  rfq.selectedVendor = vendor._id;
  rfq.vendorSelectionReason = reason || `Selected based on rating ${vendor.rating}/5 and competitive terms`;
  rfq.status = WORKFLOW_STATUS.RFQ.VENDOR_SELECTED;
  await rfq.save();

  await recordAudit({
    req,
    action: 'SELECT_VENDOR',
    module: 'RFQ',
    entityType: 'RFQ',
    entityId: rfq._id,
    documentNumber: rfq.rfqNumber,
    remarks: `Selected vendor ${vendor.name}. Reason: ${rfq.vendorSelectionReason}`
  });

  return rfq;
};

// ========================== VENDOR QUOTATIONS ==========================
const getVendorQuotations = async (rfqId) => {
  return VendorQuotation.find({ rfq: rfqId }).populate('vendor');
};

const recordVendorQuotation = async (data, req) => {
  const vq = await VendorQuotation.create(data);

  await RFQ.findByIdAndUpdate(data.rfq, {
    status: WORKFLOW_STATUS.RFQ.QUOTATIONS_RECEIVED
  });

  await recordAudit({
    req,
    action: 'RECORD_VENDOR_QUOTE',
    module: 'PROCUREMENT',
    entityType: 'VendorQuotation',
    entityId: vq._id,
    documentNumber: vq.quotationReference,
    remarks: `Quotation recorded for ₹${vq.totalAmount}`
  });

  return vq;
};

// ========================== VENDOR PO ==========================
const getVendorPOs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['poNumber'], ['status', 'vendor']);
  const [items, total] = await Promise.all([
    VendorPO.find(filter).populate('vendor').populate('rfq').sort(sort).skip(skip).limit(limit),
    VendorPO.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getVendorPOById = async (id) => {
  const vpo = await VendorPO.findById(id).populate('vendor').populate('rfq').populate('grns');
  if (!vpo) throw ApiError.notFound('Vendor PO not found');
  return vpo;
};

const createVendorPO = async (data, req) => {
  const poNumber = await getNextSequence('VENDOR_PO');
  const items = data.items.map((i) => ({
    ...i,
    orderedQuantity: i.quantity || i.orderedQuantity,
    taxPercent: i.taxPercent !== undefined ? i.taxPercent : 18,
    taxAmount: ((i.quantity || i.orderedQuantity) * i.unitPrice * (i.taxPercent || 18)) / 100,
    lineTotal: (i.quantity || i.orderedQuantity) * i.unitPrice * (1 + (i.taxPercent || 18) / 100)
  }));

  const subtotal = items.reduce((s, i) => s + (i.orderedQuantity * i.unitPrice), 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = subtotal + totalTax;

  const vpo = await VendorPO.create({
    ...data,
    poNumber,
    items,
    subtotal,
    totalTax,
    grandTotal,
    status: WORKFLOW_STATUS.VENDOR_PO.DRAFT
  });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'VENDOR_PO',
    entityType: 'VendorPO',
    entityId: vpo._id,
    documentNumber: vpo.poNumber,
    after: vpo.toObject()
  });

  return vpo;
};

const approveVendorPO = async (id, req) => {
  const vpo = await VendorPO.findById(id);
  if (!vpo) throw ApiError.notFound('Vendor PO not found');

  vpo.status = WORKFLOW_STATUS.VENDOR_PO.APPROVED;
  vpo.approvedBy = req.user._id;
  vpo.approvedAt = new Date();
  await vpo.save();

  await recordAudit({
    req,
    action: 'APPROVE',
    module: 'VENDOR_PO',
    entityType: 'VendorPO',
    entityId: vpo._id,
    documentNumber: vpo.poNumber
  });

  return vpo;
};

// ========================== GRN ==========================
const getGRNs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['grnNumber', 'challanNumber'], ['status', 'vendor', 'warehouse']);
  const [items, total] = await Promise.all([
    GRN.find(filter).populate('vendor').populate('vendorPo').populate('warehouse').sort(sort).skip(skip).limit(limit),
    GRN.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getGRNById = async (id) => {
  const grn = await GRN.findById(id).populate('vendor').populate('vendorPo').populate('warehouse');
  if (!grn) throw ApiError.notFound('GRN not found');
  return grn;
};

const createGRN = async (data, req) => {
  const grnNumber = await getNextSequence('GRN');
  const vpo = await VendorPO.findById(data.vendorPo);
  if (!vpo) throw ApiError.notFound('Vendor PO not found');

  const grn = await GRN.create({
    ...data,
    grnNumber,
    vendor: vpo.vendor,
    inspectedBy: req.user._id,
    status: WORKFLOW_STATUS.GRN.ACCEPTED
  });

  // Post to inventory & stock ledger for each accepted item
  for (const item of data.items) {
    const acceptedQty = Number(item.acceptedQuantity) || 0;
    if (acceptedQty <= 0) continue;

    let inv = await Inventory.findOne({ material: item.material, warehouse: data.warehouse });
    if (!inv) {
      inv = await Inventory.create({
        material: item.material,
        warehouse: data.warehouse,
        quantityOnHand: acceptedQty,
        quantityReserved: 0,
        quantityAvailable: acceptedQty
      });
    } else {
      inv.quantityOnHand += acceptedQty;
      inv.quantityAvailable = Math.max(0, inv.quantityOnHand - inv.quantityReserved);
      await inv.save();
    }

    await StockLedger.create({
      material: item.material,
      warehouse: data.warehouse,
      transactionType: 'RECEIPT',
      quantity: acceptedQty,
      balanceAfter: inv.quantityOnHand,
      referenceType: 'GRN',
      referenceId: grn._id,
      referenceNumber: grn.grnNumber,
      performedBy: req.user._id,
      remarks: `Goods received from vendor ${vpo.vendor} via GRN ${grn.grnNumber}`
    });

    // Update received quantity on Vendor PO item
    const poItem = vpo.items.find((i) => String(i.material) === String(item.material));
    if (poItem) {
      poItem.receivedQuantity = (poItem.receivedQuantity || 0) + acceptedQty;
    }
  }

  // Check if Vendor PO is fully or partially received
  const totalOrdered = vpo.items.reduce((s, i) => s + i.orderedQuantity, 0);
  const totalReceived = vpo.items.reduce((s, i) => s + (i.receivedQuantity || 0), 0);

  vpo.status = totalReceived >= totalOrdered ? WORKFLOW_STATUS.VENDOR_PO.FULLY_RECEIVED : WORKFLOW_STATUS.VENDOR_PO.PARTIALLY_RECEIVED;
  vpo.grns.push(grn._id);
  await vpo.save();

  await recordAudit({
    req,
    action: 'CREATE_GRN',
    module: 'GRN',
    entityType: 'GRN',
    entityId: grn._id,
    documentNumber: grn.grnNumber,
    remarks: `GRN created for Vendor PO ${vpo.poNumber}. Stock posted to warehouse.`
  });

  return { grn, vendorPO: vpo };
};

module.exports = {
  getPurchaseRequests,
  getPurchaseRequestById,
  createPurchaseRequest,
  approvePurchaseRequest,
  getRFQs,
  getRFQById,
  createRFQ,
  selectVendorForRFQ,
  getVendorQuotations,
  recordVendorQuotation,
  getVendorPOs,
  getVendorPOById,
  createVendorPO,
  approveVendorPO,
  getGRNs,
  getGRNById,
  createGRN
};
