const serviceService = require('../services/serviceService');
const ApiResponse = require('../utils/apiResponse');

// Installation
const getInstallations = async (req, res, next) => {
  try {
    const result = await serviceService.getInstallations(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createInstallation = async (req, res, next) => {
  try {
    const inst = await serviceService.createInstallation(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Installation record created', data: inst });
  } catch (error) { next(error); }
};

const completeCommissioning = async (req, res, next) => {
  try {
    const result = await serviceService.completeCommissioning(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Commissioning completed and warranty activated', data: result });
  } catch (error) { next(error); }
};

// Warranty
const getWarranties = async (req, res, next) => {
  try {
    const result = await serviceService.getWarranties(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const checkWarranty = async (req, res, next) => {
  try {
    const result = await serviceService.checkWarranty(req.params.serialNumber);
    return ApiResponse.success(res, { data: result });
  } catch (error) { next(error); }
};

// Service Tickets
const getServiceTickets = async (req, res, next) => {
  try {
    const result = await serviceService.getServiceTickets(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getServiceTicketById = async (req, res, next) => {
  try {
    const ticket = await serviceService.getServiceTicketById(req.params.id);
    return ApiResponse.success(res, { data: ticket });
  } catch (error) { next(error); }
};

const createServiceTicket = async (req, res, next) => {
  try {
    const ticket = await serviceService.createServiceTicket(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Service ticket logged', data: ticket });
  } catch (error) { next(error); }
};

const assignEngineer = async (req, res, next) => {
  try {
    const ticket = await serviceService.assignEngineer(req.params.id, req.body.engineerId, req);
    return ApiResponse.success(res, { message: 'Engineer assigned to ticket', data: ticket });
  } catch (error) { next(error); }
};

const recordDiagnosis = async (req, res, next) => {
  try {
    const ticket = await serviceService.recordDiagnosis(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Diagnosis recorded', data: ticket });
  } catch (error) { next(error); }
};

const addSparePartsToTicket = async (req, res, next) => {
  try {
    const ticket = await serviceService.addSparePartsToTicket(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Spare part logged for service', data: ticket });
  } catch (error) { next(error); }
};

const completeServiceRepair = async (req, res, next) => {
  try {
    const ticket = await serviceService.completeServiceRepair(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Service repair marked completed', data: ticket });
  } catch (error) { next(error); }
};

const customerSignOffService = async (req, res, next) => {
  try {
    const ticket = await serviceService.customerSignOffService(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Customer sign-off logged and ticket closed', data: ticket });
  } catch (error) { next(error); }
};

// RMA
const getRMAs = async (req, res, next) => {
  try {
    const result = await serviceService.getRMAs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getRMAById = async (req, res, next) => {
  try {
    const rma = await serviceService.getRMAById(req.params.id);
    return ApiResponse.success(res, { data: rma });
  } catch (error) { next(error); }
};

const createRMA = async (req, res, next) => {
  try {
    const rma = await serviceService.createRMA(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'RMA request created', data: rma });
  } catch (error) { next(error); }
};

const approveRMA = async (req, res, next) => {
  try {
    const rma = await serviceService.approveRMA(req.params.id, req);
    return ApiResponse.success(res, { message: 'RMA approved', data: rma });
  } catch (error) { next(error); }
};

const resolveRMA = async (req, res, next) => {
  try {
    const rma = await serviceService.resolveRMA(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'RMA resolved', data: rma });
  } catch (error) { next(error); }
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
