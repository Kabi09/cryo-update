const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const dispatchSchema = new mongoose.Schema(
  {
    dispatchNumber: {
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
    finalInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinalInvoice',
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    packing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Packing',
      required: true
    },
    serialNumbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SerialNumber',
        required: true
      }
    ],
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transporter',
      default: null
    },
    transporterName: {
      type: String,
      required: true
    },
    trackingNumber: {
      type: String, // LR (Lorry Receipt) Number
      required: true,
      trim: true,
      index: true
    },
    vehicleNumber: {
      type: String,
      default: ''
    },
    driverPhone: {
      type: String,
      default: ''
    },
    eWayBillNumber: {
      type: String,
      default: ''
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    dispatchedDate: {
      type: Date,
      default: Date.now
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.DISPATCH),
      default: WORKFLOW_STATUS.DISPATCH.DISPATCHED,
      index: true
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

dispatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Dispatch', dispatchSchema);
