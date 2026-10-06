import apiClient from './apiClient';

export const bomApi = {
  getBOMs: (params) => apiClient.get('/boms', { params }),
  getBOMById: (id) => apiClient.get(`/boms/${id}`),
  createBOM: (data) => apiClient.post('/boms', data),
  approveBOM: (id) => apiClient.post(`/boms/${id}/approve`)
};

export const productionApi = {
  getProductionOrders: (params) => apiClient.get('/production-orders', { params }),
  getProductionOrderById: (id) => apiClient.get(`/production-orders/${id}`),
  createProductionOrder: (data) => apiClient.post('/production-orders', data),
  releaseProductionOrder: (id) => apiClient.post(`/production-orders/${id}/release`),
  requestMaterials: (id, data) => apiClient.post(`/production-orders/${id}/request-materials`, data),
  advanceStage: (id, data) => apiClient.post(`/production-orders/${id}/advance-stage`, data),
  issueMaterials: (materialRequestId) => apiClient.post(`/material-requests/${materialRequestId}/issue`)
};

export default { bomApi, productionApi };
