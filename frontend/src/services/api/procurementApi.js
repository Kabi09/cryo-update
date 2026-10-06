import apiClient from './apiClient';

export const procurementApi = {
  // Purchase Requests
  getPurchaseRequests: (params) => apiClient.get('/purchase-requests', { params }),
  createPurchaseRequest: (data) => apiClient.post('/purchase-requests', data),
  approvePurchaseRequest: (id) => apiClient.post(`/purchase-requests/${id}/approve`),

  // RFQ
  getRFQs: (params) => apiClient.get('/rfqs', { params }),
  createRFQ: (data) => apiClient.post('/rfqs', data),
  inwardVendorQuotation: (data) => apiClient.post('/vendor-quotations', data),
  selectVendor: (rfqId, data) => apiClient.post(`/rfqs/${rfqId}/select-vendor`, data),

  // Vendor PO
  getVendorPOs: (params) => apiClient.get('/vendor-pos', { params }),
  createVendorPO: (data) => apiClient.post('/vendor-pos', data),
  approveVendorPO: (id) => apiClient.post(`/vendor-pos/${id}/approve`),

  // GRN
  getGRNs: (params) => apiClient.get('/grns', { params }),
  createGRN: (data) => apiClient.post('/grns', data)
};

export default procurementApi;
