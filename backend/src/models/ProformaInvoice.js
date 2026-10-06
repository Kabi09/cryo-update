const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const piSchema = new mongoose.Schema(
  {
    piNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true
    },
    revisionCode: {
      type: String,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        taxPercent: { type: Number, default: 18 },
        taxAmount: { type: Number, default: 0 },
        lineTotal: { type: Number, required: true }
      }
    ],
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
    advancePercent: {
      type: Number,
      default: 30
    },
    advanceAmount: {
      type: Number,
      required: true
    },
    paymentTerms: {
      type: String,
      default: '30% Advance, 70% Before Dispatch'
    },
    deliveryTerms: {
      type: String,
      default: '15 Days from Advance'
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.PROFORMA_INVOICE),
      default: WORKFLOW_STATUS.PROFORMA_INVOICE.DRAFT,
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

module.exports = mongoose.model('ProformaInvoice', piSchema);
