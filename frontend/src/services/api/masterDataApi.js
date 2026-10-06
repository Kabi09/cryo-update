import apiClient from './apiClient';

export const masterDataApi = {
  // Customers
  getCustomers: (params) => apiClient.get('/master/customers', { params }),
  getCustomerById: (id) => apiClient.get(`/master/customers/${id}`),
  createCustomer: (data) => apiClient.post('/master/customers', data),
  updateCustomer: (id, data) => apiClient.patch(`/master/customers/${id}`, data),

  // Products
  getProducts: (params) => apiClient.get('/master/products', { params }),
  getProductById: (id) => apiClient.get(`/master/products/${id}`),
  createProduct: (data) => apiClient.post('/master/products', data),
  updateProduct: (id, data) => apiClient.patch(`/master/products/${id}`, data),

  // Materials
  getMaterials: (params) => apiClient.get('/master/materials', { params }),
  getMaterialById: (id) => apiClient.get(`/master/materials/${id}`),
  createMaterial: (data) => apiClient.post('/master/materials', data),
  updateMaterial: (id, data) => apiClient.patch(`/master/materials/${id}`, data),

  // Vendors
  getVendors: (params) => apiClient.get('/master/vendors', { params }),
  getVendorById: (id) => apiClient.get(`/master/vendors/${id}`),
  createVendor: (data) => apiClient.post('/master/vendors', data),
  updateVendor: (id, data) => apiClient.patch(`/master/vendors/${id}`, data),

  // Warehouses
  getWarehouses: (params) => apiClient.get('/master/warehouses', { params }),
  createWarehouse: (data) => apiClient.post('/master/warehouses', data),

  // Work Centers
  getWorkCenters: (params) => apiClient.get('/master/work-centers', { params }),
  createWorkCenter: (data) => apiClient.post('/master/work-centers', data),

  // Transporters
  getTransporters: (params) => apiClient.get('/master/transporters', { params }),
  createTransporter: (data) => apiClient.post('/master/transporters', data),

  // Configurations
  getConfigurations: () => apiClient.get('/master/configurations'),
  updateConfiguration: (data) => apiClient.post('/master/configurations', data)
};

export default masterDataApi;
