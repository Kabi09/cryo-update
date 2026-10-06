const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const sparePartUsageSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    materialName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    isChargeable: {
      type: Boolean,
      default: false
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    fromInventoryIssued: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const serviceTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
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
    serialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber',
      required: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    complaintDescription: {
      type: String,
      required: true
    },
    isUnderWarranty: {
      type: Boolean,
      default: false,
      index: true
    },
    serviceType: {
      type: String,
      enum: ['WARRANTY_FREE', 'CHARGEABLE_SERVICE', 'AMC'],
      default: 'WARRANTY_FREE'
    },
    chargeableAmount: {
      type: Number,
      default: 0
    },
    customerApprovedQuote: {
      type: Boolean,
      default: false
    },
    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    serviceLocation: {
      type: String,
      enum: ['ON_SITE', 'FACTORY_RETURN'],
      default: 'ON_SITE'
    },
    diagnosis: {
      rootCause: { type: String, default: '' },
      findings: { type: String, default: '' },
      diagnosedAt: { type: Date, default: null }
    },
    sparePartsUsed: [sparePartUsageSchema],
    resolutionSummary: {
      type: String,
      default: ''
    },
    testResult: {
      type: String,
      enum: ['PENDING', 'PASS', 'FAIL'],
      default: 'PENDING'
    },
    customerSignOff: {
      signedByName: { type: String, default: '' },
      satisfactionRating: { type: Number, min: 1, max: 5, default: 5 },
      signedAt: { type: Date, default: null }
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.SERVICE_TICKET),
      default: WORKFLOW_STATUS.SERVICE_TICKET.OPEN,
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

serviceTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceTicket', serviceTicketSchema);
