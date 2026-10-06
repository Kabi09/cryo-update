import apiClient from './apiClient';

export const salesOrderApi = {
  getSalesOrders: (params) => apiClient.get('/sales-orders', { params }),
  getSalesOrderById: (id) => apiClient.get(`/sales-orders/${id}`),
  cancelSalesOrder: (id, reason) => apiClient.post(`/sales-orders/${id}/cancel`, { reason }),
  getTimeline: (id) => apiClient.get(`/sales-orders/${id}/timeline`),
  getTraceability: (id) => apiClient.get(`/sales-orders/${id}/traceability`)
};

export default salesOrderApi;
