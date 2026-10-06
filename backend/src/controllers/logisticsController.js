const logisticsService = require('../services/logisticsService');
const ApiResponse = require('../utils/apiResponse');

// Finished Goods
const getFinishedGoods = async (req, res, next) => {
  try {
    const result = await logisticsService.getFinishedGoods(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

// Packing
const getPackings = async (req, res, next) => {
  try {
    const result = await logisticsService.getPackings(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createPacking = async (req, res, next) => {
  try {
    const packing = await logisticsService.createPacking(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Packing slip created', data: packing });
  } catch (error) { next(error); }
};

// Final Invoice
const getFinalInvoices = async (req, res, next) => {
  try {
    const result = await logisticsService.getFinalInvoices(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getFinalInvoiceById = async (req, res, next) => {
  try {
    const inv = await logisticsService.getFinalInvoiceById(req.params.id);
    return ApiResponse.success(res, { data: inv });
  } catch (error) { next(error); }
};

const createFinalInvoice = async (req, res, next) => {
  try {
    const inv = await logisticsService.createFinalInvoice(req.body.salesOrderId, req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Final tax invoice created', data: inv });
  } catch (error) { next(error); }
};

// Dispatch
const getDispatches = async (req, res, next) => {
  try {
    const result = await logisticsService.getDispatches(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createDispatch = async (req, res, next) => {
  try {
    const dispatch = await logisticsService.createDispatch(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Dispatch generated', data: dispatch });
  } catch (error) { next(error); }
};

// Delivery & POD
const getDeliveries = async (req, res, next) => {
  try {
    const result = await logisticsService.getDeliveries(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const completePOD = async (req, res, next) => {
  try {
    const delivery = await logisticsService.completePOD(req.params.dispatchId, req.body, req);
    return ApiResponse.success(res, { message: 'POD verified and delivery confirmed', data: delivery });
  } catch (error) { next(error); }
};

const recordDeliveryFailure = async (req, res, next) => {
  try {
    const delivery = await logisticsService.recordDeliveryFailure(req.params.dispatchId, req.body, req);
    return ApiResponse.success(res, { message: 'Delivery failure logged', data: delivery });
  } catch (error) { next(error); }
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
