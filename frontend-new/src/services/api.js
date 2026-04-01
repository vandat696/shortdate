import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Extract base URL without /api

console.log('[API] Base URL:', API_BASE_URL);
console.log('[API] Backend URL:', BACKEND_URL);

// Helper để convert relative image paths thành full URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; // Already full URL
  return `${BACKEND_URL}${imagePath}`; // Convert relative to full
};

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

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (product_id, quantity) =>
    api.post('/cart/items', { product_id, quantity }),
  updateCartItem: (product_id, quantity) =>
    api.patch(`/cart/items/${product_id}`, { quantity }),
  removeFromCart: (product_id) =>
    api.delete(`/cart/items/${product_id}`),
  clearCart: () => api.delete('/cart/clear'),
  mergeCart: (items) =>
    api.post('/cart/merge', { items }),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) =>
    api.post(`/wishlist/${productId}/wishlist`),
  removeFromWishlist: (productId) =>
    api.delete(`/wishlist/${productId}/wishlist`),
  checkWishlist: (productId) =>
    api.get(`/wishlist/${productId}/wishlist/check`),
};

export const imageService = {
  getProductImages: (productId) =>
    api.get(`/images/${productId}`),
  uploadProductImages: (productId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.post(`/images/${productId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

export default api;
