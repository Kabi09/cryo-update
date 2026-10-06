const maintenanceService = require('../services/maintenanceService');
const ApiResponse = require('../utils/apiResponse');

// Maintenance
const getMaintenanceTasks = async (req, res, next) => {
  try {
    const result = await maintenanceService.getMaintenanceTasks(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createMaintenanceTask = async (req, res, next) => {
  try {
    const task = await maintenanceService.createMaintenanceTask(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Maintenance task scheduled', data: task });
  } catch (error) { next(error); }
};

const completeMaintenanceTask = async (req, res, next) => {
  try {
    const task = await maintenanceService.completeMaintenanceTask(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Maintenance task completed', data: task });
  } catch (error) { next(error); }
};

// R&D
const getRDProjects = async (req, res, next) => {
  try {
    const result = await maintenanceService.getRDProjects(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const createRDProject = async (req, res, next) => {
  try {
    const project = await maintenanceService.createRDProject(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'R&D project proposed', data: project });
  } catch (error) { next(error); }
};

const approveRDProject = async (req, res, next) => {
  try {
    const project = await maintenanceService.approveRDProject(req.params.id, req);
    return ApiResponse.success(res, { message: 'R&D project approved', data: project });
  } catch (error) { next(error); }
};

const recordRDTestResult = async (req, res, next) => {
  try {
    const project = await maintenanceService.recordRDTestResult(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'R&D test results recorded', data: project });
  } catch (error) { next(error); }
};

module.exports = {
  getMaintenanceTasks,
  createMaintenanceTask,
  completeMaintenanceTask,
  getRDProjects,
  createRDProject,
  approveRDProject,
  recordRDTestResult
};
