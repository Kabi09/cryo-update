const mongoose = require('mongoose');

const serialNumberSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    productionOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionOrder',
      required: true,
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
    qaInspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QAInspection',
      default: null
    },
    packing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Packing',
      default: null
    },
    finalInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinalInvoice',
      default: null
    },
    dispatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispatch',
      default: null
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null
    },
    installation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installation',
      default: null
    },
    warranty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warranty',
      default: null
    },
    currentStatus: {
      type: String,
      enum: [
        'IN_PRODUCTION',
        'QA_PASSED',
        'FINISHED_GOODS',
        'PACKED',
        'DISPATCHED',
        'DELIVERED',
        'COMMISSIONED',
        'UNDER_WARRANTY',
        'OUT_OF_WARRANTY',
        'IN_SERVICE',
        'RMA_RETURNED'
      ],
      default: 'QA_PASSED',
      index: true
    },
    manufacturedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SerialNumber', serialNumberSchema);
