import apiClient from './apiClient';

export const enquiryApi = {
  getEnquiries: (params) => apiClient.get('/enquiries', { params }),
  getEnquiryById: (id) => apiClient.get(`/enquiries/${id}`),
  createEnquiry: (data) => apiClient.post('/enquiries', data)
};

export default enquiryApi;
