const mongoose = require('mongoose');

const transporterSchema = new mongoose.Schema(
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
    contactPerson: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    },
    trackingUrlTemplate: {
      type: String,
      default: '' // e.g., https://tracking.transport.com?lr={trackingNumber}
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

module.exports = mongoose.model('Transporter', transporterSchema);
