import apiClient from './apiClient';

export const proformaInvoiceApi = {
  getProformaInvoices: (params) => apiClient.get('/proforma-invoices', { params }),
  getProformaInvoiceById: (id) => apiClient.get(`/proforma-invoices/${id}`),
  createProformaInvoice: (data) => apiClient.post('/proforma-invoices', data)
};

export default proformaInvoiceApi;
