const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const Material = require('../models/Material');
const Warehouse = require('../models/Warehouse');
const ApiError = require('../utils/apiError');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');

const getInventory = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, [], ['warehouse', 'material']);
  const [items, total] = await Promise.all([
    Inventory.find(filter).populate('material').populate('warehouse').sort(sort).skip(skip).limit(limit),
    Inventory.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getInventoryByMaterialAndWarehouse = async (materialId, warehouseId) => {
  const inv = await Inventory.findOne({ material: materialId, warehouse: warehouseId }).populate('material').populate('warehouse');
  if (!inv) {
    return { quantityOnHand: 0, quantityReserved: 0, quantityAvailable: 0 };
  }
  return inv;
};

const getStockLedger = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['referenceNumber'], ['warehouse', 'material', 'transactionType', 'referenceType']);
  const [items, total] = await Promise.all([
    StockLedger.find(filter).populate('material').populate('warehouse').populate('performedBy', 'name email').sort(sort).skip(skip).limit(limit),
    StockLedger.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

// WAREHOUSE TRANSFER
const transferStock = async ({ fromWarehouseId, toWarehouseId, materialId, quantity, remarks }, req) => {
  const qty = Number(quantity);
  if (qty <= 0) throw ApiError.badRequest('Transfer quantity must be greater than zero');
  if (fromWarehouseId === toWarehouseId) throw ApiError.badRequest('Source and destination warehouse must be different');

  const sourceInv = await Inventory.findOne({ material: materialId, warehouse: fromWarehouseId });
  if (!sourceInv || sourceInv.quantityAvailable < qty) {
    throw ApiError.businessRule('Insufficient available stock in source warehouse');
  }

  // Deduct from source
  sourceInv.quantityOnHand -= qty;
  sourceInv.quantityAvailable = Math.max(0, sourceInv.quantityOnHand - sourceInv.quantityReserved);
  await sourceInv.save();

  await StockLedger.create({
    material: materialId,
    warehouse: fromWarehouseId,
    transactionType: 'TRANSFER_OUT',
    quantity: -qty,
    balanceAfter: sourceInv.quantityOnHand,
    referenceType: 'WAREHOUSE_TRANSFER',
    referenceNumber: `WH-TRF-${Date.now()}`,
    performedBy: req.user._id,
    remarks: `Transferred to warehouse ${toWarehouseId}: ${remarks || ''}`
  });

  // Add to destination
  let destInv = await Inventory.findOne({ material: materialId, warehouse: toWarehouseId });
  if (!destInv) {
    destInv = await Inventory.create({
      material: materialId,
      warehouse: toWarehouseId,
      quantityOnHand: qty,
      quantityReserved: 0,
      quantityAvailable: qty
    });
  } else {
    destInv.quantityOnHand += qty;
    destInv.quantityAvailable = Math.max(0, destInv.quantityOnHand - destInv.quantityReserved);
    await destInv.save();
  }

  await StockLedger.create({
    material: materialId,
    warehouse: toWarehouseId,
    transactionType: 'TRANSFER_IN',
    quantity: qty,
    balanceAfter: destInv.quantityOnHand,
    referenceType: 'WAREHOUSE_TRANSFER',
    referenceNumber: `WH-TRF-${Date.now()}`,
    performedBy: req.user._id,
    remarks: `Received from warehouse ${fromWarehouseId}: ${remarks || ''}`
  });

  await recordAudit({
    req,
    action: 'TRANSFER_STOCK',
    module: 'INVENTORY',
    entityType: 'Inventory',
    entityId: sourceInv._id,
    remarks: `Transferred ${qty} of material ${materialId} from ${fromWarehouseId} to ${toWarehouseId}`
  });

  return { sourceInv, destInv };
};

// STOCK ADJUSTMENT (AUDIT CONTROLLED)
const adjustStock = async ({ warehouseId, materialId, actualPhysicalQuantity, reason }, req) => {
  const physicalQty = Number(actualPhysicalQuantity);
  if (physicalQty < 0) throw ApiError.badRequest('Physical quantity cannot be negative');

  let inv = await Inventory.findOne({ material: materialId, warehouse: warehouseId });
  if (!inv) {
    inv = await Inventory.create({
      material: materialId,
      warehouse: warehouseId,
      quantityOnHand: 0,
      quantityReserved: 0,
      quantityAvailable: 0
    });
  }

  const systemQty = inv.quantityOnHand;
  const variance = physicalQty - systemQty;
  if (variance === 0) {
    return { message: 'No variance detected, inventory is matching physical count', inventory: inv };
  }

  inv.quantityOnHand = physicalQty;
  inv.quantityAvailable = Math.max(0, inv.quantityOnHand - inv.quantityReserved);
  await inv.save();

  await StockLedger.create({
    material: materialId,
    warehouse: warehouseId,
    transactionType: variance > 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_SUB',
    quantity: variance,
    balanceAfter: physicalQty,
    referenceType: 'STOCK_ADJUSTMENT',
    referenceNumber: `ADJ-${Date.now()}`,
    performedBy: req.user._id,
    remarks: `Inventory audit adjustment: System=${systemQty}, Physical=${physicalQty}. Reason: ${reason}`
  });

  await recordAudit({
    req,
    action: 'ADJUST_STOCK',
    module: 'INVENTORY',
    entityType: 'Inventory',
    entityId: inv._id,
    before: { quantityOnHand: systemQty },
    after: { quantityOnHand: physicalQty },
    remarks: `Variance of ${variance} adjusted. Reason: ${reason}`
  });

  return { inventory: inv, variance, reason };
};

// LOW STOCK MONITOR
const getLowStockItems = async () => {
  const materials = await Material.find({ isActive: true });
  const lowStockList = [];

  for (const mat of materials) {
    const inventories = await Inventory.find({ material: mat._id });
    const totalOnHand = inventories.reduce((sum, i) => sum + i.quantityOnHand, 0);

    if (totalOnHand <= mat.reorderLevel) {
      lowStockList.push({
        material: mat,
        totalOnHand,
        reorderLevel: mat.reorderLevel,
        minimumStockLevel: mat.minimumStockLevel,
        shortageToReorder: Math.max(0, mat.reorderLevel - totalOnHand)
      });
    }
  }

  return lowStockList;
};

module.exports = {
  getInventory,
  getInventoryByMaterialAndWarehouse,
  getStockLedger,
  transferStock,
  adjustStock,
  getLowStockItems
};
