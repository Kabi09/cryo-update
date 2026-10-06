import apiClient from './apiClient';

export const governanceApi = {
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  getAuditLogs: (params) => apiClient.get('/audit-logs', { params }),
  getEntityAuditLogs: (entityType, entityId) => apiClient.get(`/audit-logs/${entityType}/${entityId}`),
  getDocuments: (params) => apiClient.get('/documents', { params }),
  createDocumentMetadata: (data) => apiClient.post('/documents', data),
  getDashboardMetrics: () => apiClient.get('/dashboard/metrics'),
  getSalesReport: () => apiClient.get('/reports/sales'),
  getProductionReport: () => apiClient.get('/reports/production'),
  getQualityReport: () => apiClient.get('/reports/quality'),
  getServiceReport: () => apiClient.get('/reports/service')
};

export default governanceApi;
