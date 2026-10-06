const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    storageProvider: {
      type: String,
      enum: ['local', 's3', 'mock'],
      default: 'local'
    },
    storageKey: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      default: 'GENERAL',
      trim: true
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('Document', documentSchema);
