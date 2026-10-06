import apiClient from './apiClient';

export const inventoryApi = {
  getStock: (params) => apiClient.get('/stock', { params }),
  getStockLedger: (params) => apiClient.get('/stock-ledger', { params }),
  getLowStock: () => apiClient.get('/stock/low-stock'),
  transferStock: (data) => apiClient.post('/transfer', data),
  adjustStock: (data) => apiClient.post('/adjust', data)
};

export default inventoryApi;
