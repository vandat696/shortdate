import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createRating,
  getProductRatings,
  getRatingStats,
  updateRating,
  deleteRating,
  markRatingHelpful,
  getUserProductRating
} from '../controllers/ratingController.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductRatings); // Lấy danh sách đánh giá của sản phẩm
router.get('/stats/:productId', getRatingStats); // Lấy thống kê đánh giá

// Protected routes (cần đăng nhập)
router.post('/', authenticateToken, createRating); // Tạo đánh giá mới
router.get('/my-rating/:productId', authenticateToken, getUserProductRating); // Lấy rating của user cho sản phẩm
router.put('/:ratingId', authenticateToken, updateRating); // Cập nhật đánh giá
router.delete('/:ratingId', authenticateToken, deleteRating); // Xóa đánh giá
router.post('/:ratingId/helpful', authenticateToken, markRatingHelpful); // Đánh dấu hữu ích

export default router;
