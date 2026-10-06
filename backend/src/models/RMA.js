const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const rmaSchema = new mongoose.Schema(
  {
    rmaNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    serialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber',
      required: true,
      index: true
    },
    serviceTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceTicket',
      default: null
    },
    reasonForReturn: {
      type: String,
      required: true
    },
    resolutionType: {
      type: String,
      enum: ['REPAIR_RETURN', 'REPLACEMENT', 'CREDIT_NOTE', 'REFUND'],
      default: 'REPAIR_RETURN'
    },
    inspectionNotes: {
      type: String,
      default: ''
    },
    replacementSerialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber',
      default: null
    },
    creditAmount: {
      type: Number,
      default: 0
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.RMA),
      default: WORKFLOW_STATUS.RMA.REQUESTED,
      index: true
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        remarks: String
      }
    ]
  },
  {
    timestamps: true
  }
);

rmaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RMA', rmaSchema);
