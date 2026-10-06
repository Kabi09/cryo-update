const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
      index: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true
    },
    quantityOnHand: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    quantityReserved: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    quantityAvailable: {
      type: Number,
      required: true,
      default: 0
    },
    unitOfMeasure: {
      type: String,
      required: true,
      default: 'NOS'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.index({ material: 1, warehouse: 1 }, { unique: true });

inventorySchema.pre('save', function (next) {
  this.quantityAvailable = Math.max(0, this.quantityOnHand - this.quantityReserved);
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
