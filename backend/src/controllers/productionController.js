const productionService = require('../services/productionService');
const ApiResponse = require('../utils/apiResponse');

// BOM
const getBOMs = async (req, res, next) => {
  try {
    const result = await productionService.getBOMs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getBOMById = async (req, res, next) => {
  try {
    const bom = await productionService.getBOMById(req.params.id);
    return ApiResponse.success(res, { data: bom });
  } catch (error) { next(error); }
};

const createBOM = async (req, res, next) => {
  try {
    const bom = await productionService.createBOM(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'BOM created', data: bom });
  } catch (error) { next(error); }
};

const approveBOM = async (req, res, next) => {
  try {
    const bom = await productionService.approveBOM(req.params.id, req);
    return ApiResponse.success(res, { message: 'BOM approved', data: bom });
  } catch (error) { next(error); }
};

// Production Orders
const getProductionOrders = async (req, res, next) => {
  try {
    const result = await productionService.getProductionOrders(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getProductionOrderById = async (req, res, next) => {
  try {
    const po = await productionService.getProductionOrderById(req.params.id);
    return ApiResponse.success(res, { data: po });
  } catch (error) { next(error); }
};

const createProductionOrder = async (req, res, next) => {
  try {
    const po = await productionService.createProductionOrder(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Production order created', data: po });
  } catch (error) { next(error); }
};

const releaseProductionOrder = async (req, res, next) => {
  try {
    const po = await productionService.releaseProductionOrder(req.params.id, req);
    return ApiResponse.success(res, { message: 'Production order released', data: po });
  } catch (error) { next(error); }
};

const requestMaterials = async (req, res, next) => {
  try {
    const result = await productionService.requestMaterialsForProduction(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Material request generated with stock check', data: result });
  } catch (error) { next(error); }
};

const issueMaterials = async (req, res, next) => {
  try {
    const result = await productionService.issueMaterials(req.params.id, req);
    return ApiResponse.success(res, { message: 'Materials issued to production', data: result });
  } catch (error) { next(error); }
};

const advanceStage = async (req, res, next) => {
  try {
    const po = await productionService.advanceProductionStage(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Production stage advanced', data: po });
  } catch (error) { next(error); }
};

module.exports = {
  getBOMs,
  getBOMById,
  createBOM,
  approveBOM,
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  releaseProductionOrder,
  requestMaterials,
  issueMaterials,
  advanceStage
};
