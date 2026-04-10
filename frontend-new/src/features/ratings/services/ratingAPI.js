import api from '../../../services/api';

const API_BASE = '/ratings';

export const ratingAPI = {
  // Tạo đánh giá
  create: (data) => {
    return api.post(API_BASE, data);
  },

  // Lấy danh sách đánh giá của sản phẩm
  getProductRatings: (productId, limit = 10, offset = 0) => {
    return api.get(`${API_BASE}/product/${productId}`, {
      params: { limit, offset }
    });
  },

  // Lấy thống kê đánh giá
  getRatingStats: (productId) => {
    return api.get(`${API_BASE}/stats/${productId}`);
  },

  // Lấy rating của user cho sản phẩm
  getUserRating: (productId) => {
    return api.get(`${API_BASE}/my-rating/${productId}`);
  },

  // Cập nhật đánh giá
  update: (ratingId, data) => {
    return api.put(`${API_BASE}/${ratingId}`, data);
  },

  // Xóa đánh giá
  delete: (ratingId) => {
    return api.delete(`${API_BASE}/${ratingId}`);
  },

  // Đánh dấu hữu ích
  markHelpful: (ratingId) => {
    return api.post(`${API_BASE}/${ratingId}/helpful`);
  }
};

export default ratingAPI;
