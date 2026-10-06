const salesService = require('../services/salesService');
const ApiResponse = require('../utils/apiResponse');

// Leads
const getLeads = async (req, res, next) => {
  try {
    const result = await salesService.getLeads(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await salesService.getLeadById(req.params.id);
    return ApiResponse.success(res, { data: lead });
  } catch (error) { next(error); }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await salesService.createLead(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Lead created successfully', data: lead });
  } catch (error) { next(error); }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await salesService.updateLead(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Lead updated successfully', data: lead });
  } catch (error) { next(error); }
};

const qualifyLead = async (req, res, next) => {
  try {
    const lead = await salesService.qualifyLead(req.params.id, req);
    return ApiResponse.success(res, { message: 'Lead qualified successfully', data: lead });
  } catch (error) { next(error); }
};

const addFollowUp = async (req, res, next) => {
  try {
    const lead = await salesService.addFollowUp(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Follow-up recorded successfully', data: lead });
  } catch (error) { next(error); }
};

const convertToEnquiry = async (req, res, next) => {
  try {
    const result = await salesService.convertToEnquiry(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Lead converted to enquiry', data: result });
  } catch (error) { next(error); }
};

const markLeadLost = async (req, res, next) => {
  try {
    const lead = await salesService.markLeadLost(req.params.id, req.body.reason, req);
    return ApiResponse.success(res, { message: 'Lead marked as lost', data: lead });
  } catch (error) { next(error); }
};

// Enquiries
const getEnquiries = async (req, res, next) => {
  try {
    const result = await salesService.getEnquiries(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await salesService.getEnquiryById(req.params.id);
    return ApiResponse.success(res, { data: enquiry });
  } catch (error) { next(error); }
};

const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await salesService.createEnquiry(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Enquiry created successfully', data: enquiry });
  } catch (error) { next(error); }
};

// Quotations
const getQuotations = async (req, res, next) => {
  try {
    const result = await salesService.getQuotations(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await salesService.getQuotationById(req.params.id);
    return ApiResponse.success(res, { data: quotation });
  } catch (error) { next(error); }
};

const createQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.createQuotation(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Quotation created', data: quotation });
  } catch (error) { next(error); }
};

const submitQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.submitQuotation(req.params.id, req);
    return ApiResponse.success(res, { message: 'Quotation submitted for approval', data: quotation });
  } catch (error) { next(error); }
};

const approveQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.approveQuotation(req.params.id, req);
    return ApiResponse.success(res, { message: 'Quotation approved', data: quotation });
  } catch (error) { next(error); }
};

const rejectQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.rejectQuotation(req.params.id, req.body.reason, req);
    return ApiResponse.success(res, { message: 'Quotation rejected', data: quotation });
  } catch (error) { next(error); }
};

const sendQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.sendQuotation(req.params.id, req);
    return ApiResponse.success(res, { message: 'Quotation sent to customer', data: quotation });
  } catch (error) { next(error); }
};

const negotiateQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.negotiateQuotation(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Negotiation details logged', data: quotation });
  } catch (error) { next(error); }
};

const reviseQuotation = async (req, res, next) => {
  try {
    const newRevision = await salesService.reviseQuotation(req.params.id, req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Quotation revision created', data: newRevision });
  } catch (error) { next(error); }
};

const acceptQuotation = async (req, res, next) => {
  try {
    const quotation = await salesService.acceptQuotation(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Quotation accepted by customer', data: quotation });
  } catch (error) { next(error); }
};

// Proforma Invoices
const getProformaInvoices = async (req, res, next) => {
  try {
    const result = await salesService.getProformaInvoices(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getProformaInvoiceById = async (req, res, next) => {
  try {
    const pi = await salesService.getProformaInvoiceById(req.params.id);
    return ApiResponse.success(res, { data: pi });
  } catch (error) { next(error); }
};

const createProformaInvoice = async (req, res, next) => {
  try {
    const pi = await salesService.createProformaInvoice(req.body.quotationId, req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Proforma Invoice generated', data: pi });
  } catch (error) { next(error); }
};

// Customer PO
const getCustomerPOs = async (req, res, next) => {
  try {
    const result = await salesService.getCustomerPOs(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getCustomerPOById = async (req, res, next) => {
  try {
    const cpo = await salesService.getCustomerPOById(req.params.id);
    return ApiResponse.success(res, { data: cpo });
  } catch (error) { next(error); }
};

const createCustomerPO = async (req, res, next) => {
  try {
    const cpo = await salesService.createCustomerPO(req.body, req);
    return ApiResponse.success(res, { statusCode: 201, message: 'Customer PO recorded', data: cpo });
  } catch (error) { next(error); }
};

const verifyCustomerPO = async (req, res, next) => {
  try {
    const result = await salesService.verifyCustomerPO(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Customer PO verification evaluated', data: result });
  } catch (error) { next(error); }
};

const resolveCustomerPOMismatch = async (req, res, next) => {
  try {
    const cpo = await salesService.resolveCustomerPOMismatch(req.params.id, req.body, req);
    return ApiResponse.success(res, { message: 'Customer PO mismatch resolved', data: cpo });
  } catch (error) { next(error); }
};

// Sales Orders
const getSalesOrders = async (req, res, next) => {
  try {
    const result = await salesService.getSalesOrders(req.query);
    return ApiResponse.success(res, { data: result.items, meta: result.meta });
  } catch (error) { next(error); }
};

const getSalesOrderById = async (req, res, next) => {
  try {
    const so = await salesService.getSalesOrderById(req.params.id);
    return ApiResponse.success(res, { data: so });
  } catch (error) { next(error); }
};

const cancelSalesOrder = async (req, res, next) => {
  try {
    const so = await salesService.cancelSalesOrder(req.params.id, req.body.reason, req);
    return ApiResponse.success(res, { message: 'Sales order cancelled', data: so });
  } catch (error) { next(error); }
};

const getSalesOrderTimeline = async (req, res, next) => {
  try {
    const timeline = await salesService.getSalesOrderTimeline(req.params.id);
    return ApiResponse.success(res, { data: timeline });
  } catch (error) { next(error); }
};

const getSalesOrderTraceability = async (req, res, next) => {
  try {
    const traceability = await salesService.getSalesOrderTraceability(req.params.id);
    return ApiResponse.success(res, { data: traceability });
  } catch (error) { next(error); }
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
