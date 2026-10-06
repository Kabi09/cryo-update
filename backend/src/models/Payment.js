const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const paymentSchema = new mongoose.Schema(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      required: true,
      index: true
    },
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice',
      default: null
    },
    finalInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinalInvoice',
      default: null
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    paymentType: {
      type: String,
      enum: ['ADVANCE', 'MILESTONE', 'FINAL_PAYMENT', 'SERVICE_FEE', 'REFUND'],
      default: 'ADVANCE'
    },
    paymentMethod: {
      type: String,
      enum: ['NEFT', 'RTGS', 'IMPS', 'CHEQUE', 'UPI', 'BANK_TRANSFER', 'CASH', 'OTHER'],
      default: 'NEFT'
    },
    transactionReference: {
      type: String,
      required: true,
      trim: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    bankName: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.PAYMENT),
      default: WORKFLOW_STATUS.PAYMENT.PENDING,
      index: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verificationRemarks: {
      type: String,
      default: ''
    },
    proofDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
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

paymentSchema.index({ transactionReference: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
