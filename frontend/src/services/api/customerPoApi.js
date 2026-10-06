import apiClient from './apiClient';

export const customerPoApi = {
  getCustomerPOs: (params) => apiClient.get('/customer-pos', { params }),
  getCustomerPOById: (id) => apiClient.get(`/customer-pos/${id}`),
  createCustomerPO: (data) => apiClient.post('/customer-pos', data),
  verifyCustomerPO: (id, data) => apiClient.post(`/customer-pos/${id}/verify`, data),
  resolveMismatch: (id, data) => apiClient.post(`/customer-pos/${id}/resolve-mismatch`, data)
};

export default customerPoApi;
