const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const prItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 0.001
    },
    unitOfMeasure: {
      type: String,
      default: 'NOS'
    },
    requiredByDate: {
      type: Date,
      default: null
    },
    estimatedCost: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

const purchaseRequestSchema = new mongoose.Schema(
  {
    prNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    materialRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaterialRequest',
      default: null,
      index: true
    },
    productionOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionOrder',
      default: null
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'HIGH'
    },
    items: [prItemSchema],
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.PURCHASE_REQUEST),
      default: WORKFLOW_STATUS.PURCHASE_REQUEST.DRAFT,
      index: true
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
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

purchaseRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
