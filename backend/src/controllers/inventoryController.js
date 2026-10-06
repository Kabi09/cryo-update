const inventoryService = require('../services/inventoryService');
const ApiResponse = require('../utils/apiResponse');

const getInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventory(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getStockLedger = async (req, res, next) => {
  try {
    const result = await inventoryService.getStockLedger(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const transferStock = async (req, res, next) => {
  try {
    const result = await inventoryService.transferStock(req.body, req);
    return ApiResponse.success(res, { message: 'Warehouse transfer completed', data: result });
  } catch (error) { next(error); }
};

const adjustStock = async (req, res, next) => {
  try {
    const result = await inventoryService.adjustStock(req.body, req);
    return ApiResponse.success(res, { message: 'Stock adjustment recorded', data: result });
  } catch (error) { next(error); }
};

const getLowStockItems = async (req, res, next) => {
  try {
    const list = await inventoryService.getLowStockItems();
    return ApiResponse.success(res, { data: list });
  } catch (error) { next(error); }
};

module.exports = {
  getInventory,
  getStockLedger,
  transferStock,
  adjustStock,
  getLowStockItems
};
