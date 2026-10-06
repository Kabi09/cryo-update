const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const grnItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    materialName: {
      type: String,
      required: true
    },
    orderedQuantity: {
      type: Number,
      required: true
    },
    receivedQuantity: {
      type: Number,
      required: true,
      min: 0.001
    },
    acceptedQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    rejectedQuantity: {
      type: Number,
      default: 0
    },
    damagedQuantity: {
      type: Number,
      default: 0
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const grnSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    vendorPo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorPO',
      required: true,
      index: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true
    },
    challanNumber: {
      type: String,
      required: true,
      trim: true
    },
    challanDate: {
      type: Date,
      default: Date.now
    },
    receivedDate: {
      type: Date,
      default: Date.now
    },
    items: [grnItemSchema],
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspectionRemarks: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.GRN),
      default: WORKFLOW_STATUS.GRN.ACCEPTED,
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

grnSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GRN', grnSchema);
