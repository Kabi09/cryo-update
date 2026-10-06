const mongoose = require('mongoose');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const installationSchema = new mongoose.Schema(
  {
    installationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    serialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber',
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
    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    scheduledDate: {
      type: Date,
      default: Date.now
    },
    installationDate: {
      type: Date,
      default: null
    },
    commissioningChecklist: {
      voltageAndEarthingChecked: { type: Boolean, default: true },
      roomVentilationAdequate: { type: Boolean, default: true },
      setpointTemperatureReached: { type: Boolean, default: true },
      alarmFunctionalityTested: { type: Boolean, default: true },
      userTrainingCompleted: { type: Boolean, default: true }
    },
    customerSignOff: {
      signedByName: { type: String, default: '' },
      designation: { type: String, default: '' },
      signatureUrl: { type: String, default: '' },
      signedAt: { type: Date, default: null }
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS.INSTALLATION),
      default: WORKFLOW_STATUS.INSTALLATION.COMMISSIONED,
      index: true
    },
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

installationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Installation', installationSchema);
