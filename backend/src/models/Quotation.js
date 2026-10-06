const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const quotationItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discountAmount: {
      type: Number,
      default: 0
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

const negotiationSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    requestedPrice: {
      type: Number,
      default: null
    },
    requestedDiscount: {
      type: Number,
      default: null
    },
    customerMessage: {
      type: String,
      required: true
    },
    salesResponse: {
      type: String,
      default: ''
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { _id: true }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    revisionNumber: {
      type: Number,
      default: 0
    },
    revisionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    isLatestRevision: {
      type: Boolean,
      default: true,
      index: true
    },
    parentQuotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      default: null
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      default: null,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    items: [quotationItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    totalDiscount: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0
    },
    validityDays: {
      type: Number,
      default: 30
    },
    validUntil: {
      type: Date,
      required: true
    },
    paymentTerms: {
      type: String,
      default: '30% Advance, 70% Before Dispatch'
    },
    deliveryTerms: {
      type: String,
      default: '15 Days from Advance Payment'
    },
    warrantyTerms: {
      type: String,
      default: '12 Months Comprehensive Warranty'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.QUOTATION),
      default: WORKFLOW_STATUS.QUOTATION.DRAFT,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    rejectionReason: {
      type: String,
      default: null
    },
    negotiationHistory: [negotiationSchema],
    acceptedAt: {
      type: Date,
      default: null
    },
    acceptedByCustomerPerson: {
      type: String,
      default: null
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

quotationSchema.index({ quotationNumber: 1, revisionNumber: 1 });
quotationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Quotation', quotationSchema);
