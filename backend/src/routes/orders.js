import express from 'express';
import { authenticate } from '../middleware/auth.js';
import OrderController from '../controllers/orderController.js';

const router = express.Router();

/**
 * POST /api/orders
 * Tạo đơn hàng mới từ giỏ hàng
 * Body: { shippingAddress, paymentMethod }
 */
router.post('/', authenticate, OrderController.createOrder);

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng của người dùng
 * Query: status, limit, offset
 */
router.get('/', authenticate, OrderController.getMyOrders);

/**
 * GET /api/orders/:orderId
 * Lấy chi tiết đơn hàng
 */
router.get('/:orderId', authenticate, OrderController.getOrder);

/**
 * POST /api/orders/:orderId/cancel
 * Hủy đơn hàng
 */
router.post('/:orderId/cancel', authenticate, OrderController.cancelOrder);

export default router;
