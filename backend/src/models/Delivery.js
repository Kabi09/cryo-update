const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    dispatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispatch',
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
    serialNumbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SerialNumber'
      }
    ],
    actualDeliveryDate: {
      type: Date,
      default: Date.now
    },
    podDetails: {
      receivedBy: { type: String, required: true },
      receiverPhone: { type: String, default: '' },
      signatureUrl: { type: String, default: '' },
      podDocumentUrl: { type: String, default: '' },
      photos: [{ type: String }],
      remarks: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT', 'RETURNED'],
      default: 'DELIVERED',
      index: true
    },
    failureReason: {
      type: String,
      default: null
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

deliverySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
