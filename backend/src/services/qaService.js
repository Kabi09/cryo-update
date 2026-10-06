const QAInspection = require('../models/QAInspection');
const SerialNumber = require('../models/SerialNumber');
const FinishedGoods = require('../models/FinishedGoods');
const ProductionOrder = require('../models/ProductionOrder');
const SalesOrder = require('../models/SalesOrder');
const Warehouse = require('../models/Warehouse');
const Packing = require('../models/Packing');
const FinalInvoice = require('../models/FinalInvoice');
const Dispatch = require('../models/Dispatch');
const Delivery = require('../models/Delivery');
const Installation = require('../models/Installation');
const Warranty = require('../models/Warranty');
const ServiceTicket = require('../models/ServiceTicket');
const RMA = require('../models/RMA');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

// ========================== QA INSPECTION ==========================
const getQAInspections = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['inspectionNumber', 'certificateNumber'], ['status', 'result', 'productionOrder']);
  const [items, total] = await Promise.all([
    QAInspection.find(filter).populate('productionOrder').populate('product').populate('serialNumber').populate('inspectedBy', 'name email').sort(sort).skip(skip).limit(limit),
    QAInspection.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getQAInspectionById = async (id) => {
  const qa = await QAInspection.findById(id).populate('productionOrder').populate('product').populate('serialNumber').populate('inspectedBy', 'name email');
  if (!qa) throw ApiError.notFound('QA Inspection not found');
  return qa;
};

const passQAInspection = async (id, { certificateNumber = null, testParameters = [] }, req) => {
  const qa = await QAInspection.findById(id).populate('productionOrder');
  if (!qa) throw ApiError.notFound('QA Inspection not found');

  const po = qa.productionOrder;
  const certNumber = certificateNumber || `CAL-CERT-${Date.now().toString().slice(-6)}`;

  // Generate Serial Number
  const serialNumberString = await getNextSequence('SERIAL');

  const serialDoc = await SerialNumber.create({
    serialNumber: serialNumberString,
    product: po.product,
    productionOrder: po._id,
    salesOrder: po.salesOrder,
    customer: po.customer,
    qaInspection: qa._id,
    currentStatus: 'FINISHED_GOODS'
  });

  // Update QA Inspection
  qa.status = WORKFLOW_STATUS.QA_INSPECTION.PASSED;
  qa.result = 'PASSED';
  qa.serialNumber = serialDoc._id;
  qa.certificateNumber = certNumber;
  qa.certificateGeneratedAt = new Date();
  if (testParameters.length > 0) {
    qa.testParameters = testParameters;
  }
  qa.statusHistory.push({
    status: WORKFLOW_STATUS.QA_INSPECTION.PASSED,
    changedBy: req.user._id,
    remarks: `QA passed. Certificate ${certNumber} and Serial ${serialNumberString} generated.`
  });
  await qa.save();

  // Link Serial Number to Production Order
  po.serialNumbers.push(serialDoc._id);
  await po.save();

  // Post to Finished Goods Inventory
  const defaultWarehouse = (await Warehouse.findOne({ isDefault: true })) || (await Warehouse.findOne());
  const finishedGood = await FinishedGoods.create({
    serialNumber: serialDoc._id,
    serialNumberString: serialDoc.serialNumber,
    product: po.product,
    warehouse: defaultWarehouse ? defaultWarehouse._id : null,
    salesOrder: po.salesOrder,
    customer: po.customer,
    qaCertificateNumber: certNumber,
    status: 'READY_FOR_PACKING'
  });

  // Update Sales Order status
  await SalesOrder.findByIdAndUpdate(po.salesOrder, {
    status: WORKFLOW_STATUS.SALES_ORDER.READY_FOR_DISPATCH
  });

  await recordAudit({
    req,
    action: 'QA_PASS',
    module: 'QA',
    entityType: 'QAInspection',
    entityId: qa._id,
    documentNumber: qa.inspectionNumber,
    remarks: `QA passed. Cert: ${certNumber}, Serial: ${serialNumberString}`
  });

  return { qa, serialNumber: serialDoc, finishedGood };
};

const failQAInspection = async (id, { reworkInstructions, testParameters = [] }, req) => {
  const qa = await QAInspection.findById(id);
  if (!qa) throw ApiError.notFound('QA Inspection not found');

  qa.status = WORKFLOW_STATUS.QA_INSPECTION.FAILED;
  qa.result = 'FAILED';
  qa.reworkInstructions = reworkInstructions || 'Temperature criteria not met during drawdown cycle';
  if (testParameters.length > 0) {
    qa.testParameters = testParameters;
  }
  qa.statusHistory.push({
    status: WORKFLOW_STATUS.QA_INSPECTION.FAILED,
    changedBy: req.user._id,
    remarks: `QA failed: ${qa.reworkInstructions}. Sent for rework.`
  });
  await qa.save();

  // Update Production Order back to assembly / rework
  await ProductionOrder.findByIdAndUpdate(qa.productionOrder, {
    status: WORKFLOW_STATUS.PRODUCTION_ORDER.ON_HOLD
  });

  await recordAudit({
    req,
    action: 'QA_FAIL',
    module: 'QA',
    entityType: 'QAInspection',
    entityId: qa._id,
    documentNumber: qa.inspectionNumber,
    remarks: qa.reworkInstructions
  });

  return qa;
};

const retestQAInspection = async (id, { isPassed, testParameters = [] }, req) => {
  const qa = await QAInspection.findById(id);
  if (!qa) throw ApiError.notFound('QA Inspection not found');

  qa.retestCount = (qa.retestCount || 0) + 1;

  if (isPassed) {
    return passQAInspection(id, { testParameters }, req);
  }

  qa.status = WORKFLOW_STATUS.QA_INSPECTION.SCRAPPED;
  qa.result = 'SCRAPPED';
  qa.statusHistory.push({
    status: WORKFLOW_STATUS.QA_INSPECTION.SCRAPPED,
    changedBy: req.user._id,
    remarks: 'Retest failed. Unit marked as scrap.'
  });
  await qa.save();

  await recordAudit({
    req,
    action: 'QA_SCRAP',
    module: 'QA',
    entityType: 'QAInspection',
    entityId: qa._id,
    documentNumber: qa.inspectionNumber,
    remarks: 'Unit scrapped after repeated QA failure'
  });

  return qa;
};

// ========================== SERIAL NUMBERS & TRACEABILITY ==========================
const getSerialNumbers = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['serialNumber'], ['product', 'customer', 'currentStatus']);
  const [items, total] = await Promise.all([
    SerialNumber.find(filter).populate('product').populate('customer').populate('salesOrder').sort(sort).skip(skip).limit(limit),
    SerialNumber.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getSerialNumberById = async (id) => {
  const serial = await SerialNumber.findById(id)
    .populate('product')
    .populate('customer')
    .populate('salesOrder')
    .populate('productionOrder')
    .populate('qaInspection')
    .populate('packing')
    .populate('finalInvoice')
    .populate('dispatch')
    .populate('delivery')
    .populate('installation')
    .populate('warranty');
  if (!serial) throw ApiError.notFound('Serial Number not found');
  return serial;
};

const getSerialNumberTrace = async (serialNumberString) => {
  const serial = await SerialNumber.findOne({ serialNumber: serialNumberString })
    .populate('product')
    .populate('customer')
    .populate('salesOrder')
    .populate('productionOrder')
    .populate('qaInspection')
    .populate('packing')
    .populate('finalInvoice')
    .populate('dispatch')
    .populate('delivery')
    .populate('installation')
    .populate('warranty');

  if (!serial) throw ApiError.notFound(`Serial Number ${serialNumberString} not found`);

  const [serviceTickets, rmaRecords] = await Promise.all([
    ServiceTicket.find({ serialNumber: serial._id }),
    RMA.find({ serialNumber: serial._id })
  ]);

  return {
    serial,
    serviceHistory: serviceTickets,
    rmaHistory: rmaRecords
  };
};

module.exports = {
  getQAInspections,
  getQAInspectionById,
  passQAInspection,
  failQAInspection,
  retestQAInspection,
  getSerialNumbers,
  getSerialNumberById,
  getSerialNumberTrace
};
