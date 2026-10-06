import apiClient from './apiClient';

export const paymentApi = {
  getPayments: (params) => apiClient.get('/payments', { params }),
  getPaymentById: (id) => apiClient.get(`/payments/${id}`),
  createPayment: (data) => apiClient.post('/payments', data),
  verifyPayment: (id, data) => apiClient.post(`/payments/${id}/verify`, data)
};

export const financeApi = {
  getReceivablesSummary: () => apiClient.get('/finance/receivables-summary'),
  getPayablesSummary: () => apiClient.get('/finance/payables-summary'),
  getThreeWayMatch: (vpoId) => apiClient.get(`/finance/three-way-match/${vpoId}`),
  syncInvoiceToTally: (invoiceId) => apiClient.post(`/finance/tally/sync-invoice/${invoiceId}`)
};

export default { paymentApi, financeApi };
