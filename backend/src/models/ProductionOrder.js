const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const stageOperationSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true,
      enum: ['FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
      default: 'PENDING'
    },
    workCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkCenter',
      default: null
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const productionOrderSchema = new mongoose.Schema(
  {
    productionOrderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    bom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BOM',
      required: true
    },
    bomVersionCode: {
      type: String,
      required: true
    },
    targetStartDate: {
      type: Date,
      default: null
    },
    targetCompletionDate: {
      type: Date,
      default: null
    },
    actualStartDate: {
      type: Date,
      default: null
    },
    actualCompletionDate: {
      type: Date,
      default: null
    },
    currentStage: {
      type: String,
      enum: ['READY', 'FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY', 'COMPLETED'],
      default: 'READY'
    },
    stageOperations: [stageOperationSchema],
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.PRODUCTION_ORDER),
      default: WORKFLOW_STATUS.PRODUCTION_ORDER.PLANNED,
      index: true
    },
    materialRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaterialRequest'
      }
    ],
    qaInspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QAInspection',
      default: null
    },
    serialNumbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SerialNumber'
      }
    ],
    assignedSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        remarks: String
      }
    ],
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

productionOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProductionOrder', productionOrderSchema);
