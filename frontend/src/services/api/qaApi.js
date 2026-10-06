import apiClient from './apiClient';

export const qaApi = {
  getInspections: (params) => apiClient.get('/inspections', { params }),
  getInspectionById: (id) => apiClient.get(`/inspections/${id}`),
  passInspection: (id, data) => apiClient.post(`/inspections/${id}/pass`, data),
  failInspection: (id, data) => apiClient.post(`/inspections/${id}/fail`, data),
  retestInspection: (id, data) => apiClient.post(`/inspections/${id}/retest`, data),
  getSerials: (params) => apiClient.get('/serials', { params }),
  getSerialTrace: (serialNumber) => apiClient.get(`/serials/trace/${serialNumber}`)
};

export default qaApi;
