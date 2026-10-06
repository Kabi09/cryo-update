const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const followUpSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'VISIT', 'OTHER'],
      default: 'CALL'
    },
    discussion: {
      type: String,
      required: true
    },
    customerResponse: {
      type: String,
      enum: ['INTERESTED', 'NEED_MORE_TIME', 'NO_RESPONSE', 'NOT_INTERESTED', 'OTHER'],
      default: 'INTERESTED'
    },
    nextFollowUpDate: {
      type: Date,
      default: null
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    leadNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    source: {
      type: String,
      enum: ['WEBSITE', 'INDIAMART', 'EXHIBITION', 'DIRECT', 'REFERRAL', 'COLD_CALL', 'OTHER'],
      default: 'WEBSITE'
    },
    leadType: {
      type: String,
      enum: ['NEW_CUSTOMER', 'EXISTING_CUSTOMER'],
      default: 'NEW_CUSTOMER'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
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
    requirement: {
      type: String,
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    expectedValue: {
      type: Number,
      default: 0
    },
    expectedDate: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.LEAD),
      default: WORKFLOW_STATUS.LEAD.NEW,
      index: true
    },
    followUps: [followUpSchema],
    lostReason: {
      type: String,
      default: null
    },
    statusHistory: [statusHistorySchema],
    convertedEnquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      default: null
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ customerName: 'text', contactPerson: 'text', requirement: 'text' });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
