import apiClient from './apiClient';

export const leadApi = {
  getLeads: (params) => apiClient.get('/leads', { params }),
  getLeadById: (id) => apiClient.get(`/leads/${id}`),
  createLead: (data) => apiClient.post('/leads', data),
  updateLead: (id, data) => apiClient.put(`/leads/${id}`, data),
  qualifyLead: (id) => apiClient.post(`/leads/${id}/qualify`),
  addFollowUp: (id, data) => apiClient.post(`/leads/${id}/follow-ups`, data),
  convertToEnquiry: (id, data) => apiClient.post(`/leads/${id}/convert-to-enquiry`, data),
  markLeadLost: (id, reason) => apiClient.post(`/leads/${id}/lost`, { reason })
};

export default leadApi;
