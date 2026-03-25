import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('[API Interceptor] Request:', config.method?.toUpperCase(), config.url, 'Token:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API Interceptor] Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[API Interceptor] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Interceptor] Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const authService = {
  register: (email, password, userType = 'buyer') =>
    api.post('/auth/register', { email, password, userType }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  verifyEmail: (userId) =>
    api.post('/auth/verify-email', { userId }),
};

export const productService = {
  getAll: (params = {}) => api.get('/products/all', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

export default api;
