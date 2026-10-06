const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    prefix: {
      type: String,
      required: true,
      trim: true
    },
    currentSeq: {
      type: Number,
      default: 0
    },
    padLength: {
      type: Number,
      default: 6
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Sequence', sequenceSchema);
