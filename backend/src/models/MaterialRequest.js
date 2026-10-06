const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const materialRequestItemSchema = new mongoose.Schema(
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
    requiredQuantity: {
      type: Number,
      required: true,
      min: 0.001
    },
    availableQuantity: {
      type: Number,
      default: 0
    },
    shortageQuantity: {
      type: Number,
      default: 0
    },
    issuedQuantity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'FULL_AVAILABLE', 'PARTIAL_AVAILABLE', 'SHORTAGE', 'ISSUED'],
      default: 'PENDING'
    }
  },
  { _id: true }
);

const materialRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
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
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [materialRequestItemSchema],
    hasShortage: {
      type: Boolean,
      default: false,
      index: true
    },
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseRequest',
      default: null
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.MATERIAL_REQUEST),
      default: WORKFLOW_STATUS.MATERIAL_REQUEST.DRAFT,
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

materialRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);
