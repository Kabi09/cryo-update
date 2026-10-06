import apiClient from './apiClient';

export const serviceApi = {
  // Installations
  getInstallations: (params) => apiClient.get('/installations', { params }),
  createInstallation: (data) => apiClient.post('/installations', data),
  commissionInstallation: (id) => apiClient.post(`/installations/${id}/commission`),

  // Warranties
  getWarranties: (params) => apiClient.get('/warranties', { params }),
  checkWarranty: (serialNumber) => apiClient.get(`/warranties/check/${serialNumber}`),

  // Service Tickets
  getServiceTickets: (params) => apiClient.get('/service-tickets', { params }),
  getServiceTicketById: (id) => apiClient.get(`/service-tickets/${id}`),
  createServiceTicket: (data) => apiClient.post('/service-tickets', data),
  assignServiceTicket: (id, engineerId) => apiClient.post(`/service-tickets/${id}/assign`, { engineerId }),
  recordDiagnosis: (id, findings) => apiClient.post(`/service-tickets/${id}/diagnose`, { findings }),
  addSpareParts: (id, materialId, quantity) => apiClient.post(`/service-tickets/${id}/spares`, { materialId, quantity }),
  completeRepair: (id, resolutionSummary) => apiClient.post(`/service-tickets/${id}/repair`, { resolutionSummary }),
  customerSignOff: (id) => apiClient.post(`/service-tickets/${id}/signoff`),

  // RMA
  getRMAs: (params) => apiClient.get('/rmas', { params }),
  getRMAById: (id) => apiClient.get(`/rmas/${id}`),
  createRMA: (data) => apiClient.post('/rmas', data),
  approveRMA: (id) => apiClient.post(`/rmas/${id}/approve`),
  resolveRMA: (id) => apiClient.post(`/rmas/${id}/resolve`)
};

export default serviceApi;
