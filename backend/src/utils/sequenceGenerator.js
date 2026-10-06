const Sequence = require('../models/Sequence');

const PREFIX_MAP = {
  LEAD: 'LEAD',
  ENQUIRY: 'ENQ',
  QUOTATION: 'QT',
  PROFORMA_INVOICE: 'PI',
  CUSTOMER_PO: 'CPO',
  SALES_ORDER: 'SO',
  PRODUCTION_ORDER: 'PROD',
  BOM: 'BOM',
  MATERIAL_REQUEST: 'MR',
  PURCHASE_REQUEST: 'PR',
  RFQ: 'RFQ',
  VENDOR_QUOTATION: 'VQ',
  VENDOR_PO: 'VPO',
  GRN: 'GRN',
  MATERIAL_ISSUE: 'MI',
  QA_INSPECTION: 'QA',
  FINAL_INVOICE: 'INV',
  PACKING: 'PACK',
  DISPATCH: 'DISP',
  SHIPMENT: 'SHIP',
  DELIVERY: 'DEL',
  POD: 'POD',
  SERVICE_TICKET: 'SRV',
  RMA: 'RMA',
  CUSTOMER: 'CUST',
  VENDOR: 'VEND',
  PRODUCT: 'PROD-SKU',
  MATERIAL: 'MAT',
  SERIAL: 'CRYO-SN'
};

const getNextSequence = async (key) => {
  const prefix = PREFIX_MAP[key] || key;
  let sequence = await Sequence.findOneAndUpdate(
    { key },
    {
      $setOnInsert: { key, prefix, padLength: 6 },
      $inc: { currentSeq: 1 }
    },
    {
      new: true,
      upsert: true
    }
  );

  // Ensure sequence numbers start past 100 to avoid collisions with seeded demo data (000001-000010)
  if (sequence.currentSeq <= 10) {
    const updated = await Sequence.findOneAndUpdate(
      { key, currentSeq: { $lte: 10 } },
      { $set: { currentSeq: 101 } },
      { new: true }
    );
    if (updated) sequence = updated;
  }

  const paddedNum = String(sequence.currentSeq).padStart(sequence.padLength, '0');
  return `${sequence.prefix}-${paddedNum}`;
};

module.exports = {
  getNextSequence,
  PREFIX_MAP
};
