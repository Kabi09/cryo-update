const EquipmentMaintenance = require('../models/EquipmentMaintenance');
const RDProject = require('../models/RDProject');
const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

// EQUIPMENT MAINTENANCE
const getMaintenanceTasks = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['maintenanceNumber', 'equipmentName'], ['status', 'type', 'workCenter']);
  const [items, total] = await Promise.all([
    EquipmentMaintenance.find(filter).populate('workCenter').populate('assignedTechnician', 'name email').sort(sort).skip(skip).limit(limit),
    EquipmentMaintenance.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createMaintenanceTask = async (data, req) => {
  const maintenanceNumber = await getNextSequence('MAINTENANCE');
  const task = await EquipmentMaintenance.create({
    ...data,
    maintenanceNumber,
    assignedTechnician: data.assignedTechnician || req.user._id,
    status: WORKFLOW_STATUS.EQUIPMENT_MAINTENANCE.SCHEDULED
  });

  await recordAudit({
    req,
    action: 'CREATE_MAINTENANCE',
    module: 'MAINTENANCE',
    entityType: 'EquipmentMaintenance',
    entityId: task._id,
    documentNumber: task.maintenanceNumber
  });

  return task;
};

const completeMaintenanceTask = async (id, { findings, sparesConsumed = [] }, req) => {
  const task = await EquipmentMaintenance.findById(id);
  if (!task) throw ApiError.notFound('Maintenance task not found');

  task.findings = findings || 'Routine maintenance checks completed';
  task.sparesConsumed = sparesConsumed;
  task.completedDate = new Date();
  task.status = WORKFLOW_STATUS.EQUIPMENT_MAINTENANCE.COMPLETED;
  await task.save();

  await recordAudit({
    req,
    action: 'COMPLETE_MAINTENANCE',
    module: 'MAINTENANCE',
    entityType: 'EquipmentMaintenance',
    entityId: task._id,
    documentNumber: task.maintenanceNumber,
    remarks: task.findings
  });

  return task;
};

// R&D PROJECTS
const getRDProjects = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['projectCode', 'title'], ['status', 'leadEngineer']);
  const [items, total] = await Promise.all([
    RDProject.find(filter).populate('leadEngineer', 'name email').populate('approvedBy', 'name email').sort(sort).skip(skip).limit(limit),
    RDProject.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const createRDProject = async (data, req) => {
  const projectCode = `RND-${Date.now().toString().slice(-6)}`;
  const project = await RDProject.create({
    ...data,
    projectCode,
    leadEngineer: req.user._id,
    status: WORKFLOW_STATUS.RND_PROJECT.PROPOSED
  });

  await recordAudit({
    req,
    action: 'CREATE_RND_PROJECT',
    module: 'RND',
    entityType: 'RDProject',
    entityId: project._id,
    documentNumber: project.projectCode
  });

  return project;
};

const approveRDProject = async (id, req) => {
  const project = await RDProject.findById(id);
  if (!project) throw ApiError.notFound('R&D project not found');

  project.status = WORKFLOW_STATUS.RND_PROJECT.APPROVED;
  project.approvedBy = req.user._id;
  await project.save();

  await recordAudit({
    req,
    action: 'APPROVE_RND_PROJECT',
    module: 'RND',
    entityType: 'RDProject',
    entityId: project._id,
    documentNumber: project.projectCode
  });

  return project;
};

const recordRDTestResult = async (id, testResults, req) => {
  const project = await RDProject.findById(id);
  if (!project) throw ApiError.notFound('R&D project not found');

  project.testResults = testResults;
  project.status = WORKFLOW_STATUS.RND_PROJECT.TESTING;
  await project.save();

  await recordAudit({
    req,
    action: 'RECORD_RND_TEST',
    module: 'RND',
    entityType: 'RDProject',
    entityId: project._id,
    documentNumber: project.projectCode
  });

  return project;
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
