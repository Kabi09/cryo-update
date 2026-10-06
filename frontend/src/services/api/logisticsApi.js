import apiClient from './apiClient';

export const logisticsApi = {
  getFinishedGoods: (params) => apiClient.get('/finished-goods', { params }),
  getPackings: (params) => apiClient.get('/packing', { params }),
  createPacking: (data) => apiClient.post('/packing', data),
  getFinalInvoices: (params) => apiClient.get('/final-invoices', { params }),
  getFinalInvoiceById: (id) => apiClient.get(`/final-invoices/${id}`),
  createFinalInvoice: (data) => apiClient.post('/final-invoices', data),
  getDispatches: (params) => apiClient.get('/dispatch', { params }),
  createDispatch: (data) => apiClient.post('/dispatch', data),
  getDeliveries: (params) => apiClient.get('/deliveries', { params }),
  updatePOD: (dispatchId, data) => apiClient.post(`/dispatch/${dispatchId}/pod`, data),
  reportDeliveryFailure: (dispatchId, reason) => apiClient.post(`/dispatch/${dispatchId}/fail-delivery`, { reason })
};

export default logisticsApi;
