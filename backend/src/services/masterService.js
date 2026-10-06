const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Material = require('../models/Material');
const Vendor = require('../models/Vendor');
const Warehouse = require('../models/Warehouse');
const WorkCenter = require('../models/WorkCenter');
const Transporter = require('../models/Transporter');
const Configuration = require('../models/Configuration');
const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');

// CUSTOMER
const getCustomers = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['companyName', 'contactPerson', 'email', 'phone', 'customerId'], ['customerType', 'isActive']);
  const [items, total] = await Promise.all([
    Customer.find(filter).sort(sort).skip(skip).limit(limit),
    Customer.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

const createCustomer = async (data, req) => {
  const customerId = await getNextSequence('CUSTOMER');
  const customer = await Customer.create({ ...data, customerId });
  await recordAudit({
    req,
    action: 'CREATE',
    module: 'MASTER_CUSTOMER',
    entityType: 'Customer',
    entityId: customer._id,
    documentNumber: customer.customerId,
    after: customer.toObject()
  });
  return customer;
};

const updateCustomer = async (id, data, req) => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound('Customer not found');
  const before = customer.toObject();
  Object.assign(customer, data);
  await customer.save();
  await recordAudit({
    req,
    action: 'UPDATE',
    module: 'MASTER_CUSTOMER',
    entityType: 'Customer',
    entityId: customer._id,
    documentNumber: customer.customerId,
    before,
    after: customer.toObject()
  });
  return customer;
};

// PRODUCT
const getProducts = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['name', 'modelNumber', 'productCode'], ['category', 'isActive']);
  const [items, total] = await Promise.all([
    Product.find(filter).populate('activeBOM').sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate('activeBOM');
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const createProduct = async (data, req) => {
  const productCode = await getNextSequence('PRODUCT');
  const product = await Product.create({ ...data, productCode });
  await recordAudit({
    req,
    action: 'CREATE',
    module: 'MASTER_PRODUCT',
    entityType: 'Product',
    entityId: product._id,
    documentNumber: product.productCode,
    after: product.toObject()
  });
  return product;
};

const updateProduct = async (id, data, req) => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  const before = product.toObject();
  Object.assign(product, data);
  await product.save();
  await recordAudit({
    req,
    action: 'UPDATE',
    module: 'MASTER_PRODUCT',
    entityType: 'Product',
    entityId: product._id,
    documentNumber: product.productCode,
    before,
    after: product.toObject()
  });
  return product;
};

// MATERIAL
const getMaterials = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['name', 'partNumber', 'materialCode'], ['category', 'isActive']);
  const [items, total] = await Promise.all([
    Material.find(filter).sort(sort).skip(skip).limit(limit),
    Material.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getMaterialById = async (id) => {
  const material = await Material.findById(id);
  if (!material) throw ApiError.notFound('Material not found');
  return material;
};

const createMaterial = async (data, req) => {
  const materialCode = await getNextSequence('MATERIAL');
  const material = await Material.create({ ...data, materialCode });
  await recordAudit({
    req,
    action: 'CREATE',
    module: 'MASTER_MATERIAL',
    entityType: 'Material',
    entityId: material._id,
    documentNumber: material.materialCode,
    after: material.toObject()
  });
  return material;
};

const updateMaterial = async (id, data, req) => {
  const material = await Material.findById(id);
  if (!material) throw ApiError.notFound('Material not found');
  const before = material.toObject();
  Object.assign(material, data);
  await material.save();
  await recordAudit({
    req,
    action: 'UPDATE',
    module: 'MASTER_MATERIAL',
    entityType: 'Material',
    entityId: material._id,
    documentNumber: material.materialCode,
    before,
    after: material.toObject()
  });
  return material;
};

// VENDOR
const getVendors = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['name', 'contactPerson', 'email', 'phone', 'vendorId'], ['isActive']);
  const [items, total] = await Promise.all([
    Vendor.find(filter).sort(sort).skip(skip).limit(limit),
    Vendor.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getVendorById = async (id) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) throw ApiError.notFound('Vendor not found');
  return vendor;
};

const createVendor = async (data, req) => {
  const vendorId = await getNextSequence('VENDOR');
  const vendor = await Vendor.create({ ...data, vendorId });
  await recordAudit({
    req,
    action: 'CREATE',
    module: 'MASTER_VENDOR',
    entityType: 'Vendor',
    entityId: vendor._id,
    documentNumber: vendor.vendorId,
    after: vendor.toObject()
  });
  return vendor;
};

const updateVendor = async (id, data, req) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) throw ApiError.notFound('Vendor not found');
  const before = vendor.toObject();
  Object.assign(vendor, data);
  await vendor.save();
  await recordAudit({
    req,
    action: 'UPDATE',
    module: 'MASTER_VENDOR',
    entityType: 'Vendor',
    entityId: vendor._id,
    documentNumber: vendor.vendorId,
    before,
    after: vendor.toObject()
  });
  return vendor;
};

// WAREHOUSE
const getWarehouses = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['name', 'code', 'location'], ['isActive']);
  const [items, total] = await Promise.all([
    Warehouse.find(filter).populate('manager', 'name email').sort(sort).skip(skip).limit(limit),
    Warehouse.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createWarehouse = async (data) => {
  return Warehouse.create(data);
};

// WORK CENTER
const getWorkCenters = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['name', 'code'], ['department', 'isActive']);
  const [items, total] = await Promise.all([
    WorkCenter.find(filter).populate('supervisor', 'name email').sort(sort).skip(skip).limit(limit),
    WorkCenter.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createWorkCenter = async (data) => {
  return WorkCenter.create(data);
};

// TRANSPORTER
const getTransporters = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['name', 'code', 'phone'], ['isActive']);
  const [items, total] = await Promise.all([
    Transporter.find(filter).sort(sort).skip(skip).limit(limit),
    Transporter.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createTransporter = async (data) => {
  return Transporter.create(data);
};

// CONFIGURATION
const getConfigurations = async () => {
  return Configuration.find();
};

const getConfigurationByKey = async (key) => {
  const config = await Configuration.findOne({ key });
  return config ? config.value : null;
};

const setConfiguration = async (key, value, { category = 'GENERAL', description = '', isClientConfirmed = false, req } = {}) => {
  const before = await Configuration.findOne({ key });
  const config = await Configuration.findOneAndUpdate(
    { key },
    {
      value,
      category,
      description,
      isClientConfirmed,
      updatedBy: req && req.user ? req.user._id : null
    },
    { upsert: true, new: true }
  );

  await recordAudit({
    req,
    action: 'SET_CONFIG',
    module: 'CONFIGURATION',
    entityType: 'Configuration',
    entityId: config._id,
    before: before ? before.value : null,
    after: value,
    remarks: `Configuration '${key}' updated`
  });

  return config;
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
  getConfigurationByKey,
  setConfiguration
};
