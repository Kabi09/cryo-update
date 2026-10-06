const qaService = require('../services/qaService');
const ApiResponse = require('../utils/apiResponse');

const getQAInspections = async (req, res, next) => {
  try {
    const result = await qaService.getQAInspections(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getQAInspectionById = async (req, res, next) => {
  try {
    const qa = await qaService.getQAInspectionById(req.params.id);
    return ApiResponse.success(res, { data: qa });
  } catch (error) { next(error); }
};

const passQAInspection = async (req, res, next) => {
  try {
    const result = await qaService.passQAInspection(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'QA Inspection passed, serial and certificate issued', data: result });
  } catch (error) { next(error); }
};

const failQAInspection = async (req, res, next) => {
  try {
    const qa = await qaService.failQAInspection(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'QA Inspection marked as failed, sent for rework', data: qa });
  } catch (error) { next(error); }
};

const retestQAInspection = async (req, res, next) => {
  try {
    const result = await qaService.retestQAInspection(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Retest processed', data: result });
  } catch (error) { next(error); }
};

const getSerialNumbers = async (req, res, next) => {
  try {
    const result = await qaService.getSerialNumbers(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getSerialNumberById = async (req, res, next) => {
  try {
    const serial = await qaService.getSerialNumberById(req.params.id);
    return ApiResponse.success(res, { data: serial });
  } catch (error) { next(error); }
};

const getSerialNumberTrace = async (req, res, next) => {
  try {
    const trace = await qaService.getSerialNumberTrace(req.params.serialNumber);
    return ApiResponse.success(res, { data: trace });
  } catch (error) { next(error); }
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
