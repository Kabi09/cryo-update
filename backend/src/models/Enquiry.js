const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const enquiryItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    targetPrice: {
      type: Number,
      default: 0
    },
    specifications: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const enquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    items: [enquiryItemSchema],
    assignedSalesperson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.ENQUIRY),
      default: WORKFLOW_STATUS.ENQUIRY.ACTIVE,
      index: true
    },
    quotations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
      }
    ],
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        remarks: String
      }
    ],
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

enquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
