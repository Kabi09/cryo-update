const Installation = require('../models/Installation');
const Warranty = require('../models/Warranty');
const ServiceTicket = require('../models/ServiceTicket');
const RMA = require('../models/RMA');
const SerialNumber = require('../models/SerialNumber');
const Material = require('../models/Material');
const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const Warehouse = require('../models/Warehouse');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const { createNotification } = require('../notifications/notificationService');
const WORKFLOW_STATUS = require('../constants/workflowStatus');
const ROLES = require('../constants/roles');

// ========================== INSTALLATION & COMMISSIONING ==========================
const getInstallations = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['installationNumber'], ['status', 'customer', 'assignedEngineer']);
  const [items, total] = await Promise.all([
    Installation.find(filter).populate('serialNumber').populate('salesOrder').populate('customer').populate('assignedEngineer', 'name email').sort(sort).skip(skip).limit(limit),
    Installation.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createInstallation = async (data, req) => {
  const installationNumber = await getNextSequence('INSTALLATION');
  const serial = await SerialNumber.findById(data.serialNumber);
  if (!serial) throw ApiError.notFound('Serial Number not found');

  const installation = await Installation.create({
    ...data,
    installationNumber,
    salesOrder: serial.salesOrder,
    customer: serial.customer,
    status: WORKFLOW_STATUS.INSTALLATION.PENDING
  });

  serial.installation = installation._id;
  await serial.save();

  await recordAudit({
    req,
    action: 'CREATE_INSTALLATION',
    module: 'INSTALLATION',
    entityType: 'Installation',
    entityId: installation._id,
    documentNumber: installation.installationNumber
  });

  return installation;
};

const completeCommissioning = async (id, signOffData = {}, req) => {
  const inst = await Installation.findById(id).populate('serialNumber');
  if (!inst) throw ApiError.notFound('Installation record not found');

  inst.status = WORKFLOW_STATUS.INSTALLATION.COMMISSIONED;
  inst.installationDate = new Date();
  inst.customerSignOff = {
    signedByName: signOffData.signedByName || 'Customer Incharge',
    designation: signOffData.designation || 'Lab Manager',
    signatureUrl: signOffData.signatureUrl || '',
    signedAt: new Date()
  };
  await inst.save();

  const serial = await SerialNumber.findById(inst.serialNumber._id);
  serial.currentStatus = 'COMMISSIONED';

  // Automatically activate warranty for 12 months from commissioning date
  const startDate = new Date();
  const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const warranty = await Warranty.create({
    serialNumber: serial._id,
    serialNumberString: serial.serialNumber,
    customer: serial.customer,
    salesOrder: serial.salesOrder,
    product: serial.product,
    installation: inst._id,
    startDate,
    endDate,
    durationMonths: 12,
    status: WORKFLOW_STATUS.WARRANTY.ACTIVE
  });

  serial.warranty = warranty._id;
  serial.currentStatus = 'UNDER_WARRANTY';
  await serial.save();

  await recordAudit({
    req,
    action: 'COMMISSIONING_COMPLETE',
    module: 'INSTALLATION',
    entityType: 'Installation',
    entityId: inst._id,
    documentNumber: inst.installationNumber,
    remarks: `Equipment commissioned. Warranty activated until ${endDate.toISOString().split('T')[0]}`
  });

  return { installation: inst, warranty };
};

// ========================== WARRANTY ==========================
const getWarranties = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['serialNumberString'], ['status', 'customer']);
  const [items, total] = await Promise.all([
    Warranty.find(filter).populate('serialNumber').populate('customer').populate('product').sort(sort).skip(skip).limit(limit),
    Warranty.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const checkWarranty = async (serialNumberString) => {
  const warranty = await Warranty.findOne({ serialNumberString }).populate('customer').populate('product');
  if (!warranty) {
    return {
      hasWarranty: false,
      isValid: false,
      message: 'No warranty record found for this serial number'
    };
  }

  const isCurrent = warranty.isValid();
  const daysRemaining = Math.max(0, Math.ceil((new Date(warranty.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  return {
    hasWarranty: true,
    isValid: isCurrent,
    startDate: warranty.startDate,
    endDate: warranty.endDate,
    daysRemaining,
    status: isCurrent ? 'ACTIVE' : 'EXPIRED',
    warranty
  };
};

// ========================== SERVICE TICKETS ==========================
const getServiceTickets = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['ticketNumber'], ['status', 'customer', 'assignedEngineer', 'isUnderWarranty']);
  const [items, total] = await Promise.all([
    ServiceTicket.find(filter).populate('customer').populate('serialNumber').populate('product').populate('assignedEngineer', 'name email').sort(sort).skip(skip).limit(limit),
    ServiceTicket.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getServiceTicketById = async (id) => {
  const ticket = await ServiceTicket.findById(id).populate('customer').populate('serialNumber').populate('product').populate('assignedEngineer', 'name email');
  if (!ticket) throw ApiError.notFound('Service ticket not found');
  return ticket;
};

const createServiceTicket = async (data, req) => {
  const ticketNumber = await getNextSequence('SERVICE_TICKET');
  const serial = await SerialNumber.findById(data.serialNumber);
  if (!serial) throw ApiError.notFound('Serial Number not found');

  // Perform automated warranty check
  const warrantyCheckResult = await checkWarranty(serial.serialNumber);
  const isUnderWarranty = warrantyCheckResult.isValid;

  const ticket = await ServiceTicket.create({
    ...data,
    ticketNumber,
    customer: serial.customer,
    product: serial.product,
    isUnderWarranty,
    serviceType: isUnderWarranty ? 'WARRANTY_FREE' : 'CHARGEABLE_SERVICE',
    chargeableAmount: isUnderWarranty ? 0 : (data.chargeableAmount || 5000),
    status: WORKFLOW_STATUS.SERVICE_TICKET.OPEN,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.SERVICE_TICKET.OPEN,
        changedBy: req.user._id,
        remarks: `Complaint logged. Warranty status: ${isUnderWarranty ? 'COVERED (FREE)' : 'EXPIRED (CHARGEABLE)'}`
      }
    ]
  });

  serial.currentStatus = 'IN_SERVICE';
  await serial.save();

  await createNotification({
    role: ROLES.SERVICE_MANAGER,
    type: 'SERVICE_TICKET_OPEN',
    title: 'New Service Ticket Logged',
    message: `Ticket ${ticket.ticketNumber} for machine ${serial.serialNumber} requires engineer assignment.`,
    entityType: 'ServiceTicket',
    entityId: ticket._id
  });

  await recordAudit({
    req,
    action: 'CREATE_SERVICE_TICKET',
    module: 'SERVICE',
    entityType: 'ServiceTicket',
    entityId: ticket._id,
    documentNumber: ticket.ticketNumber,
    remarks: `Under warranty: ${isUnderWarranty}`
  });

  return ticket;
};

const assignEngineer = async (id, engineerId, req) => {
  const ticket = await ServiceTicket.findById(id);
  if (!ticket) throw ApiError.notFound('Service ticket not found');

  ticket.assignedEngineer = engineerId;
  ticket.status = WORKFLOW_STATUS.SERVICE_TICKET.ASSIGNED;
  ticket.statusHistory.push({
    status: WORKFLOW_STATUS.SERVICE_TICKET.ASSIGNED,
    changedBy: req.user._id,
    remarks: `Assigned to engineer ${engineerId}`
  });
  await ticket.save();

  await recordAudit({
    req,
    action: 'ASSIGN_ENGINEER',
    module: 'SERVICE',
    entityType: 'ServiceTicket',
    entityId: ticket._id,
    documentNumber: ticket.ticketNumber
  });

  return ticket;
};

const recordDiagnosis = async (id, diagnosisData, req) => {
  const ticket = await ServiceTicket.findById(id);
  if (!ticket) throw ApiError.notFound('Service ticket not found');

  ticket.diagnosis = {
    ...diagnosisData,
    diagnosedAt: new Date()
  };
  ticket.serviceLocation = diagnosisData.serviceLocation || ticket.serviceLocation;
  ticket.status = ticket.serviceLocation === 'FACTORY_RETURN' ? WORKFLOW_STATUS.SERVICE_TICKET.FACTORY_RETURN : WORKFLOW_STATUS.SERVICE_TICKET.DIAGNOSED;
  ticket.statusHistory.push({
    status: ticket.status,
    changedBy: req.user._id,
    remarks: `Diagnosis: ${diagnosisData.findings}. Location: ${ticket.serviceLocation}`
  });
  await ticket.save();

  await recordAudit({
    req,
    action: 'DIAGNOSE',
    module: 'SERVICE',
    entityType: 'ServiceTicket',
    entityId: ticket._id,
    documentNumber: ticket.ticketNumber,
    remarks: diagnosisData.findings
  });

  return ticket;
};

const addSparePartsToTicket = async (id, { materialId, quantity, isChargeable = false }, req) => {
  const ticket = await ServiceTicket.findById(id);
  if (!ticket) throw ApiError.notFound('Service ticket not found');

  const mat = await Material.findById(materialId);
  if (!mat) throw ApiError.notFound('Material not found');

  const defaultWh = (await Warehouse.findOne({ isDefault: true })) || (await Warehouse.findOne());
  const inv = await Inventory.findOne({ material: mat._id, warehouse: defaultWh._id });

  let fromInventoryIssued = false;
  if (inv && inv.quantityAvailable >= quantity) {
    inv.quantityOnHand -= quantity;
    inv.quantityAvailable = Math.max(0, inv.quantityOnHand - inv.quantityReserved);
    await inv.save();

    await StockLedger.create({
      material: mat._id,
      warehouse: defaultWh._id,
      transactionType: 'ISSUE',
      quantity: -quantity,
      balanceAfter: inv.quantityOnHand,
      referenceType: 'SERVICE_TICKET',
      referenceId: ticket._id,
      referenceNumber: ticket.ticketNumber,
      performedBy: req.user._id,
      remarks: `Spare part issued for Service Ticket ${ticket.ticketNumber}`
    });
    fromInventoryIssued = true;
  }

  ticket.sparePartsUsed.push({
    material: mat._id,
    materialName: mat.name,
    quantity,
    isChargeable,
    unitPrice: mat.standardCost,
    fromInventoryIssued
  });

  if (!fromInventoryIssued) {
    ticket.status = WORKFLOW_STATUS.SERVICE_TICKET.WAITING_FOR_PARTS;
  }

  await ticket.save();

  await recordAudit({
    req,
    action: 'ADD_SPARE_PART',
    module: 'SERVICE',
    entityType: 'ServiceTicket',
    entityId: ticket._id,
    documentNumber: ticket.ticketNumber,
    remarks: `Spare added: ${mat.name} (${quantity}). In-stock issued: ${fromInventoryIssued}`
  });

  return ticket;
};

const completeServiceRepair = async (id, { resolutionSummary, testResult = 'PASS' }, req) => {
  const ticket = await ServiceTicket.findById(id);
  if (!ticket) throw ApiError.notFound('Service ticket not found');

  ticket.resolutionSummary = resolutionSummary;
  ticket.testResult = testResult;
  ticket.status = WORKFLOW_STATUS.SERVICE_TICKET.REPAIRED;
  ticket.statusHistory.push({
    status: WORKFLOW_STATUS.SERVICE_TICKET.REPAIRED,
    changedBy: req.user._id,
    remarks: `Repair completed: ${resolutionSummary}. Test: ${testResult}`
  });
  await ticket.save();

  await recordAudit({
    req,
    action: 'COMPLETE_REPAIR',
    module: 'SERVICE',
    entityType: 'ServiceTicket',
    entityId: ticket._id,
    documentNumber: ticket.ticketNumber,
    remarks: resolutionSummary
  });

  return ticket;
};

const customerSignOffService = async (id, signOffData = {}, req) => {
  const ticket = await ServiceTicket.findById(id).populate('serialNumber');
  if (!ticket) throw ApiError.notFound('Service ticket not found');

  ticket.customerSignOff = {
    signedByName: signOffData.signedByName || 'Customer Attendant',
    satisfactionRating: signOffData.satisfactionRating || 5,
    signedAt: new Date()
  };
  ticket.status = WORKFLOW_STATUS.SERVICE_TICKET.CLOSED;
  ticket.statusHistory.push({
    status: WORKFLOW_STATUS.SERVICE_TICKET.CLOSED,
    changedBy: req.user._id,
    remarks: `Customer signed off. Ticket closed.`
  });
  await ticket.save();

  // Restore serial status
  const serial = await SerialNumber.findById(ticket.serialNumber._id);
  serial.currentStatus = ticket.isUnderWarranty ? 'UNDER_WARRANTY' : 'OUT_OF_WARRANTY';
  await serial.save();

  await recordAudit({
    req,
    action: 'CLOSE_TICKET',
    module: 'SERVICE',
    entityType: 'ServiceTicket',
    entityId: ticket._id,
    documentNumber: ticket.ticketNumber,
    remarks: 'Service ticket resolved and closed with customer satisfaction'
  });

  return ticket;
};

// ========================== RMA (RETURN MATERIAL AUTHORIZATION) ==========================
const getRMAs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['rmaNumber'], ['status', 'customer', 'resolutionType']);
  const [items, total] = await Promise.all([
    RMA.find(filter).populate('customer').populate('serialNumber').populate('approvedBy', 'name email').sort(sort).skip(skip).limit(limit),
    RMA.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getRMAById = async (id) => {
  const rma = await RMA.findById(id).populate('customer').populate('serialNumber').populate('serviceTicket').populate('replacementSerialNumber');
  if (!rma) throw ApiError.notFound('RMA record not found');
  return rma;
};

const createRMA = async (data, req) => {
  const rmaNumber = await getNextSequence('RMA');
  const serial = await SerialNumber.findById(data.serialNumber);
  if (!serial) throw ApiError.notFound('Serial Number not found');

  const rma = await RMA.create({
    ...data,
    rmaNumber,
    customer: serial.customer,
    status: WORKFLOW_STATUS.RMA.REQUESTED,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.RMA.REQUESTED,
        changedBy: req.user._id,
        remarks: 'RMA request created'
      }
    ]
  });

  serial.currentStatus = 'RMA_RETURNED';
  await serial.save();

  await recordAudit({
    req,
    action: 'CREATE_RMA',
    module: 'RMA',
    entityType: 'RMA',
    entityId: rma._id,
    documentNumber: rma.rmaNumber,
    remarks: data.reasonForReturn
  });

  return rma;
};

const approveRMA = async (id, req) => {
  const rma = await RMA.findById(id);
  if (!rma) throw ApiError.notFound('RMA not found');

  rma.status = WORKFLOW_STATUS.RMA.APPROVED;
  rma.approvedBy = req.user._id;
  rma.statusHistory.push({
    status: WORKFLOW_STATUS.RMA.APPROVED,
    changedBy: req.user._id,
    remarks: 'RMA approved for return transit'
  });
  await rma.save();

  await recordAudit({
    req,
    action: 'APPROVE_RMA',
    module: 'RMA',
    entityType: 'RMA',
    entityId: rma._id,
    documentNumber: rma.rmaNumber
  });

  return rma;
};

const resolveRMA = async (id, { resolutionType, inspectionNotes, replacementSerialNumberId, creditAmount }, req) => {
  const rma = await RMA.findById(id);
  if (!rma) throw ApiError.notFound('RMA not found');

  rma.resolutionType = resolutionType || rma.resolutionType;
  rma.inspectionNotes = inspectionNotes || rma.inspectionNotes;
  rma.replacementSerialNumber = replacementSerialNumberId || null;
  rma.creditAmount = creditAmount || 0;
  rma.status = WORKFLOW_STATUS.RMA.CLOSED;
  rma.statusHistory.push({
    status: WORKFLOW_STATUS.RMA.CLOSED,
    changedBy: req.user._id,
    remarks: `RMA resolved via ${rma.resolutionType}`
  });
  await rma.save();

  await recordAudit({
    req,
    action: 'RESOLVE_RMA',
    module: 'RMA',
    entityType: 'RMA',
    entityId: rma._id,
    documentNumber: rma.rmaNumber,
    remarks: `Resolution: ${rma.resolutionType}`
  });

  return rma;
};

module.exports = {
  getInstallations,
  createInstallation,
  completeCommissioning,
  getWarranties,
  checkWarranty,
  getServiceTickets,
  getServiceTicketById,
  createServiceTicket,
  assignEngineer,
  recordDiagnosis,
  addSparePartsToTicket,
  completeServiceRepair,
  customerSignOffService,
  getRMAs,
  getRMAById,
  createRMA,
  approveRMA,
  resolveRMA
};
