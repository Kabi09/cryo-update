const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const discrepancySchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    expectedValue: { type: mongoose.Schema.Types.Mixed },
    receivedValue: { type: mongoose.Schema.Types.Mixed },
    remarks: { type: String, default: '' }
  },
  { _id: false }
);

const customerPoSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customerPoReference: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    customerPoDate: {
      type: Date,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true
    },
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice',
      default: null
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        lineTotal: { type: Number, required: true }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    deliveryDate: {
      type: Date,
      default: null
    },
    paymentTerms: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.CUSTOMER_PO),
      default: WORKFLOW_STATUS.CUSTOMER_PO.RECEIVED,
      index: true
    },
    verificationDetails: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      verifiedAt: { type: Date, default: null },
      matched: { type: Boolean, default: false },
      discrepancies: [discrepancySchema],
      holdReason: { type: String, default: null },
      resolutionNotes: { type: String, default: null }
    },
    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      default: null
    },
    poDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    },
    receivedBy: {
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

customerPoSchema.index({ customerPoReference: 1, customer: 1 });

module.exports = mongoose.model('CustomerPO', customerPoSchema);
