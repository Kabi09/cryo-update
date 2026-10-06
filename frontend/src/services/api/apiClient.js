import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Flag and queue for concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cryo_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract envelope & handle 401 refresh
apiClient.interceptors.response.use(
  (response) => {
    // Return standard backend envelope
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Authentication Error with refresh flow
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      if (originalRequest.url.includes('/auth/refresh')) {
        // If the refresh call itself failed, clear session and redirect to login
        localStorage.removeItem('cryo_access_token');
        localStorage.removeItem('cryo_refresh_token');
        localStorage.removeItem('cryo_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('cryo_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('cryo_access_token');
        localStorage.removeItem('cryo_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = response.data.data.tokens;
        localStorage.setItem('cryo_access_token', accessToken);
        if (newRefresh) {
          localStorage.setItem('cryo_refresh_token', newRefresh);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('cryo_access_token');
        localStorage.removeItem('cryo_refresh_token');
        localStorage.removeItem('cryo_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Format error payload
    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network request failed'
    };
    errorPayload.statusCode = error.response?.status || 500;

    return Promise.reject(errorPayload);
  }
);

export default apiClient;
