const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const rdProjectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    objective: {
      type: String,
      required: true
    },
    leadEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetPrototypeDate: {
      type: Date,
      default: null
    },
    materialsRequested: [
      {
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
        materialName: String,
        quantity: Number,
        purpose: String
      }
    ],
    testResults: {
      temperatureAchieved: String,
      energyEfficiencyMetrics: String,
      feasibilityNotes: String
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.RND_PROJECT),
      default: WORKFLOW_STATUS.RND_PROJECT.PROPOSED,
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RDProject', rdProjectSchema);
