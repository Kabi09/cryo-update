const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const packingSchema = new mongoose.Schema(
  {
    packingNumber: {
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
    serialNumbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SerialNumber',
        required: true
      }
    ],
    packagingType: {
      type: String,
      enum: ['WOODEN_CRATE', 'CORRUGATED_BOX', 'HEAVY_DUTY_PALLET', 'CUSTOM_CONTAINER'],
      default: 'WOODEN_CRATE'
    },
    grossWeightKg: {
      type: Number,
      default: 250
    },
    dimensions: {
      type: String,
      default: '1000 x 950 x 2100 mm'
    },
    checklist: {
      operationManualIncluded: { type: Boolean, default: true },
      calibrationCertificateIncluded: { type: Boolean, default: true },
      powerCordIncluded: { type: Boolean, default: true },
      keysIncluded: { type: Boolean, default: true },
      warrantyCardIncluded: { type: Boolean, default: true }
    },
    packedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.PACKING),
      default: WORKFLOW_STATUS.PACKING.PACKED,
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

packingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Packing', packingSchema);
