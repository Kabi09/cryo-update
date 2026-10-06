const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const testParameterSchema = new mongoose.Schema(
  {
    parameter: {
      type: String,
      required: true
    },
    expectedValue: {
      type: String,
      required: true
    },
    actualValue: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const qaInspectionSchema = new mongoose.Schema(
  {
    inspectionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    productionOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionOrder',
      required: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    serialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber',
      default: null,
      index: true
    },
    testParameters: [testParameterSchema],
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspectionDate: {
      type: Date,
      default: Date.now
    },
    result: {
      type: String,
      enum: ['PASSED', 'FAILED', 'RETESTED', 'SCRAPPED'],
      default: 'PASSED'
    },
    certificateNumber: {
      type: String,
      default: null,
      index: true
    },
    certificateGeneratedAt: {
      type: Date,
      default: null
    },
    reworkInstructions: {
      type: String,
      default: null
    },
    retestCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.QA_INSPECTION),
      default: WORKFLOW_STATUS.QA_INSPECTION.PASSED,
      index: true
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

qaInspectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QAInspection', qaInspectionSchema);
