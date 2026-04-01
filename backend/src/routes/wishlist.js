import express from 'express';
import { authenticate } from '../middleware/auth.js';
import WishlistController from '../controllers/wishlistController.js';

const router = express.Router();

// ======== WISHLIST ROUTES ========

/**
 * GET /api/wishlist
 * Lấy danh sách sản phẩm wishlist của user (auth required)
 */
router.get('/', authenticate, WishlistController.getWishlist);

/**
 * POST /api/products/:productId/wishlist
 * Thêm sản phẩm vào wishlist (auth required)
 */
router.post('/:productId/wishlist', authenticate, WishlistController.addToWishlist);

/**
 * DELETE /api/products/:productId/wishlist
 * Xóa sản phẩm khỏi wishlist (auth required)
 */
router.delete('/:productId/wishlist', authenticate, WishlistController.removeFromWishlist);

/**
 * GET /api/products/:productId/wishlist/check
 * Kiểm tra sản phẩm có trong wishlist không (auth optional)
 */
router.get('/:productId/wishlist/check', authenticate, WishlistController.checkWishlist);

export default router;
