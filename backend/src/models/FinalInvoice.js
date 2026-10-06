const mongoose = require('mongoose');

const finalInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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
      required: true,
      index: true
    },
    customerPoReference: {
      type: String,
      default: ''
    },
    serialNumbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SerialNumber'
      }
    ],
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
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    paymentTerms: {
      type: String,
      default: ''
    },
    tallyIntegration: {
      syncStatus: {
        type: String,
        enum: ['PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'RETRY'],
        default: 'PENDING',
        index: true
      },
      syncAttemptedAt: { type: Date, default: null },
      syncedAt: { type: Date, default: null },
      externalReference: { type: String, default: null },
      syncError: { type: String, default: null }
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'],
      default: 'ISSUED',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

finalInvoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FinalInvoice', finalInvoiceSchema);
