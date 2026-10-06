const mongoose = require('mongoose');

const finishedGoodsSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber',
      required: true,
      unique: true,
      index: true
    },
    serialNumberString: {
      type: String,
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
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
      required: true
    },
    status: {
      type: String,
      enum: ['READY_FOR_PACKING', 'PACKED', 'DISPATCHED', 'DELIVERED'],
      default: 'READY_FOR_PACKING',
      index: true
    },
    qaCertificateNumber: {
      type: String,
      default: ''
    },
    receivedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FinishedGoods', finishedGoodsSchema);
