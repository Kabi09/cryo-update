const mongoose = require('mongoose');

const vendorQuotationSchema = new mongoose.Schema(
  {
    quotationReference: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: true,
      index: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },
    items: [
      {
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
        materialName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        taxPercent: { type: Number, default: 18 },
        taxAmount: { type: Number, default: 0 },
        lineTotal: { type: Number, required: true }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    leadTimeDays: {
      type: Number,
      default: 7
    },
    paymentTerms: {
      type: String,
      default: '30 Days Net'
    },
    warrantyTerms: {
      type: String,
      default: '12 Months'
    },
    qualityRating: {
      type: Number,
      default: 4,
      min: 1,
      max: 5
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VendorQuotation', vendorQuotationSchema);
