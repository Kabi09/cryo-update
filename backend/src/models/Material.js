const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    materialCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ['REFRIGERATION', 'ELECTRICAL', 'FABRICATION', 'SENSOR', 'INSULATION', 'HARDWARE', 'SPARE_PART', 'OTHER'],
      default: 'HARDWARE'
    },
    partNumber: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    unitOfMeasure: {
      type: String,
      required: true,
      default: 'NOS'
    },
    standardCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 18
    },
    reorderLevel: {
      type: Number,
      default: 5
    },
    minimumStockLevel: {
      type: Number,
      default: 2
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

materialSchema.index({ name: 'text', partNumber: 'text' });

module.exports = mongoose.model('Material', materialSchema);
