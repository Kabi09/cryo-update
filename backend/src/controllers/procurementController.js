const procurementService = require('../services/procurementService');
const ApiResponse = require('../utils/apiResponse');

// Purchase Requests
const getPurchaseRequests = async (req, res, next) => {
  try {
    const result = await procurementService.getPurchaseRequests(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getPurchaseRequestById = async (req, res, next) => {
  try {
    const pr = await procurementService.getPurchaseRequestById(req.params.id);
    return ApiResponse.success(res, { data: pr });
  } catch (error) { next(error); }
};

const createPurchaseRequest = async (req, res, next) => {
  try {
    const pr = await procurementService.createPurchaseRequest(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Purchase request created', data: pr });
  } catch (error) { next(error); }
};

const approvePurchaseRequest = async (req, res, next) => {
  try {
    const pr = await procurementService.approvePurchaseRequest(req.params.id, req);
    return ApiResponse.success(res, { message: 'Purchase request approved', data: pr });
  } catch (error) { next(error); }
};

// RFQ
const getRFQs = async (req, res, next) => {
  try {
    const result = await procurementService.getRFQs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getRFQById = async (req, res, next) => {
  try {
    const rfq = await procurementService.getRFQById(req.params.id);
    return ApiResponse.success(res, { data: rfq });
  } catch (error) { next(error); }
};

const createRFQ = async (req, res, next) => {
  try {
    const rfq = await procurementService.createRFQ(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'RFQ created', data: rfq });
  } catch (error) { next(error); }
};

const selectVendorForRFQ = async (req, res, next) => {
  try {
    const rfq = await procurementService.selectVendorForRFQ(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Vendor selected for RFQ', data: rfq });
  } catch (error) { next(error); }
};

// Vendor Quotations
const getVendorQuotations = async (req, res, next) => {
  try {
    const quotes = await procurementService.getVendorQuotations(req.params.rfqId);
    return ApiResponse.success(res, { data: quotes });
  } catch (error) { next(error); }
};

const recordVendorQuotation = async (req, res, next) => {
  try {
    const vq = await procurementService.recordVendorQuotation(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Vendor quotation logged', data: vq });
  } catch (error) { next(error); }
};

// Vendor PO
const getVendorPOs = async (req, res, next) => {
  try {
    const result = await procurementService.getVendorPOs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getVendorPOById = async (req, res, next) => {
  try {
    const vpo = await procurementService.getVendorPOById(req.params.id);
    return ApiResponse.success(res, { data: vpo });
  } catch (error) { next(error); }
};

const createVendorPO = async (req, res, next) => {
  try {
    const vpo = await procurementService.createVendorPO(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Vendor PO created', data: vpo });
  } catch (error) { next(error); }
};

const approveVendorPO = async (req, res, next) => {
  try {
    const vpo = await procurementService.approveVendorPO(req.params.id, req);
    return ApiResponse.success(res, { message: 'Vendor PO approved', data: vpo });
  } catch (error) { next(error); }
};

// GRN
const getGRNs = async (req, res, next) => {
  try {
    const result = await procurementService.getGRNs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getGRNById = async (req, res, next) => {
  try {
    const grn = await procurementService.getGRNById(req.params.id);
    return ApiResponse.success(res, { data: grn });
  } catch (error) { next(error); }
};

const createGRN = async (req, res, next) => {
  try {
    const result = await procurementService.createGRN(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'GRN created and stock posted', data: result });
  } catch (error) { next(error); }
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
