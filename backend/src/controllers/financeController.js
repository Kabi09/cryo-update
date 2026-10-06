const financeService = require('../services/financeService');
const ApiResponse = require('../utils/apiResponse');

const getPayments = async (req, res, next) => {
  try {
    const result = await financeService.getPayments(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await financeService.getPaymentById(req.params.id);
    return ApiResponse.success(res, { data: payment });
  } catch (error) { next(error); }
};

const recordPayment = async (req, res, next) => {
  try {
    const payment = await financeService.recordPayment(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Payment recorded', data: payment });
  } catch (error) { next(error); }
};

const verifyPayment = async (req, res, next) => {
  try {
    const result = await financeService.verifyPayment(req.params.id, req);
    return ApiResponse.success(res, { message: 'Payment verified and credited', data: result });
  } catch (error) { next(error); }
};

const refundPayment = async (req, res, next) => {
  try {
    const payment = await financeService.refundPayment(req.params.id, req.body.reason, req);
    return ApiResponse.success(res, { message: 'Payment refunded', data: payment });
  } catch (error) { next(error); }
};

const getReceivablesSummary = async (req, res, next) => {
  try {
    const summary = await financeService.getReceivablesSummary();
    return ApiResponse.success(res, { data: summary });
  } catch (error) { next(error); }
};

const getPayablesSummary = async (req, res, next) => {
  try {
    const summary = await financeService.getPayablesSummary();
    return ApiResponse.success(res, { data: summary });
  } catch (error) { next(error); }
};

const performThreeWayMatch = async (req, res, next) => {
  try {
    const result = await financeService.performThreeWayMatch(req.body);
    return ApiResponse.success(res, { data: result });
  } catch (error) { next(error); }
};

const syncFinalInvoiceToTally = async (req, res, next) => {
  try {
    const result = await financeService.syncFinalInvoiceToTally(req.params.id);
    return ApiResponse.success(res, { message: 'Invoice synchronized with Tally', data: result });
  } catch (error) { next(error); }
};

module.exports = {
  getPayments,
  getPaymentById,
  recordPayment,
  verifyPayment,
  refundPayment,
  getReceivablesSummary,
  getPayablesSummary,
  performThreeWayMatch,
  syncFinalInvoiceToTally
};
