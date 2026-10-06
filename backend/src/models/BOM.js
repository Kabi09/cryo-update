const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const bomComponentSchema = new mongoose.Schema(
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
      min: 0.001
    },
    unitOfMeasure: {
      type: String,
      required: true
    },
    scrapPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const bomSchema = new mongoose.Schema(
  {
    bomNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    versionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    components: [bomComponentSchema],
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.BOM),
      default: WORKFLOW_STATUS.BOM.ACTIVE,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
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

bomSchema.index({ product: 1, version: 1 });

module.exports = mongoose.model('BOM', bomSchema);
