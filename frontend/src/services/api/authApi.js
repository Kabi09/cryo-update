import apiClient from './apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  register: (userData) => apiClient.post('/auth/register', userData)
};

export default authApi;
