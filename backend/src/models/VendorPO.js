const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const vendorPoItemSchema = new mongoose.Schema(
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
      required: true,
      min: 0.001
    },
    receivedQuantity: {
      type: Number,
      default: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxPercent: {
      type: Number,
      default: 18
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    lineTotal: {
      type: Number,
      required: true
    }
  },
  { _id: true }
);

const vendorPoSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      default: null
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },
    items: [vendorPoItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    totalTax: {
      type: Number,
      required: true
    },
    grandTotal: {
      type: Number,
      required: true
    },
    expectedDeliveryDate: {
      type: Date,
      default: null
    },
    paymentTerms: {
      type: String,
      default: '30 Days Net'
    },
    shippingAddress: {
      type: String,
      default: 'Cryo Scientific Systems Pvt Ltd Factory, Chennai'
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.VENDOR_PO),
      default: WORKFLOW_STATUS.VENDOR_PO.DRAFT,
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    grns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GRN'
      }
    ],
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

vendorPoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VendorPO', vendorPoSchema);
