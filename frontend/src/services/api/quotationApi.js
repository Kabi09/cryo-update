import apiClient from './apiClient';

export const quotationApi = {
  getQuotations: (params) => apiClient.get('/quotations', { params }),
  getQuotationById: (id) => apiClient.get(`/quotations/${id}`),
  createQuotation: (data) => apiClient.post('/quotations', data),
  submitQuotation: (id) => apiClient.post(`/quotations/${id}/submit`),
  approveQuotation: (id) => apiClient.post(`/quotations/${id}/approve`),
  rejectQuotation: (id, reason) => apiClient.post(`/quotations/${id}/reject`, { reason }),
  sendQuotation: (id, data) => apiClient.post(`/quotations/${id}/send`, data),
  negotiateQuotation: (id, data) => apiClient.post(`/quotations/${id}/negotiate`, data),
  reviseQuotation: (id, data) => apiClient.post(`/quotations/${id}/revise`, data),
  acceptQuotation: (id, data) => apiClient.post(`/quotations/${id}/accept`, data)
};

export default quotationApi;
