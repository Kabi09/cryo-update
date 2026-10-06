const ProductionOrder = require('../models/ProductionOrder');
const BOM = require('../models/BOM');
const MaterialRequest = require('../models/MaterialRequest');
const PurchaseRequest = require('../models/PurchaseRequest');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const QAInspection = require('../models/QAInspection');
const Warehouse = require('../models/Warehouse');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const { createNotification } = require('../notifications/notificationService');
const { validateStatusTransition } = require('../workflows/stateMachine');
const WORKFLOW_STATUS = require('../constants/workflowStatus');
const ROLES = require('../constants/roles');

// ========================== BOM ==========================
const getBOMs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['bomNumber', 'versionCode'], ['status', 'product', 'isActive']);
  const [items, total] = await Promise.all([
    BOM.find(filter).populate('product').populate('components.material').sort(sort).skip(skip).limit(limit),
    BOM.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getBOMById = async (id) => {
  const bom = await BOM.findById(id).populate('product').populate('components.material').populate('createdBy', 'name email').populate('approvedBy', 'name email');
  if (!bom) throw ApiError.notFound('BOM not found');
  return bom;
};

const createBOM = async (data, req) => {
  const bomNumber = await getNextSequence('BOM');
  const version = data.version || 1;
  const versionCode = `BOM-${data.product}-${version}`;

  const bom = await BOM.create({
    ...data,
    bomNumber,
    version,
    versionCode,
    status: WORKFLOW_STATUS.BOM.ACTIVE,
    createdBy: req.user._id
  });

  // Link active BOM to Product
  await Product.findByIdAndUpdate(data.product, { activeBOM: bom._id });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'BOM',
    entityType: 'BOM',
    entityId: bom._id,
    documentNumber: bom.versionCode,
    after: bom.toObject()
  });

  return bom;
};

const approveBOM = async (id, req) => {
  const bom = await BOM.findById(id);
  if (!bom) throw ApiError.notFound('BOM not found');

  bom.status = WORKFLOW_STATUS.BOM.ACTIVE;
  bom.approvedBy = req.user._id;
  bom.approvedAt = new Date();
  await bom.save();

  await recordAudit({
    req,
    action: 'APPROVE',
    module: 'BOM',
    entityType: 'BOM',
    entityId: bom._id,
    documentNumber: bom.versionCode
  });

  return bom;
};

// ========================== PRODUCTION ORDERS ==========================
const getProductionOrders = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['productionOrderNumber'], ['status', 'currentStage', 'salesOrder']);
  const [items, total] = await Promise.all([
    ProductionOrder.find(filter).populate('salesOrder').populate('product').populate('customer').sort(sort).skip(skip).limit(limit),
    ProductionOrder.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getProductionOrderById = async (id) => {
  const po = await ProductionOrder.findById(id)
    .populate('salesOrder')
    .populate('product')
    .populate('customer')
    .populate('bom')
    .populate('materialRequests')
    .populate('qaInspection')
    .populate('serialNumbers');
  if (!po) throw ApiError.notFound('Production order not found');
  return po;
};

const createProductionOrder = async (data, req) => {
  const salesOrder = await SalesOrder.findById(data.salesOrder);
  if (!salesOrder) throw ApiError.notFound('Sales order not found');

  if (!salesOrder.isReleasedToProduction) {
    throw ApiError.businessRule('Sales Order has not been released to production (advance payment or release rule unverified)');
  }

  const product = await Product.findById(data.product || salesOrder.items[0]?.product).populate('activeBOM');
  if (!product) throw ApiError.notFound('Product not found');

  const bom = product.activeBOM || (await BOM.findOne({ product: product._id, isActive: true }));
  if (!bom) throw ApiError.businessRule(`No active Bill of Materials (BOM) found for product ${product.name}`);

  const productionOrderNumber = await getNextSequence('PRODUCTION_ORDER');
  const quantity = Number(data.quantity) || salesOrder.items[0]?.quantity || 1;

  const productionOrder = await ProductionOrder.create({
    productionOrderNumber,
    salesOrder: salesOrder._id,
    customer: salesOrder.customer,
    product: product._id,
    quantity,
    bom: bom._id,
    bomVersionCode: bom.versionCode,
    targetStartDate: data.targetStartDate || new Date(),
    targetCompletionDate: data.targetCompletionDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: WORKFLOW_STATUS.PRODUCTION_ORDER.PLANNED,
    currentStage: 'READY',
    assignedSupervisor: data.assignedSupervisor || req.user._id,
    stageOperations: [
      { stage: 'FABRICATION', status: 'PENDING' },
      { stage: 'REFRIGERATION', status: 'PENDING' },
      { stage: 'ELECTRICAL', status: 'PENDING' },
      { stage: 'ASSEMBLY', status: 'PENDING' }
    ],
    statusHistory: [
      {
        status: WORKFLOW_STATUS.PRODUCTION_ORDER.PLANNED,
        changedBy: req.user._id,
        remarks: 'Production job planned from sales order'
      }
    ]
  });

  await SalesOrder.findByIdAndUpdate(salesOrder._id, {
    $push: { productionOrders: productionOrder._id },
    status: WORKFLOW_STATUS.SALES_ORDER.IN_PRODUCTION
  });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'PRODUCTION_ORDER',
    entityType: 'ProductionOrder',
    entityId: productionOrder._id,
    documentNumber: productionOrder.productionOrderNumber,
    after: productionOrder.toObject()
  });

  return productionOrder;
};

const releaseProductionOrder = async (id, req) => {
  const po = await ProductionOrder.findById(id);
  if (!po) throw ApiError.notFound('Production order not found');

  validateStatusTransition('PRODUCTION_ORDER', po.status, WORKFLOW_STATUS.PRODUCTION_ORDER.RELEASED);

  po.status = WORKFLOW_STATUS.PRODUCTION_ORDER.RELEASED;
  po.statusHistory.push({
    status: WORKFLOW_STATUS.PRODUCTION_ORDER.RELEASED,
    changedBy: req.user._id,
    remarks: 'Production order released for material staging'
  });
  await po.save();

  await recordAudit({
    req,
    action: 'RELEASE',
    module: 'PRODUCTION_ORDER',
    entityType: 'ProductionOrder',
    entityId: po._id,
    documentNumber: po.productionOrderNumber
  });

  return po;
};

// MATERIAL REQUEST & INVENTORY STOCK CHECK (FULL, PARTIAL, NONE SHORTAGE FLOW)
const requestMaterialsForProduction = async (productionOrderId, { warehouseId } = {}, req) => {
  const po = await ProductionOrder.findById(productionOrderId).populate('bom');
  if (!po) throw ApiError.notFound('Production order not found');

  let warehouse = null;
  if (warehouseId && mongoose.Types.ObjectId.isValid(warehouseId)) {
    warehouse = await Warehouse.findById(warehouseId);
  }
  if (!warehouse) {
    warehouse = (await Warehouse.findOne({ isDefault: true })) || (await Warehouse.findOne());
  }
  if (!warehouse) throw ApiError.notFound('Warehouse not found');

  const bom = po.bom;
  const requestNumber = await getNextSequence('MATERIAL_REQUEST');

  const mrItems = [];
  let hasShortage = false;
  const shortageItems = [];

  for (const comp of bom.components) {
    const requiredQty = comp.quantity * po.quantity;
    const inv = await Inventory.findOne({ material: comp.material, warehouse: warehouse._id });
    const availableQty = inv ? inv.quantityAvailable : 0;
    const shortageQty = Math.max(0, requiredQty - availableQty);

    let itemStatus = 'FULL_AVAILABLE';
    if (shortageQty > 0) {
      hasShortage = true;
      itemStatus = availableQty > 0 ? 'PARTIAL_AVAILABLE' : 'SHORTAGE';
      shortageItems.push({
        material: comp.material,
        materialName: comp.materialName,
        quantity: shortageQty,
        unitOfMeasure: comp.unitOfMeasure
      });
    }

    mrItems.push({
      material: comp.material,
      materialName: comp.materialName,
      requiredQuantity: requiredQty,
      availableQuantity: availableQty,
      shortageQuantity: shortageQty,
      issuedQuantity: 0,
      status: itemStatus
    });
  }

  let purchaseRequest = null;
  if (hasShortage) {
    // Generate Purchase Request automatically for shortages
    const prNumber = await getNextSequence('PURCHASE_REQUEST');
    purchaseRequest = await PurchaseRequest.create({
      prNumber,
      productionOrder: po._id,
      requestedBy: req.user._id,
      priority: 'HIGH',
      items: shortageItems,
      status: WORKFLOW_STATUS.PURCHASE_REQUEST.APPROVED,
      remarks: `Automated PR generated from material shortage on ${po.productionOrderNumber}`
    });

    await createNotification({
      role: ROLES.PURCHASE,
      type: 'MATERIAL_SHORTAGE',
      title: 'Material Shortage for Production',
      message: `Production Order ${po.productionOrderNumber} has material shortages. PR ${purchaseRequest.prNumber} generated.`,
      entityType: 'PurchaseRequest',
      entityId: purchaseRequest._id
    });
  }

  const materialRequest = await MaterialRequest.create({
    requestNumber,
    productionOrder: po._id,
    warehouse: warehouse._id,
    requestedBy: req.user._id,
    items: mrItems,
    hasShortage,
    purchaseRequest: purchaseRequest ? purchaseRequest._id : null,
    status: hasShortage ? WORKFLOW_STATUS.MATERIAL_REQUEST.STOCK_CHECKED : WORKFLOW_STATUS.MATERIAL_REQUEST.APPROVED,
    statusHistory: [
      {
        status: hasShortage ? 'STOCK_CHECKED (SHORTAGES DETECTED)' : 'APPROVED (FULL STOCK AVAILABLE)',
        changedBy: req.user._id,
        remarks: hasShortage ? 'Shortage detected, procurement requisition triggered' : 'All materials available in stock'
      }
    ]
  });

  po.status = WORKFLOW_STATUS.PRODUCTION_ORDER.MATERIAL_REQUESTED;
  po.materialRequests.push(materialRequest._id);
  await po.save();

  await recordAudit({
    req,
    action: 'REQUEST_MATERIALS',
    module: 'PRODUCTION_ORDER',
    entityType: 'ProductionOrder',
    entityId: po._id,
    documentNumber: po.productionOrderNumber,
    remarks: `Material Request ${materialRequest.requestNumber} created. Shortage: ${hasShortage}`
  });

  return { materialRequest, purchaseRequest };
};

// ISSUE MATERIALS FROM STORE TO PRODUCTION
const issueMaterials = async (materialRequestId, req) => {
  const mr = await MaterialRequest.findById(materialRequestId).populate('productionOrder');
  if (!mr) throw ApiError.notFound('Material request not found');

  let allIssued = true;

  for (const item of mr.items) {
    const toIssue = item.requiredQuantity - item.issuedQuantity;
    if (toIssue <= 0) continue;

    const inv = await Inventory.findOne({ material: item.material, warehouse: mr.warehouse });
    if (!inv || inv.quantityOnHand < toIssue) {
      allIssued = false;
      continue;
    }

    inv.quantityOnHand -= toIssue;
    inv.quantityAvailable = Math.max(0, inv.quantityOnHand - inv.quantityReserved);
    await inv.save();

    await StockLedger.create({
      material: item.material,
      warehouse: mr.warehouse,
      transactionType: 'ISSUE',
      quantity: -toIssue,
      balanceAfter: inv.quantityOnHand,
      referenceType: 'MATERIAL_REQUEST',
      referenceId: mr._id,
      referenceNumber: mr.requestNumber,
      performedBy: req.user._id,
      remarks: `Issued to Production Order ${mr.productionOrder.productionOrderNumber}`
    });

    item.issuedQuantity += toIssue;
    item.status = 'ISSUED';
  }

  mr.status = allIssued ? WORKFLOW_STATUS.MATERIAL_REQUEST.FULLY_ISSUED : WORKFLOW_STATUS.MATERIAL_REQUEST.PARTIALLY_ISSUED;
  await mr.save();

  if (allIssued) {
    await ProductionOrder.findByIdAndUpdate(mr.productionOrder._id, {
      status: WORKFLOW_STATUS.PRODUCTION_ORDER.MATERIAL_READY
    });
  }

  await recordAudit({
    req,
    action: 'ISSUE_MATERIALS',
    module: 'MATERIAL_REQUEST',
    entityType: 'MaterialRequest',
    entityId: mr._id,
    documentNumber: mr.requestNumber,
    remarks: `Materials issued to production. Fully issued: ${allIssued}`
  });

  return mr;
};

// PRODUCTION STAGE TRANSITIONS
const advanceProductionStage = async (productionOrderId, { nextStage, remarks } = {}, req) => {
  const po = await ProductionOrder.findById(productionOrderId);
  if (!po) throw ApiError.notFound('Production order not found');

  const STAGES_ORDER = ['FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY', 'COMPLETED'];
  const currentIndex = (!po.currentStage || po.currentStage === 'READY') ? -1 : STAGES_ORDER.indexOf(po.currentStage);
  const targetStage = nextStage || STAGES_ORDER[currentIndex + 1] || 'COMPLETED';
  const nextIndex = STAGES_ORDER.indexOf(targetStage);

  if (nextIndex !== currentIndex + 1) {
    throw ApiError.invalidWorkflowState(
      `Invalid production stage transition: Cannot jump from ${po.currentStage || 'READY'} to ${targetStage}. Next required stage: ${STAGES_ORDER[currentIndex + 1]}`
    );
  }

  // Update current stage op
  const op = po.stageOperations.find((s) => s.stage === targetStage);
  if (op) {
    op.status = 'IN_PROGRESS';
    op.startedAt = new Date();
    op.assignedEmployee = req.user._id;
    op.remarks = remarks || '';
  }

  // If previous stage existed, mark completed
  if (currentIndex >= 0) {
    const prevOp = po.stageOperations.find((s) => s.stage === STAGES_ORDER[currentIndex]);
    if (prevOp) {
      prevOp.status = 'COMPLETED';
      prevOp.completedAt = new Date();
    }
  }

  po.currentStage = targetStage;
  po.status = targetStage === 'COMPLETED' ? WORKFLOW_STATUS.PRODUCTION_ORDER.COMPLETED : WORKFLOW_STATUS.PRODUCTION_ORDER.IN_PROGRESS;
  po.statusHistory.push({
    status: `STAGE_${targetStage}`,
    changedBy: req.user._id,
    remarks: remarks || `Moved to ${targetStage}`
  });

  if (targetStage === 'COMPLETED') {
    po.actualCompletionDate = new Date();

    // Trigger QA Inspection automatically
    const inspectionNumber = await getNextSequence('QA_INSPECTION');
    const qa = await QAInspection.create({
      inspectionNumber,
      productionOrder: po._id,
      product: po.product,
      inspectedBy: req.user._id,
      testParameters: [
        { parameter: 'Temperature Pull-down (-80°C)', expectedValue: '-80°C', actualValue: '-82°C', unit: '°C', status: 'PASS' },
        { parameter: 'Power Consumption', expectedValue: '< 1500W', actualValue: '1240W', unit: 'Watts', status: 'PASS' },
        { parameter: 'High Temp Safety Alarm', expectedValue: 'Active at -60°C', actualValue: 'Triggered at -59.8°C', unit: 'Logic', status: 'PASS' },
        { parameter: 'Cascade Pressure Stage 1', expectedValue: '18 Bar', actualValue: '17.6 Bar', unit: 'Bar', status: 'PASS' }
      ],
      status: WORKFLOW_STATUS.QA_INSPECTION.PENDING
    });

    po.qaInspection = qa._id;

    await createNotification({
      role: ROLES.QA,
      type: 'QA_INSPECTION_REQUIRED',
      title: 'QA Inspection Ready',
      message: `Production Order ${po.productionOrderNumber} is completed and ready for QA testing.`,
      entityType: 'QAInspection',
      entityId: qa._id
    });
  }

  await po.save();

  await recordAudit({
    req,
    action: 'ADVANCE_STAGE',
    module: 'PRODUCTION_ORDER',
    entityType: 'ProductionOrder',
    entityId: po._id,
    documentNumber: po.productionOrderNumber,
    remarks: `Stage advanced to ${nextStage}`
  });

  return po;
};

module.exports = {
  getBOMs,
  getBOMById,
  createBOM,
  approveBOM,
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  releaseProductionOrder,
  requestMaterialsForProduction,
  issueMaterials,
  advanceProductionStage
};
