const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseRequest',
      required: true,
      index: true
    },
    items: [
      {
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
        materialName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitOfMeasure: { type: String, default: 'NOS' },
        requiredByDate: { type: Date, default: null }
      }
    ],
    invitedVendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
      }
    ],
    selectedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null
    },
    vendorSelectionReason: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.RFQ),
      default: WORKFLOW_STATUS.RFQ.DRAFT,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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

rfqSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RFQ', rfqSchema);
