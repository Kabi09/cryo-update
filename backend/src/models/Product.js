const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productCode: {
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
      enum: ['ULTRA_LOW_FREEZER', 'BLOOD_BANK_REFRIGERATOR', 'CRYO_CHAMBER', 'DEEP_FREEZER', 'ACCESSORY', 'OTHER'],
      default: 'ULTRA_LOW_FREEZER'
    },
    modelNumber: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    specifications: {
      temperatureRange: { type: String, default: '-40°C to -86°C' },
      capacityLitres: { type: Number, default: 500 },
      refrigerant: { type: String, default: 'Eco-friendly Mixed Cascade' },
      powerSupply: { type: String, default: '230V / 50Hz' },
      dimensions: { type: String, default: '900 x 850 x 1980 mm' },
      controllerType: { type: String, default: 'Microprocessor Digital' }
    },
    unitOfMeasure: {
      type: String,
      default: 'UNIT'
    },
    standardPrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 18 // 18% GST standard
    },
    warrantyMonths: {
      type: Number,
      default: 12
    },
    requiresSerialNumber: {
      type: Boolean,
      default: true
    },
    activeBOM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BOM',
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

productSchema.index({ name: 'text', modelNumber: 'text' });

module.exports = mongoose.model('Product', productSchema);
