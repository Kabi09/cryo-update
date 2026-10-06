const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const equipmentMaintenanceSchema = new mongoose.Schema(
  {
    maintenanceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    equipmentName: {
      type: String,
      required: true,
      trim: true
    },
    workCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkCenter',
      default: null
    },
    type: {
      type: String,
      enum: ['PREVENTIVE', 'BREAKDOWN'],
      default: 'PREVENTIVE'
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    completedDate: {
      type: Date,
      default: null
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    taskDescription: {
      type: String,
      required: true
    },
    sparesConsumed: [
      {
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
        materialName: String,
        quantity: Number
      }
    ],
    findings: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.EQUIPMENT_MAINTENANCE),
      default: WORKFLOW_STATUS.EQUIPMENT_MAINTENANCE.SCHEDULED,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('EquipmentMaintenance', equipmentMaintenanceSchema);
