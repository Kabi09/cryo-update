const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../config/logger');

// Models
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Material = require('../models/Material');
const Vendor = require('../models/Vendor');
const Warehouse = require('../models/Warehouse');
const WorkCenter = require('../models/WorkCenter');
const Transporter = require('../models/Transporter');
const Configuration = require('../models/Configuration');
const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const BOM = require('../models/BOM');
const Lead = require('../models/Lead');
const Enquiry = require('../models/Enquiry');
const Quotation = require('../models/Quotation');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPO = require('../models/CustomerPO');
const SalesOrder = require('../models/SalesOrder');
const Payment = require('../models/Payment');
const ProductionOrder = require('../models/ProductionOrder');
const MaterialRequest = require('../models/MaterialRequest');
const QAInspection = require('../models/QAInspection');
const SerialNumber = require('../models/SerialNumber');
const FinishedGoods = require('../models/FinishedGoods');
const Packing = require('../models/Packing');
const FinalInvoice = require('../models/FinalInvoice');
const Dispatch = require('../models/Dispatch');
const Delivery = require('../models/Delivery');
const Installation = require('../models/Installation');
const Warranty = require('../models/Warranty');
const ServiceTicket = require('../models/ServiceTicket');

const { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');
const ROLES = require('../constants/roles');
const WORKFLOW_STATUS = require('../constants/workflowStatus');

const Sequence = require('../models/Sequence');
const { PREFIX_MAP } = require('../utils/sequenceGenerator');

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await mongoose.connect(config.mongoUri);
    logger.info('Connected. Clearing existing collections...');

    // Drop collections cleanly
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    logger.info('0. Seeding Sequence Initial Counters (currentSeq: 100)...');
    const sequenceDocs = Object.keys(PREFIX_MAP).map((k) => ({
      key: k,
      prefix: PREFIX_MAP[k],
      padLength: 6,
      currentSeq: 100
    }));
    await Sequence.insertMany(sequenceDocs);

    logger.info('1. Seeding Permissions and Roles...');
    const permissionDocs = Object.values(PERMISSIONS).map((code) => ({
      code,
      module: code.split('.')[0].toUpperCase(),
      description: `Permission to ${code}`
    }));
    await Permission.insertMany(permissionDocs);

    const roleDocs = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([name, perms]) => ({
      name,
      displayName: name.replace(/_/g, ' '),
      description: `Default system role for ${name}`,
      permissions: perms,
      isActive: true
    }));
    await Role.insertMany(roleDocs);

    logger.info('2. Seeding Users for all functional roles...');
    const password = 'Password@123'; // Default secure dev password

    const usersToCreate = [
      { name: 'Admin User', email: 'admin@cryo.com', role: ROLES.ADMIN, employeeId: 'EMP-ADM-001' },
      { name: 'Sales Executive', email: 'sales@cryo.com', role: ROLES.SALES, employeeId: 'EMP-SAL-001' },
      { name: 'Sales Manager', email: 'salesmanager@cryo.com', role: ROLES.SALES_MANAGER, employeeId: 'EMP-MGR-001' },
      { name: 'Accounts Officer', email: 'accounts@cryo.com', role: ROLES.ACCOUNTS, employeeId: 'EMP-ACC-001' },
      { name: 'Purchase Officer', email: 'purchase@cryo.com', role: ROLES.PURCHASE, employeeId: 'EMP-PUR-001' },
      { name: 'Store Keeper', email: 'store@cryo.com', role: ROLES.STORE, employeeId: 'EMP-STR-001' },
      { name: 'Production Supervisor', email: 'production@cryo.com', role: ROLES.PRODUCTION, employeeId: 'EMP-PRD-001' },
      { name: 'QA Engineer', email: 'qa@cryo.com', role: ROLES.QA, employeeId: 'EMP-QA-001' },
      { name: 'Dispatch Executive', email: 'dispatch@cryo.com', role: ROLES.DISPATCH, employeeId: 'EMP-DSP-001' },
      { name: 'Service Manager', email: 'servicemanager@cryo.com', role: ROLES.SERVICE_MANAGER, employeeId: 'EMP-SVM-001' },
      { name: 'Field Service Engineer', email: 'serviceengineer@cryo.com', role: ROLES.SERVICE_ENGINEER, employeeId: 'EMP-SVE-001' },
      { name: 'Managing Director', email: 'management@cryo.com', role: ROLES.MANAGEMENT, employeeId: 'EMP-MGT-001' },
      { name: 'R&D Lead Scientist', email: 'rnd@cryo.com', role: ROLES.R_AND_D, employeeId: 'EMP-RND-001' }
    ];

    const users = {};
    for (const u of usersToCreate) {
      users[u.role] = await User.create({ ...u, password });
    }

    logger.info('3. Seeding Configurable Business Rules...');
    await Configuration.create([
      {
        key: 'ADVANCE_PAYMENT_RELEASE_PCT',
        category: 'FINANCE',
        value: 30,
        description: 'Percentage of advance payment required before production can be released',
        isClientConfirmed: false
      },
      {
        key: 'DEFAULT_WARRANTY_MONTHS',
        category: 'SALES',
        value: 12,
        description: 'Standard product warranty duration in months from date of commissioning',
        isClientConfirmed: true
      },
      {
        key: 'AUTO_PO_VERIFY_PRICE_TOLERANCE_PCT',
        category: 'SALES',
        value: 0,
        description: 'Price deviation allowed between Quotation and Customer PO (0% strict)',
        isClientConfirmed: true
      }
    ]);

    logger.info('4. Seeding Master Data (Warehouses, Work Centers, Transporters)...');
    const warehouseMain = await Warehouse.create({
      code: 'WH-CHN-01',
      name: 'Chennai Factory Main Warehouse',
      location: 'Chennai Factory, Tamil Nadu',
      isDefault: true,
      manager: users[ROLES.STORE]._id
    });

    const warehouseNagapattinam = await Warehouse.create({
      code: 'WH-NGP-01',
      name: 'Nagapattinam Distribution Center',
      location: 'Nagapattinam, Tamil Nadu',
      isDefault: false,
      manager: users[ROLES.STORE]._id
    });

    const workCenters = await WorkCenter.insertMany([
      { code: 'WC-FAB', name: 'Fabrication Line', department: 'FABRICATION', supervisor: users[ROLES.PRODUCTION]._id },
      { code: 'WC-REF', name: 'Refrigeration System Unit', department: 'REFRIGERATION', supervisor: users[ROLES.PRODUCTION]._id },
      { code: 'WC-ELE', name: 'Electrical & Controller Wiring', department: 'ELECTRICAL', supervisor: users[ROLES.PRODUCTION]._id },
      { code: 'WC-ASM', name: 'Final Mechanical Assembly', department: 'ASSEMBLY', supervisor: users[ROLES.PRODUCTION]._id },
      { code: 'WC-QAT', name: 'Low Temp Pull-down QA Testing Bay', department: 'QA_TESTING', supervisor: users[ROLES.QA]._id }
    ]);

    const transporter = await Transporter.create({
      code: 'TR-ABC-LOG',
      name: 'ABC National Logistics Pvt Ltd',
      phone: '+91 9840011223',
      contactPerson: 'K. Rajasekaran',
      trackingUrlTemplate: 'https://tracking.abclogistics.com/shipment?lr={trackingNumber}'
    });

    logger.info('5. Seeding Master Data (Customers, Vendors, Materials, Products)...');
    const customer = await Customer.create({
      customerId: 'CUST-000001',
      companyName: 'ABC Memorial Multi-Specialty Hospital',
      contactPerson: 'Dr. R. Kumar',
      email: 'kumar@abchospital.com',
      phone: '9876543210',
      gstNumber: '33AAAAA0000A1Z5',
      billingAddress: { street: '12 Medical Center Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      shippingAddress: { street: '12 Medical Center Road, Central Lab', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' }
    });

    const vendorComp = await Vendor.create({
      vendorId: 'VEND-000001',
      name: 'Danfoss Cryogenic Compressors India',
      contactPerson: 'M. Anand',
      email: 'anand@danfoss.in',
      phone: '9841022334',
      gstNumber: '33DANFO1234F1Z8',
      rating: 5,
      suppliedCategories: ['REFRIGERATION']
    });

    const vendorSensor = await Vendor.create({
      vendorId: 'VEND-000002',
      name: 'Honeywell Precision Controls India',
      contactPerson: 'P. Suresh',
      email: 'suresh@honeywell.in',
      phone: '9841033445',
      gstNumber: '33HONEY5678G1Z9',
      rating: 5,
      suppliedCategories: ['SENSOR', 'ELECTRICAL']
    });

    // Materials
    const matCompressor = await Material.create({
      materialCode: 'MAT-000001',
      name: 'Cascade Cryogenic Compressor 1.5HP (-86°C Grade)',
      category: 'REFRIGERATION',
      partNumber: 'CMP-DAN-86C',
      unitOfMeasure: 'NOS',
      standardCost: 45000,
      reorderLevel: 5
    });

    const matSensor = await Material.create({
      materialCode: 'MAT-000002',
      name: 'Ultra-Low PT100 RTD 4-Wire Temp Sensor',
      category: 'SENSOR',
      partNumber: 'SNS-PT100-RTD',
      unitOfMeasure: 'NOS',
      standardCost: 3500,
      reorderLevel: 10
    });

    const matController = await Material.create({
      materialCode: 'MAT-000003',
      name: 'Dual Stage Digital Microcontroller Board with Display',
      category: 'ELECTRICAL',
      partNumber: 'CTL-MICRO-V2',
      unitOfMeasure: 'NOS',
      standardCost: 12000,
      reorderLevel: 5
    });

    const matCopper = await Material.create({
      materialCode: 'MAT-000004',
      name: 'Refrigeration Grade Deoxidized Copper Tubing 3/8"',
      category: 'REFRIGERATION',
      partNumber: 'COP-TUBE-38',
      unitOfMeasure: 'MTR',
      standardCost: 850,
      reorderLevel: 25
    });

    const matInsulation = await Material.create({
      materialCode: 'MAT-000005',
      name: 'High-Density Polyurethane Foam (PUF) Chemical Formulation',
      category: 'INSULATION',
      partNumber: 'PUF-DENS-120',
      unitOfMeasure: 'KG',
      standardCost: 420,
      reorderLevel: 50
    });

    // Stock initial inventory
    const initialInventories = [
      { material: matCompressor._id, warehouse: warehouseMain._id, quantityOnHand: 8, quantityReserved: 0, quantityAvailable: 8 },
      { material: matSensor._id, warehouse: warehouseMain._id, quantityOnHand: 20, quantityReserved: 0, quantityAvailable: 20 },
      { material: matController._id, warehouse: warehouseMain._id, quantityOnHand: 6, quantityReserved: 0, quantityAvailable: 6 },
      { material: matCopper._id, warehouse: warehouseMain._id, quantityOnHand: 150, quantityReserved: 0, quantityAvailable: 150 },
      { material: matInsulation._id, warehouse: warehouseMain._id, quantityOnHand: 300, quantityReserved: 0, quantityAvailable: 300 }
    ];
    for (const invData of initialInventories) {
      const inv = await Inventory.create(invData);
      await StockLedger.create({
        material: inv.material,
        warehouse: inv.warehouse,
        transactionType: 'RECEIPT',
        quantity: inv.quantityOnHand,
        balanceAfter: inv.quantityOnHand,
        referenceType: 'INITIAL_SEED',
        referenceNumber: 'INITIAL-STOCK-2026',
        performedBy: users[ROLES.ADMIN]._id,
        remarks: 'Initial factory warehouse opening balance'
      });
    }

    // Finished Product
    const productFreezer = await Product.create({
      productCode: 'PROD-SKU-000001',
      name: '-80°C Ultra-Low Temperature Freezer 500L',
      category: 'ULTRA_LOW_FREEZER',
      modelNumber: 'CRYO-ULT-500L',
      description: 'Medical and research grade ultra-low temperature upright freezer with dual cascade refrigeration',
      standardPrice: 1000000, // ₹10,00,000
      taxRate: 18,
      warrantyMonths: 12,
      requiresSerialNumber: true
    });

    // BOM for the Product
    const bomFreezer = await BOM.create({
      bomNumber: 'BOM-000001',
      product: productFreezer._id,
      version: 1,
      versionCode: 'BOM-CRYO-500L-V1',
      status: WORKFLOW_STATUS.BOM.ACTIVE,
      isActive: true,
      createdBy: users[ROLES.PRODUCTION]._id,
      components: [
        { material: matCompressor._id, materialName: matCompressor.name, quantity: 1, unitOfMeasure: 'NOS' },
        { material: matSensor._id, materialName: matSensor.name, quantity: 2, unitOfMeasure: 'NOS' },
        { material: matController._id, materialName: matController.name, quantity: 1, unitOfMeasure: 'NOS' },
        { material: matCopper._id, materialName: matCopper.name, quantity: 15, unitOfMeasure: 'MTR' },
        { material: matInsulation._id, materialName: matInsulation.name, quantity: 30, unitOfMeasure: 'KG' }
      ]
    });
    productFreezer.activeBOM = bomFreezer._id;
    await productFreezer.save();

    logger.info('6. Seeding Demo End-to-End Business Workflow (ABC Hospital Freezer Order)...');

    // Step A: Lead
    const lead = await Lead.create({
      leadNumber: 'LEAD-000001',
      source: 'INDIAMART',
      leadType: 'NEW_CUSTOMER',
      customer: customer._id,
      customerName: customer.companyName,
      contactPerson: customer.contactPerson,
      phone: customer.phone,
      email: customer.email,
      requirement: 'Two units of -80°C Ultra-Low Temperature Freezers for Bio-bank Repository',
      product: productFreezer._id,
      quantity: 2,
      expectedValue: 2000000,
      priority: 'HIGH',
      assignedTo: users[ROLES.SALES]._id,
      status: WORKFLOW_STATUS.LEAD.CONVERTED,
      followUps: [
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          type: 'CALL',
          discussion: 'Customer requested quotation for 2 freezers with IQ/OQ/PQ validation protocol',
          customerResponse: 'INTERESTED',
          conductedBy: users[ROLES.SALES]._id
        }
      ]
    });

    // Step B: Enquiry
    const enquiry = await Enquiry.create({
      enquiryNumber: 'ENQ-000001',
      lead: lead._id,
      customer: customer._id,
      items: [{ product: productFreezer._id, quantity: 2, targetPrice: 2000000, specifications: 'Dual cascade, -80°C hold' }],
      assignedSalesperson: users[ROLES.SALES]._id,
      status: WORKFLOW_STATUS.ENQUIRY.QUOTED
    });
    lead.convertedEnquiry = enquiry._id;
    await lead.save();

    // Step C: Quotation (Rev 0 created and revised to Rev 1 after negotiation)
    const quoteRev0 = await Quotation.create({
      quotationNumber: 'QT-000001',
      revisionNumber: 0,
      revisionCode: 'QT-000001-R0',
      isLatestRevision: false,
      lead: lead._id,
      enquiry: enquiry._id,
      customer: customer._id,
      items: [
        {
          product: productFreezer._id,
          productName: productFreezer.name,
          quantity: 2,
          unitPrice: 1000000,
          discountPercent: 0,
          discountAmount: 0,
          taxPercent: 18,
          taxAmount: 360000,
          lineTotal: 2360000
        }
      ],
      subtotal: 2000000,
      totalDiscount: 0,
      totalTax: 360000,
      grandTotal: 2360000,
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: WORKFLOW_STATUS.QUOTATION.REVISED,
      createdBy: users[ROLES.SALES]._id
    });

    const quoteRev1 = await Quotation.create({
      quotationNumber: 'QT-000001',
      revisionNumber: 1,
      revisionCode: 'QT-000001-R1',
      isLatestRevision: true,
      parentQuotation: quoteRev0._id,
      lead: lead._id,
      enquiry: enquiry._id,
      customer: customer._id,
      items: [
        {
          product: productFreezer._id,
          productName: productFreezer.name,
          quantity: 2,
          unitPrice: 950000, // Negotiated discount
          discountPercent: 5,
          discountAmount: 100000,
          taxPercent: 18,
          taxAmount: 342000,
          lineTotal: 2242000
        }
      ],
      subtotal: 1900000,
      totalDiscount: 100000,
      totalTax: 342000,
      grandTotal: 2242000,
      validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: WORKFLOW_STATUS.QUOTATION.ACCEPTED,
      createdBy: users[ROLES.SALES]._id,
      approvedBy: users[ROLES.SALES_MANAGER]._id,
      approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      acceptedByCustomerPerson: 'Dr. R. Kumar, Director'
    });

    // Step D: Proforma Invoice
    const proforma = await ProformaInvoice.create({
      piNumber: 'PI-000001',
      quotation: quoteRev1._id,
      revisionCode: quoteRev1.revisionCode,
      customer: customer._id,
      items: quoteRev1.items,
      subtotal: quoteRev1.subtotal,
      totalTax: quoteRev1.totalTax,
      grandTotal: quoteRev1.grandTotal,
      advancePercent: 30,
      advanceAmount: 672600, // 30% of 22,42,000
      status: WORKFLOW_STATUS.PROFORMA_INVOICE.APPROVED,
      createdBy: users[ROLES.SALES]._id
    });

    // Step E: Customer PO (Verified)
    const customerPO = await CustomerPO.create({
      poNumber: 'CPO-000001',
      customerPoReference: 'ABC/PO/2026/CRYO-091',
      customerPoDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      customer: customer._id,
      quotation: quoteRev1._id,
      proformaInvoice: proforma._id,
      items: quoteRev1.items,
      totalAmount: quoteRev1.grandTotal,
      status: WORKFLOW_STATUS.CUSTOMER_PO.VERIFIED,
      verificationDetails: {
        verifiedBy: users[ROLES.SALES_MANAGER]._id,
        verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        matched: true,
        discrepancies: []
      },
      receivedBy: users[ROLES.SALES]._id
    });

    // Step F: Internal Sales Order
    const salesOrder = await SalesOrder.create({
      salesOrderNumber: 'SO-000001',
      customerPo: customerPO._id,
      customer: customer._id,
      quotation: quoteRev1._id,
      items: quoteRev1.items,
      subtotal: quoteRev1.subtotal,
      totalTax: quoteRev1.totalTax,
      grandTotal: quoteRev1.grandTotal,
      advanceRequiredAmount: 672600,
      totalPaidAmount: 672600,
      advancePaid: true,
      isReleasedToProduction: true,
      releasedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      releasedBy: users[ROLES.ACCOUNTS]._id,
      status: WORKFLOW_STATUS.SALES_ORDER.RELEASED_TO_PRODUCTION
    });
    customerPO.salesOrder = salesOrder._id;
    await customerPO.save();

    // Step G: Advance Payment (Verified)
    const payment = await Payment.create({
      paymentReference: 'PAY-000001',
      customer: customer._id,
      salesOrder: salesOrder._id,
      proformaInvoice: proforma._id,
      amount: 672600,
      paymentType: 'ADVANCE',
      paymentMethod: 'NEFT',
      transactionReference: 'NEFT-HDFC-998877665544',
      status: WORKFLOW_STATUS.PAYMENT.VERIFIED,
      verifiedBy: users[ROLES.ACCOUNTS]._id,
      verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    // Step H: Production Order
    const productionOrder = await ProductionOrder.create({
      productionOrderNumber: 'PROD-000001',
      salesOrder: salesOrder._id,
      customer: customer._id,
      product: productFreezer._id,
      quantity: 1, // First unit manufactured
      bom: bomFreezer._id,
      bomVersionCode: bomFreezer.versionCode,
      currentStage: 'COMPLETED',
      status: WORKFLOW_STATUS.PRODUCTION_ORDER.COMPLETED,
      assignedSupervisor: users[ROLES.PRODUCTION]._id,
      actualStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      actualCompletionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      stageOperations: [
        { stage: 'FABRICATION', status: 'COMPLETED', completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { stage: 'REFRIGERATION', status: 'COMPLETED', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { stage: 'ELECTRICAL', status: 'COMPLETED', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { stage: 'ASSEMBLY', status: 'COMPLETED', completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ]
    });
    salesOrder.productionOrders.push(productionOrder._id);
    await salesOrder.save();

    // Step I: QA Inspection & Serial Number
    const serialNumber = await SerialNumber.create({
      serialNumber: 'CRYO-SN-000001',
      product: productFreezer._id,
      productionOrder: productionOrder._id,
      salesOrder: salesOrder._id,
      customer: customer._id,
      currentStatus: 'DELIVERED'
    });
    productionOrder.serialNumbers.push(serialNumber._id);
    await productionOrder.save();

    const qa = await QAInspection.create({
      inspectionNumber: 'QA-000001',
      productionOrder: productionOrder._id,
      product: productFreezer._id,
      serialNumber: serialNumber._id,
      inspectedBy: users[ROLES.QA]._id,
      result: 'PASSED',
      certificateNumber: 'CAL-CERT-2026-0001',
      certificateGeneratedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: WORKFLOW_STATUS.QA_INSPECTION.PASSED,
      testParameters: [
        { parameter: 'Temperature Pull-down (-80°C)', expectedValue: '-80°C', actualValue: '-82.4°C', unit: '°C', status: 'PASS' },
        { parameter: 'Cascade Stage 1 Pressure', expectedValue: '18 Bar', actualValue: '17.8 Bar', unit: 'Bar', status: 'PASS' },
        { parameter: 'Electrical Safety High-Pot', expectedValue: '1500V 1mA', actualValue: 'Passed 0.4mA', unit: 'Logic', status: 'PASS' }
      ]
    });
    serialNumber.qaInspection = qa._id;
    productionOrder.qaInspection = qa._id;
    await productionOrder.save();

    // Step J: Finished Goods & Packing
    const finishedGood = await FinishedGoods.create({
      serialNumber: serialNumber._id,
      serialNumberString: serialNumber.serialNumber,
      product: productFreezer._id,
      warehouse: warehouseMain._id,
      salesOrder: salesOrder._id,
      customer: customer._id,
      qaCertificateNumber: qa.certificateNumber,
      status: 'PACKED'
    });

    const packing = await Packing.create({
      packingNumber: 'PACK-000001',
      salesOrder: salesOrder._id,
      customer: customer._id,
      serialNumbers: [serialNumber._id],
      packagingType: 'WOODEN_CRATE',
      packedBy: users[ROLES.DISPATCH]._id,
      status: WORKFLOW_STATUS.PACKING.PACKED
    });
    serialNumber.packing = packing._id;

    // Step K: Final Invoice
    const finalInvoice = await FinalInvoice.create({
      invoiceNumber: 'INV-000001',
      salesOrder: salesOrder._id,
      customer: customer._id,
      customerPoReference: customerPO.customerPoReference,
      serialNumbers: [serialNumber._id],
      items: salesOrder.items,
      subtotal: salesOrder.subtotal,
      totalTax: salesOrder.totalTax,
      grandTotal: salesOrder.grandTotal,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ISSUED',
      tallyIntegration: {
        syncStatus: 'SYNCED',
        syncedAt: new Date(),
        externalReference: 'TALLY-VCH-INV-000001'
      },
      createdBy: users[ROLES.ACCOUNTS]._id
    });
    serialNumber.finalInvoice = finalInvoice._id;

    // Step L: Dispatch & Freight
    const dispatch = await Dispatch.create({
      dispatchNumber: 'DISP-000001',
      salesOrder: salesOrder._id,
      finalInvoice: finalInvoice._id,
      customer: customer._id,
      packing: packing._id,
      serialNumbers: [serialNumber._id],
      transporter: transporter._id,
      transporterName: transporter.name,
      trackingNumber: 'LR-CHN-882299',
      vehicleNumber: 'TN 09 BX 4545',
      status: WORKFLOW_STATUS.DISPATCH.DELIVERED
    });
    serialNumber.dispatch = dispatch._id;

    // Step M: Delivery & Proof of Delivery (POD)
    const delivery = await Delivery.create({
      deliveryNumber: 'DEL-000001',
      dispatch: dispatch._id,
      salesOrder: salesOrder._id,
      customer: customer._id,
      serialNumbers: [serialNumber._id],
      podDetails: {
        receivedBy: 'V. Sundaram (Biomedical Engg)',
        receiverPhone: '9840112233',
        remarks: 'Unit received in intact wooden crate without external shock'
      },
      status: 'DELIVERED',
      confirmedBy: users[ROLES.DISPATCH]._id
    });
    serialNumber.delivery = delivery._id;

    // Step N: Installation & Commissioning
    const installation = await Installation.create({
      installationNumber: 'INST-000001',
      serialNumber: serialNumber._id,
      salesOrder: salesOrder._id,
      customer: customer._id,
      assignedEngineer: users[ROLES.SERVICE_ENGINEER]._id,
      installationDate: new Date(),
      status: WORKFLOW_STATUS.INSTALLATION.COMMISSIONED,
      customerSignOff: {
        signedByName: 'Dr. R. Kumar',
        designation: 'Head of Diagnostics',
        signedAt: new Date()
      }
    });
    serialNumber.installation = installation._id;

    // Step O: Warranty Activation
    const warranty = await Warranty.create({
      serialNumber: serialNumber._id,
      serialNumberString: serialNumber.serialNumber,
      customer: customer._id,
      salesOrder: salesOrder._id,
      product: productFreezer._id,
      installation: installation._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      durationMonths: 12,
      status: WORKFLOW_STATUS.WARRANTY.ACTIVE
    });
    serialNumber.warranty = warranty._id;
    serialNumber.currentStatus = 'UNDER_WARRANTY';
    await serialNumber.save();

    // Step P: Demonstration Service Ticket
    const serviceTicket = await ServiceTicket.create({
      ticketNumber: 'SRV-000001',
      customer: customer._id,
      serialNumber: serialNumber._id,
      product: productFreezer._id,
      complaintDescription: 'Calibration verification check requested before regulatory audit',
      isUnderWarranty: true,
      serviceType: 'WARRANTY_FREE',
      assignedEngineer: users[ROLES.SERVICE_ENGINEER]._id,
      diagnosis: {
        findings: 'Freezer running steady at -82°C. Sensor calibrated with NABL master thermometer.',
        diagnosedAt: new Date()
      },
      resolutionSummary: 'Calibrated successfully, certificate endorsed on-site',
      testResult: 'PASS',
      customerSignOff: {
        signedByName: 'Dr. R. Kumar',
        satisfactionRating: 5,
        signedAt: new Date()
      },
      status: WORKFLOW_STATUS.SERVICE_TICKET.CLOSED
    });

    logger.info('Database seeded successfully with all roles, masters, and complete linked business workflow!');
    logger.info('======================================================');
    logger.info('DEVELOPER SEED LOGIN CREDENTIALS:');
    usersToCreate.forEach((u) => {
      logger.info(`- ${u.role.padEnd(16)} : ${u.email.padEnd(25)} / ${password}`);
    });
    logger.info('======================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}\n${error.stack}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
