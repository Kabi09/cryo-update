const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const salesOrderSchema = new mongoose.Schema(
  {
    salesOrderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customerPo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerPO',
      required: true,
      index: true
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
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
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
    totalPaidAmount: {
      type: Number,
      default: 0
    },
    advanceRequiredAmount: {
      type: Number,
      default: 0
    },
    advancePaid: {
      type: Boolean,
      default: false,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID'],
      default: 'PENDING'
    },
    isReleasedToProduction: {
      type: Boolean,
      default: false,
      index: true
    },
    releasedAt: {
      type: Date,
      default: null
    },
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deliveryDueDate: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.SALES_ORDER),
      default: WORKFLOW_STATUS.SALES_ORDER.CONFIRMED,
      index: true
    },
    productionOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionOrder'
      }
    ],
    cancellationReason: {
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

salesOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
