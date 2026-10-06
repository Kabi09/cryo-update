const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const warrantySchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    installation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installation',
      default: null
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true,
      index: true
    },
    durationMonths: {
      type: Number,
      default: 12
    },
    terms: {
      type: String,
      default: '12 Months Comprehensive Warranty from date of commissioning'
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.WARRANTY),
      default: WORKFLOW_STATUS.WARRANTY.ACTIVE,
      index: true
    }
  },
  {
    timestamps: true
  }
);

warrantySchema.methods.isValid = function () {
  return this.status === WORKFLOW_STATUS.WARRANTY.ACTIVE && new Date() <= this.endDate;
};

module.exports = mongoose.model('Warranty', warrantySchema);
