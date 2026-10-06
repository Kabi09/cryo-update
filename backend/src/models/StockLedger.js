const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema(
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
    transactionType: {
      type: String,
      required: true,
      enum: [
        'RECEIPT', // From GRN / Supplier
        'ISSUE', // To Production / Service
        'TRANSFER_IN', // Transfer from another warehouse
        'TRANSFER_OUT', // Transfer to another warehouse
        'CONSUMPTION', // Shopfloor consumption
        'RETURN', // Unused material returned to store
        'ADJUSTMENT_ADD', // Inventory audit adjustment positive
        'ADJUSTMENT_SUB' // Inventory audit adjustment negative
      ],
      index: true
    },
    quantity: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    referenceType: {
      type: String,
      required: true,
      enum: [
        'GRN',
        'MATERIAL_REQUEST',
        'PRODUCTION_ORDER',
        'WAREHOUSE_TRANSFER',
        'STOCK_ADJUSTMENT',
        'SERVICE_TICKET',
        'RND_PROJECT',
        'INITIAL_SEED'
      ]
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },
    referenceNumber: {
      type: String,
      default: '',
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

stockLedgerSchema.index({ material: 1, warehouse: 1, createdAt: -1 });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
