const mongoose = require('mongoose');

const workCenterSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      enum: ['FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY', 'QA_TESTING', 'PACKING', 'OTHER'],
      default: 'FABRICATION'
    },
    capacityPerDay: {
      type: Number,
      default: 5
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WorkCenter', workCenterSchema);
