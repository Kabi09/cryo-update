const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    alternatePhone: {
      type: String,
      default: ''
    },
    gstNumber: {
      type: String,
      trim: true,
      default: ''
    },
    panNumber: {
      type: String,
      trim: true,
      default: ''
    },
    billingAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    shippingAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    paymentTerms: {
      type: String,
      default: '30% Advance, 70% Before Dispatch'
    },
    creditLimit: {
      type: Number,
      default: 0
    },
    customerType: {
      type: String,
      enum: ['HOSPITAL', 'RESEARCH_INSTITUTE', 'PHARMA', 'DISTRIBUTOR', 'DIRECT', 'OTHER'],
      default: 'HOSPITAL'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
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

customerSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
