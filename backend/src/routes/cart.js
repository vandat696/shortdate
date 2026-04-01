import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authenticateTokenOptional } from '../middleware/auth-optional.js';
import CartController from '../controllers/cartController.js';

const router = express.Router();

// ======== CART ROUTES ========

/**
 * GET /api/cart
 * Lấy giỏ hàng của người dùng (auth optional)
 */
router.get('/', authenticateTokenOptional, CartController.getCart);

/**
 * POST /api/cart/merge
 * Merge guest cart vào user cart sau khi đăng nhập
 * Body: { items: [{product_id, quantity, unit_price}, ...] }
 */
router.post('/merge', authenticate, CartController.mergeCart);

/**
 * POST /api/cart/items
 * Thêm sản phẩm vào giỏ hàng
 * Body: { product_id, quantity }
 */
router.post('/items', authenticateTokenOptional, CartController.addToCart);

/**
 * PATCH /api/cart/items/:product_id
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * Body: { quantity }
 */
router.patch('/items/:product_id', authenticate, CartController.updateCartItem);

/**
 * DELETE /api/cart/items/:product_id
 * Xóa sản phẩm khỏi giỏ hàng
 */
router.delete('/items/:product_id', authenticate, CartController.removeFromCart);

/**
 * DELETE /api/cart/clear
 * Xóa tất cả item khỏi giỏ hàng
 */
router.delete('/clear', authenticate, CartController.clearCart);

export default router;
