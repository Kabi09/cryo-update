const masterService = require('../services/masterService');
const ApiResponse = require('../utils/apiResponse');

// Customers
const getCustomers = async (req, res, next) => {
  try {
    const result = await masterService.getCustomers(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await masterService.getCustomerById(req.params.id);
    return ApiResponse.success(res, { data: customer });
  } catch (error) { next(error); }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await masterService.createCustomer(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Customer created', data: customer });
  } catch (error) { next(error); }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await masterService.updateCustomer(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Customer updated', data: customer });
  } catch (error) { next(error); }
};

// Products
const getProducts = async (req, res, next) => {
  try {
    const result = await masterService.getProducts(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await masterService.getProductById(req.params.id);
    return ApiResponse.success(res, { data: product });
  } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await masterService.createProduct(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Product created', data: product });
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await masterService.updateProduct(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Product updated', data: product });
  } catch (error) { next(error); }
};

// Materials
const getMaterials = async (req, res, next) => {
  try {
    const result = await masterService.getMaterials(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getMaterialById = async (req, res, next) => {
  try {
    const material = await masterService.getMaterialById(req.params.id);
    return ApiResponse.success(res, { data: material });
  } catch (error) { next(error); }
};

const createMaterial = async (req, res, next) => {
  try {
    const material = await masterService.createMaterial(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Material created', data: material });
  } catch (error) { next(error); }
};

const updateMaterial = async (req, res, next) => {
  try {
    const material = await masterService.updateMaterial(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Material updated', data: material });
  } catch (error) { next(error); }
};

// Vendors
const getVendors = async (req, res, next) => {
  try {
    const result = await masterService.getVendors(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getVendorById = async (req, res, next) => {
  try {
    const vendor = await masterService.getVendorById(req.params.id);
    return ApiResponse.success(res, { data: vendor });
  } catch (error) { next(error); }
};

const createVendor = async (req, res, next) => {
  try {
    const vendor = await masterService.createVendor(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Vendor created', data: vendor });
  } catch (error) { next(error); }
};

const updateVendor = async (req, res, next) => {
  try {
    const vendor = await masterService.updateVendor(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Vendor updated', data: vendor });
  } catch (error) { next(error); }
};

// Warehouses, Work Centers, Transporters
const getWarehouses = async (req, res, next) => {
  try {
    const result = await masterService.getWarehouses(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createWarehouse = async (req, res, next) => {
  try {
    const wh = await masterService.createWarehouse(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Warehouse created', data: wh });
  } catch (error) { next(error); }
};

const getWorkCenters = async (req, res, next) => {
  try {
    const result = await masterService.getWorkCenters(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createWorkCenter = async (req, res, next) => {
  try {
    const wc = await masterService.createWorkCenter(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Work Center created', data: wc });
  } catch (error) { next(error); }
};

const getTransporters = async (req, res, next) => {
  try {
    const result = await masterService.getTransporters(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createTransporter = async (req, res, next) => {
  try {
    const t = await masterService.createTransporter(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Transporter created', data: t });
  } catch (error) { next(error); }
};

// Configurations
const getConfigurations = async (req, res, next) => {
  try {
    const configs = await masterService.getConfigurations();
    return ApiResponse.success(res, { data: configs });
  } catch (error) { next(error); }
};

const setConfiguration = async (req, res, next) => {
  try {
    const { key, value, category, description, isClientConfirmed } = req.body;
    const config = await masterService.setConfiguration(key, value, { category, description, isClientConfirmed, req });
    return ApiResponse.success(res, { message: 'Configuration saved', data: config });
  } catch (error) { next(error); }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  getWarehouses,
  createWarehouse,
  getWorkCenters,
  createWorkCenter,
  getTransporters,
  createTransporter,
  getConfigurations,
  setConfiguration
};
