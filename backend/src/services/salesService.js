const Lead = require('../models/Lead');
const Enquiry = require('../models/Enquiry');
const Quotation = require('../models/Quotation');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPO = require('../models/CustomerPO');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const ProductionOrder = require('../models/ProductionOrder');
const SerialNumber = require('../models/SerialNumber');
const FinalInvoice = require('../models/FinalInvoice');
const Dispatch = require('../models/Dispatch');
const Delivery = require('../models/Delivery');
const Installation = require('../models/Installation');
const Warranty = require('../models/Warranty');
const ServiceTicket = require('../models/ServiceTicket');
const RMA = require('../models/RMA');

const ApiError = require('../utils/apiError');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { buildPagination, buildFilter, formatPaginatedResult } = require('../utils/queryBuilder');
const { recordAudit } = require('../utils/auditLogger');
const { createNotification } = require('../notifications/notificationService');
const { validateStatusTransition } = require('../workflows/stateMachine');
const WORKFLOW_STATUS = require('../constants/workflowStatus');
const ROLES = require('../constants/roles');

// ========================== LEADS ==========================
const getLeads = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['customerName', 'contactPerson', 'phone', 'email', 'leadNumber'], ['status', 'priority', 'source']);
  const [items, total] = await Promise.all([
    Lead.find(filter).populate('assignedTo', 'name email').populate('customer').sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getLeadById = async (id) => {
  const lead = await Lead.findById(id).populate('assignedTo', 'name email').populate('customer').populate('product');
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
};

const createLead = async (data, req) => {
  const leadNumber = await getNextSequence('LEAD');
  const assignedTo = data.assignedTo || req.user._id;

  let customerId = data.customer || null;
  if (!customerId && data.email) {
    const existingCust = await Customer.findOne({ email: data.email.toLowerCase() });
    if (existingCust) customerId = existingCust._id;
  }

  const lead = await Lead.create({
    ...data,
    leadNumber,
    assignedTo,
    customer: customerId,
    status: WORKFLOW_STATUS.LEAD.NEW,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.LEAD.NEW,
        changedBy: req.user._id,
        remarks: 'Lead created'
      }
    ]
  });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    documentNumber: lead.leadNumber,
    after: lead.toObject()
  });

  return lead;
};

const updateLead = async (id, data, req) => {
  const lead = await Lead.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');

  const before = lead.toObject();
  Object.assign(lead, data);
  await lead.save();

  await recordAudit({
    req,
    action: 'UPDATE',
    module: 'LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    documentNumber: lead.leadNumber,
    before,
    after: lead.toObject()
  });

  return lead;
};

const qualifyLead = async (id, req) => {
  const lead = await Lead.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');

  validateStatusTransition('LEAD', lead.status, WORKFLOW_STATUS.LEAD.QUALIFIED);

  // Link or create customer
  if (!lead.customer) {
    let customer = await Customer.findOne({ email: lead.email.toLowerCase() });
    if (!customer) {
      const customerId = await getNextSequence('CUSTOMER');
      customer = await Customer.create({
        customerId,
        companyName: lead.customerName,
        contactPerson: lead.contactPerson,
        email: lead.email,
        phone: lead.phone
      });
    }
    lead.customer = customer._id;
  }

  lead.status = WORKFLOW_STATUS.LEAD.QUALIFIED;
  lead.statusHistory.push({
    status: WORKFLOW_STATUS.LEAD.QUALIFIED,
    changedBy: req.user._id,
    remarks: 'Lead qualified by sales'
  });
  await lead.save();

  await recordAudit({
    req,
    action: 'QUALIFY',
    module: 'LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    documentNumber: lead.leadNumber,
    remarks: 'Lead qualified'
  });

  return lead;
};

const addFollowUp = async (id, followUpData, req) => {
  const lead = await Lead.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');

  lead.followUps.push({
    ...followUpData,
    conductedBy: req.user._id
  });

  if (lead.status === WORKFLOW_STATUS.LEAD.NEW) {
    lead.status = WORKFLOW_STATUS.LEAD.CONTACTED;
  } else if (lead.status === WORKFLOW_STATUS.LEAD.CONTACTED) {
    lead.status = WORKFLOW_STATUS.LEAD.FOLLOW_UP;
  }

  await lead.save();

  await recordAudit({
    req,
    action: 'ADD_FOLLOW_UP',
    module: 'LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    documentNumber: lead.leadNumber,
    remarks: `Follow-up added: ${followUpData.discussion}`
  });

  return lead;
};

const convertToEnquiry = async (id, enquiryData = {}, req) => {
  const lead = await Lead.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');

  if (!lead.customer) {
    await qualifyLead(id, req);
  }

  validateStatusTransition('LEAD', lead.status, WORKFLOW_STATUS.LEAD.CONVERTED);

  const enquiryNumber = await getNextSequence('ENQUIRY');
  const items = enquiryData.items || [
    {
      product: lead.product || (await Product.findOne())?._id,
      quantity: lead.quantity || 1,
      targetPrice: lead.expectedValue || 0,
      specifications: lead.requirement
    }
  ];

  const enquiry = await Enquiry.create({
    enquiryNumber,
    lead: lead._id,
    customer: lead.customer,
    items,
    assignedSalesperson: lead.assignedTo || req.user._id,
    status: WORKFLOW_STATUS.ENQUIRY.ACTIVE
  });

  lead.status = WORKFLOW_STATUS.LEAD.CONVERTED;
  lead.convertedEnquiry = enquiry._id;
  lead.statusHistory.push({
    status: WORKFLOW_STATUS.LEAD.CONVERTED,
    changedBy: req.user._id,
    remarks: `Converted to enquiry ${enquiry.enquiryNumber}`
  });
  await lead.save();

  await recordAudit({
    req,
    action: 'CONVERT_TO_ENQUIRY',
    module: 'LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    documentNumber: lead.leadNumber,
    remarks: `Lead converted to enquiry ${enquiry.enquiryNumber}`
  });

  return { lead, enquiry };
};

const markLeadLost = async (id, reason, req) => {
  const lead = await Lead.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');

  validateStatusTransition('LEAD', lead.status, WORKFLOW_STATUS.LEAD.LOST);

  lead.status = WORKFLOW_STATUS.LEAD.LOST;
  lead.lostReason = reason || 'Customer not interested';
  lead.statusHistory.push({
    status: WORKFLOW_STATUS.LEAD.LOST,
    changedBy: req.user._id,
    remarks: `Lead marked lost: ${reason}`
  });
  await lead.save();

  await recordAudit({
    req,
    action: 'MARK_LOST',
    module: 'LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    documentNumber: lead.leadNumber,
    remarks: reason
  });

  return lead;
};

// ========================== ENQUIRIES ==========================
const getEnquiries = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['enquiryNumber'], ['status', 'customer']);
  const [items, total] = await Promise.all([
    Enquiry.find(filter).populate('lead').populate('customer').populate('items.product').sort(sort).skip(skip).limit(limit),
    Enquiry.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getEnquiryById = async (id) => {
  const enquiry = await Enquiry.findById(id).populate('lead').populate('customer').populate('items.product').populate('quotations');
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
};

const createEnquiry = async (data, req) => {
  const enquiryNumber = await getNextSequence('ENQUIRY');
  const enquiry = await Enquiry.create({
    ...data,
    enquiryNumber,
    assignedSalesperson: data.assignedSalesperson || req.user._id
  });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'ENQUIRY',
    entityType: 'Enquiry',
    entityId: enquiry._id,
    documentNumber: enquiry.enquiryNumber,
    after: enquiry.toObject()
  });

  return enquiry;
};

// ========================== QUOTATIONS ==========================
const calculateQuotationTotals = (items) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const discPct = Number(item.discountPercent) || 0;
    const taxPct = Number(item.taxPercent) !== undefined ? Number(item.taxPercent) : 18;

    const baseAmount = qty * price;
    const discAmount = (baseAmount * discPct) / 100;
    const taxableAmount = baseAmount - discAmount;
    const taxAmount = (taxableAmount * taxPct) / 100;
    const lineTotal = taxableAmount + taxAmount;

    subtotal += baseAmount;
    totalDiscount += discAmount;
    totalTax += taxAmount;

    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      discountPercent: discPct,
      discountAmount: discAmount,
      taxPercent: taxPct,
      taxAmount,
      lineTotal
    };
  });

  const grandTotal = subtotal - totalDiscount + totalTax;
  return { items: processedItems, subtotal, totalDiscount, totalTax, grandTotal };
};

const getQuotations = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['quotationNumber', 'revisionCode'], ['status', 'customer', 'isLatestRevision']);
  const [items, total] = await Promise.all([
    Quotation.find(filter).populate('customer').populate('createdBy', 'name email').sort(sort).skip(skip).limit(limit),
    Quotation.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getQuotationById = async (id) => {
  const quotation = await Quotation.findById(id).populate('customer').populate('lead').populate('enquiry').populate('createdBy', 'name email').populate('approvedBy', 'name email');
  if (!quotation) throw ApiError.notFound('Quotation not found');
  return quotation;
};

const createQuotation = async (data, req) => {
  const quotationNumber = await getNextSequence('QUOTATION');
  const revisionNumber = 0;
  const revisionCode = `${quotationNumber}-R0`;

  const validityDays = data.validityDays || 30;
  const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  const { items, subtotal, totalDiscount, totalTax, grandTotal } = calculateQuotationTotals(data.items || []);

  const quotation = await Quotation.create({
    ...data,
    quotationNumber,
    revisionNumber,
    revisionCode,
    isLatestRevision: true,
    items,
    subtotal,
    totalDiscount,
    totalTax,
    grandTotal,
    validityDays,
    validUntil,
    status: WORKFLOW_STATUS.QUOTATION.DRAFT,
    createdBy: req.user._id,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.QUOTATION.DRAFT,
        changedBy: req.user._id,
        remarks: 'Quotation draft created'
      }
    ]
  });

  if (data.enquiry) {
    await Enquiry.findByIdAndUpdate(data.enquiry, {
      $push: { quotations: quotation._id },
      status: WORKFLOW_STATUS.ENQUIRY.QUOTED
    });
  }

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode,
    after: quotation.toObject()
  });

  return quotation;
};

const submitQuotation = async (id, req) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  validateStatusTransition('QUOTATION', quotation.status, WORKFLOW_STATUS.QUOTATION.PENDING_APPROVAL);

  quotation.status = WORKFLOW_STATUS.QUOTATION.PENDING_APPROVAL;
  quotation.statusHistory.push({
    status: WORKFLOW_STATUS.QUOTATION.PENDING_APPROVAL,
    changedBy: req.user._id,
    remarks: 'Submitted for manager approval'
  });
  await quotation.save();

  await createNotification({
    role: ROLES.SALES_MANAGER,
    type: 'QUOTATION_APPROVAL_REQUIRED',
    title: 'Quotation Approval Required',
    message: `Quotation ${quotation.revisionCode} requires manager approval.`,
    entityType: 'Quotation',
    entityId: quotation._id
  });

  await recordAudit({
    req,
    action: 'SUBMIT_FOR_APPROVAL',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode
  });

  return quotation;
};

const approveQuotation = async (id, req) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  validateStatusTransition('QUOTATION', quotation.status, WORKFLOW_STATUS.QUOTATION.APPROVED);

  quotation.status = WORKFLOW_STATUS.QUOTATION.APPROVED;
  quotation.approvedBy = req.user._id;
  quotation.approvedAt = new Date();
  quotation.statusHistory.push({
    status: WORKFLOW_STATUS.QUOTATION.APPROVED,
    changedBy: req.user._id,
    remarks: 'Approved by Sales Manager'
  });
  await quotation.save();

  await recordAudit({
    req,
    action: 'APPROVE',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode,
    remarks: 'Quotation approved'
  });

  return quotation;
};

const rejectQuotation = async (id, reason, req) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  validateStatusTransition('QUOTATION', quotation.status, WORKFLOW_STATUS.QUOTATION.REJECTED);

  quotation.status = WORKFLOW_STATUS.QUOTATION.REJECTED;
  quotation.rejectionReason = reason || 'Rejected by manager';
  quotation.statusHistory.push({
    status: WORKFLOW_STATUS.QUOTATION.REJECTED,
    changedBy: req.user._id,
    remarks: `Quotation rejected: ${reason}`
  });
  await quotation.save();

  await recordAudit({
    req,
    action: 'REJECT',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode,
    remarks: reason
  });

  return quotation;
};

const sendQuotation = async (id, req) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  validateStatusTransition('QUOTATION', quotation.status, WORKFLOW_STATUS.QUOTATION.SENT);

  quotation.status = WORKFLOW_STATUS.QUOTATION.SENT;
  quotation.statusHistory.push({
    status: WORKFLOW_STATUS.QUOTATION.SENT,
    changedBy: req.user._id,
    remarks: 'Quotation sent to customer'
  });
  await quotation.save();

  await recordAudit({
    req,
    action: 'SEND_TO_CUSTOMER',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode
  });

  return quotation;
};

const negotiateQuotation = async (id, negotiationData, req) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  validateStatusTransition('QUOTATION', quotation.status, WORKFLOW_STATUS.QUOTATION.NEGOTIATION);

  quotation.status = WORKFLOW_STATUS.QUOTATION.NEGOTIATION;
  quotation.negotiationHistory.push({
    ...negotiationData,
    recordedBy: req.user._id
  });
  quotation.statusHistory.push({
    status: WORKFLOW_STATUS.QUOTATION.NEGOTIATION,
    changedBy: req.user._id,
    remarks: `Negotiation logged: ${negotiationData.customerMessage}`
  });
  await quotation.save();

  await recordAudit({
    req,
    action: 'NEGOTIATE',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode,
    remarks: negotiationData.customerMessage
  });

  return quotation;
};

const reviseQuotation = async (id, revisionData, req) => {
  const prevQuotation = await Quotation.findById(id);
  if (!prevQuotation) throw ApiError.notFound('Quotation not found');

  // Mark previous as no longer latest
  prevQuotation.isLatestRevision = false;
  prevQuotation.status = WORKFLOW_STATUS.QUOTATION.REVISED;
  await prevQuotation.save();

  const nextRevisionNum = prevQuotation.revisionNumber + 1;
  const revisionCode = `${prevQuotation.quotationNumber}-R${nextRevisionNum}`;

  const validityDays = revisionData.validityDays || prevQuotation.validityDays;
  const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  const { items, subtotal, totalDiscount, totalTax, grandTotal } = calculateQuotationTotals(revisionData.items || prevQuotation.items);

  const newRevision = await Quotation.create({
    quotationNumber: prevQuotation.quotationNumber,
    revisionNumber: nextRevisionNum,
    revisionCode,
    isLatestRevision: true,
    parentQuotation: prevQuotation._id,
    lead: prevQuotation.lead,
    enquiry: prevQuotation.enquiry,
    customer: prevQuotation.customer,
    items,
    subtotal,
    totalDiscount,
    totalTax,
    grandTotal,
    validityDays,
    validUntil,
    paymentTerms: revisionData.paymentTerms || prevQuotation.paymentTerms,
    deliveryTerms: revisionData.deliveryTerms || prevQuotation.deliveryTerms,
    warrantyTerms: revisionData.warrantyTerms || prevQuotation.warrantyTerms,
    status: WORKFLOW_STATUS.QUOTATION.DRAFT,
    createdBy: req.user._id,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.QUOTATION.DRAFT,
        changedBy: req.user._id,
        remarks: `Created revision ${revisionCode} from ${prevQuotation.revisionCode}`
      }
    ]
  });

  await recordAudit({
    req,
    action: 'REVISE',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: newRevision._id,
    documentNumber: newRevision.revisionCode,
    remarks: `Revised quotation created: ${newRevision.revisionCode}`
  });

  return newRevision;
};

const acceptQuotation = async (id, acceptanceData = {}, req) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  validateStatusTransition('QUOTATION', quotation.status, WORKFLOW_STATUS.QUOTATION.ACCEPTED);

  quotation.status = WORKFLOW_STATUS.QUOTATION.ACCEPTED;
  quotation.acceptedAt = new Date();
  quotation.acceptedByCustomerPerson = acceptanceData.acceptedByCustomerPerson || 'Customer Representative';
  quotation.statusHistory.push({
    status: WORKFLOW_STATUS.QUOTATION.ACCEPTED,
    changedBy: req.user._id,
    remarks: `Accepted by customer (${quotation.acceptedByCustomerPerson})`
  });
  await quotation.save();

  await recordAudit({
    req,
    action: 'ACCEPT',
    module: 'QUOTATION',
    entityType: 'Quotation',
    entityId: quotation._id,
    documentNumber: quotation.revisionCode,
    remarks: 'Quotation accepted by customer'
  });

  return quotation;
};

// ========================== PROFORMA INVOICE ==========================
const getProformaInvoices = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['piNumber', 'revisionCode'], ['status', 'customer']);
  const [items, total] = await Promise.all([
    ProformaInvoice.find(filter).populate('customer').populate('quotation').sort(sort).skip(skip).limit(limit),
    ProformaInvoice.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getProformaInvoiceById = async (id) => {
  const pi = await ProformaInvoice.findById(id).populate('customer').populate('quotation');
  if (!pi) throw ApiError.notFound('Proforma invoice not found');
  return pi;
};

const createProformaInvoice = async (quotationId, piData = {}, req) => {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw ApiError.notFound('Accepted quotation not found');

  if (quotation.status !== WORKFLOW_STATUS.QUOTATION.ACCEPTED && quotation.status !== WORKFLOW_STATUS.QUOTATION.APPROVED) {
    throw ApiError.businessRule('Proforma Invoice requires an Accepted or Approved Quotation');
  }

  const piNumber = await getNextSequence('PROFORMA_INVOICE');
  const advancePercent = piData.advancePercent !== undefined ? piData.advancePercent : 30;
  const advanceAmount = (quotation.grandTotal * advancePercent) / 100;

  const pi = await ProformaInvoice.create({
    piNumber,
    quotation: quotation._id,
    revisionCode: quotation.revisionCode,
    customer: quotation.customer,
    items: quotation.items.map((i) => ({
      product: i.product,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      taxPercent: i.taxPercent,
      taxAmount: i.taxAmount,
      lineTotal: i.lineTotal
    })),
    subtotal: quotation.subtotal,
    totalTax: quotation.totalTax,
    grandTotal: quotation.grandTotal,
    advancePercent,
    advanceAmount,
    paymentTerms: piData.paymentTerms || quotation.paymentTerms,
    deliveryTerms: piData.deliveryTerms || quotation.deliveryTerms,
    status: WORKFLOW_STATUS.PROFORMA_INVOICE.APPROVED,
    createdBy: req.user._id,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.PROFORMA_INVOICE.APPROVED,
        changedBy: req.user._id,
        remarks: 'Proforma Invoice generated from accepted quotation'
      }
    ]
  });

  await recordAudit({
    req,
    action: 'CREATE',
    module: 'PROFORMA_INVOICE',
    entityType: 'ProformaInvoice',
    entityId: pi._id,
    documentNumber: pi.piNumber
  });

  return pi;
};

// ========================== CUSTOMER PO ==========================
const getCustomerPOs = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['poNumber', 'customerPoReference'], ['status', 'customer']);
  const [items, total] = await Promise.all([
    CustomerPO.find(filter).populate('customer').populate('quotation').populate('salesOrder').sort(sort).skip(skip).limit(limit),
    CustomerPO.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getCustomerPOById = async (id) => {
  const cpo = await CustomerPO.findById(id).populate('customer').populate('quotation').populate('proformaInvoice').populate('salesOrder');
  if (!cpo) throw ApiError.notFound('Customer PO not found');
  return cpo;
};

const createCustomerPO = async (data, req) => {
  const poNumber = await getNextSequence('CUSTOMER_PO');
  const quotation = await Quotation.findById(data.quotation);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  const items = data.items && data.items.length > 0
    ? data.items
    : quotation.items.map((i) => ({
        product: i.product,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal
      }));
  const totalAmount = data.totalAmount !== undefined ? data.totalAmount : quotation.grandTotal;

  const customerPO = await CustomerPO.create({
    ...data,
    poNumber,
    customer: quotation.customer,
    items,
    totalAmount,
    status: WORKFLOW_STATUS.CUSTOMER_PO.RECEIVED,
    receivedBy: req.user._id,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.CUSTOMER_PO.RECEIVED,
        changedBy: req.user._id,
        remarks: 'Customer PO received'
      }
    ]
  });

  await recordAudit({
    req,
    action: 'RECEIVE_PO',
    module: 'CUSTOMER_PO',
    entityType: 'CustomerPO',
    entityId: customerPO._id,
    documentNumber: customerPO.poNumber
  });

  return customerPO;
};

const verifyCustomerPO = async (id, { discrepancies = [], holdReason = null } = {}, req) => {
  const cpo = await CustomerPO.findById(id).populate('quotation');
  if (!cpo) throw ApiError.notFound('Customer PO not found');

  const quotation = cpo.quotation;
  const isMatch = discrepancies.length === 0 && !holdReason;

  if (!isMatch) {
    // Mismatch branch: HOLD
    cpo.status = WORKFLOW_STATUS.CUSTOMER_PO.MISMATCH_HOLD;
    cpo.verificationDetails = {
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      matched: false,
      discrepancies,
      holdReason: holdReason || 'PO details do not match quotation agreed terms'
    };
    cpo.statusHistory.push({
      status: WORKFLOW_STATUS.CUSTOMER_PO.MISMATCH_HOLD,
      changedBy: req.user._id,
      remarks: `PO mismatch detected: ${cpo.verificationDetails.holdReason}`
    });
    await cpo.save();

    await createNotification({
      role: ROLES.SALES_MANAGER,
      type: 'PO_MISMATCH',
      title: 'Customer PO Mismatch',
      message: `Customer PO ${cpo.customerPoReference} (${cpo.poNumber}) has been held due to commercial mismatch.`,
      entityType: 'CustomerPO',
      entityId: cpo._id
    });

    await recordAudit({
      req,
      action: 'VERIFY_MISMATCH',
      module: 'CUSTOMER_PO',
      entityType: 'CustomerPO',
      entityId: cpo._id,
      documentNumber: cpo.poNumber,
      remarks: cpo.verificationDetails.holdReason
    });

    return { customerPO: cpo, salesOrder: null };
  }

  // Matched branch: VERIFIED -> Create internal SalesOrder
  cpo.status = WORKFLOW_STATUS.CUSTOMER_PO.VERIFIED;
  cpo.verificationDetails = {
    verifiedBy: req.user._id,
    verifiedAt: new Date(),
    matched: true,
    discrepancies: []
  };
  cpo.statusHistory.push({
    status: WORKFLOW_STATUS.CUSTOMER_PO.VERIFIED,
    changedBy: req.user._id,
    remarks: 'Customer PO verified and matched with quotation'
  });

  const salesOrderNumber = await getNextSequence('SALES_ORDER');
  const advanceRequired = quotation.grandTotal * 0.3; // standard 30% advance baseline

  const salesOrder = await SalesOrder.create({
    salesOrderNumber,
    customerPo: cpo._id,
    customer: cpo.customer,
    quotation: quotation._id,
    items: quotation.items.map((i) => ({
      product: i.product,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      taxPercent: i.taxPercent,
      taxAmount: i.taxAmount,
      lineTotal: i.lineTotal
    })),
    subtotal: quotation.subtotal,
    totalTax: quotation.totalTax,
    grandTotal: quotation.grandTotal,
    advanceRequiredAmount: advanceRequired,
    status: WORKFLOW_STATUS.SALES_ORDER.CONFIRMED,
    statusHistory: [
      {
        status: WORKFLOW_STATUS.SALES_ORDER.CONFIRMED,
        changedBy: req.user._id,
        remarks: 'Sales Order confirmed from verified Customer PO'
      }
    ]
  });

  cpo.salesOrder = salesOrder._id;
  await cpo.save();

  await recordAudit({
    req,
    action: 'VERIFY_AND_CREATE_SO',
    module: 'CUSTOMER_PO',
    entityType: 'CustomerPO',
    entityId: cpo._id,
    documentNumber: cpo.poNumber,
    remarks: `Customer PO verified. Created Sales Order ${salesOrder.salesOrderNumber}`
  });

  return { customerPO: cpo, salesOrder };
};

const resolveCustomerPOMismatch = async (id, { resolutionNotes }, req) => {
  const cpo = await CustomerPO.findById(id);
  if (!cpo) throw ApiError.notFound('Customer PO not found');

  cpo.status = WORKFLOW_STATUS.CUSTOMER_PO.PENDING_VERIFICATION;
  cpo.verificationDetails.resolutionNotes = resolutionNotes;
  cpo.statusHistory.push({
    status: WORKFLOW_STATUS.CUSTOMER_PO.PENDING_VERIFICATION,
    changedBy: req.user._id,
    remarks: `Mismatch hold resolved: ${resolutionNotes}. Ready for re-verification.`
  });
  await cpo.save();

  await recordAudit({
    req,
    action: 'RESOLVE_MISMATCH',
    module: 'CUSTOMER_PO',
    entityType: 'CustomerPO',
    entityId: cpo._id,
    documentNumber: cpo.poNumber,
    remarks: resolutionNotes
  });

  return cpo;
};

// ========================== SALES ORDERS ==========================
const getSalesOrders = async (query) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildFilter(query, ['salesOrderNumber'], ['status', 'customer', 'isReleasedToProduction']);
  const [items, total] = await Promise.all([
    SalesOrder.find(filter).populate('customer').populate('customerPo').populate('items.product').sort(sort).skip(skip).limit(limit),
    SalesOrder.countDocuments(filter)
  ]);
  return formatPaginatedResult(items, total, page, limit);
};

const getSalesOrderById = async (id) => {
  const so = await SalesOrder.findById(id).populate('customer').populate('customerPo').populate('quotation').populate('items.product').populate('productionOrders');
  if (!so) throw ApiError.notFound('Sales order not found');
  return so;
};

const cancelSalesOrder = async (id, reason, req) => {
  const so = await SalesOrder.findById(id);
  if (!so) throw ApiError.notFound('Sales order not found');

  validateStatusTransition('SALES_ORDER', so.status, WORKFLOW_STATUS.SALES_ORDER.CANCELLED);

  so.status = WORKFLOW_STATUS.SALES_ORDER.CANCELLED;
  so.cancellationReason = reason || 'Cancelled by request';
  so.statusHistory.push({
    status: WORKFLOW_STATUS.SALES_ORDER.CANCELLED,
    changedBy: req.user._id,
    remarks: `Sales Order cancelled: ${reason}`
  });
  await so.save();

  await recordAudit({
    req,
    action: 'CANCEL',
    module: 'SALES_ORDER',
    entityType: 'SalesOrder',
    entityId: so._id,
    documentNumber: so.salesOrderNumber,
    remarks: reason
  });

  return so;
};

const getSalesOrderTimeline = async (id) => {
  const so = await SalesOrder.findById(id);
  if (!so) throw ApiError.notFound('Sales order not found');

  const events = [];
  so.statusHistory.forEach((h) => {
    events.push({
      stage: 'SALES_ORDER',
      status: h.status,
      timestamp: h.changedAt,
      remarks: h.remarks
    });
  });

  // Query payments
  const payments = await Payment.find({ salesOrder: so._id });
  payments.forEach((p) => {
    events.push({
      stage: 'PAYMENT',
      status: p.status,
      timestamp: p.createdAt,
      remarks: `Payment of ₹${p.amount} received (Ref: ${p.transactionReference})`
    });
  });

  // Query production orders
  const prodOrders = await ProductionOrder.find({ salesOrder: so._id });
  prodOrders.forEach((po) => {
    po.statusHistory.forEach((h) => {
      events.push({
        stage: 'PRODUCTION',
        status: h.status,
        timestamp: h.changedAt,
        remarks: `Production Order ${po.productionOrderNumber}: ${h.remarks}`
      });
    });
  });

  // Query serial numbers
  const serials = await SerialNumber.find({ salesOrder: so._id });
  serials.forEach((sn) => {
    events.push({
      stage: 'SERIAL_TRACKING',
      status: sn.currentStatus,
      timestamp: sn.manufacturedDate,
      remarks: `Unit Serial: ${sn.serialNumber}`
    });
  });

  // Sort events chronologically
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return events;
};

const getSalesOrderTraceability = async (id) => {
  const so = await SalesOrder.findById(id)
    .populate('customer')
    .populate('customerPo')
    .populate('quotation');
  if (!so) throw ApiError.notFound('Sales order not found');

  const [payments, productionOrders, serialNumbers, finalInvoice, dispatch, delivery, installation, warranty, serviceTickets, rma] = await Promise.all([
    Payment.find({ salesOrder: so._id }),
    ProductionOrder.find({ salesOrder: so._id }),
    SerialNumber.find({ salesOrder: so._id }),
    FinalInvoice.findOne({ salesOrder: so._id }),
    Dispatch.findOne({ salesOrder: so._id }),
    Delivery.findOne({ salesOrder: so._id }),
    Installation.find({ salesOrder: so._id }),
    Warranty.find({ salesOrder: so._id }),
    ServiceTicket.find({ serialNumber: { $in: (await SerialNumber.find({ salesOrder: so._id })).map((s) => s._id) } }),
    RMA.find({ serialNumber: { $in: (await SerialNumber.find({ salesOrder: so._id })).map((s) => s._id) } })
  ]);

  return {
    salesOrder: {
      id: so._id,
      number: so.salesOrderNumber,
      status: so.status,
      grandTotal: so.grandTotal,
      totalPaid: so.totalPaidAmount
    },
    customer: so.customer,
    customerPo: so.customerPo,
    quotation: so.quotation,
    payments,
    productionOrders,
    serialNumbers,
    finalInvoice,
    dispatch,
    delivery,
    installation,
    warranty,
    serviceTickets,
    rma
  };
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  qualifyLead,
  addFollowUp,
  convertToEnquiry,
  markLeadLost,
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  getQuotations,
  getQuotationById,
  createQuotation,
  submitQuotation,
  approveQuotation,
  rejectQuotation,
  sendQuotation,
  negotiateQuotation,
  reviseQuotation,
  acceptQuotation,
  getProformaInvoices,
  getProformaInvoiceById,
  createProformaInvoice,
  getCustomerPOs,
  getCustomerPOById,
  createCustomerPO,
  verifyCustomerPO,
  resolveCustomerPOMismatch,
  getSalesOrders,
  getSalesOrderById,
  cancelSalesOrder,
  getSalesOrderTimeline,
  getSalesOrderTraceability
};
