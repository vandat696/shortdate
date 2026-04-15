import express from 'express';
import { authenticate } from '../middleware/auth.js';
import PricingTierController from '../controllers/pricingTierController.js';

const router = express.Router();

/**
 * PUBLIC - Lấy tất cả tiers của sản phẩm
 * GET /api/pricing-tiers/product/:productId
 */
router.get('/product/:productId', PricingTierController.getProductTiers);

/**
 * PUBLIC - Lấy tier phù hợp cho số lượng không điều kiện
 * GET /api/pricing-tiers/product/:productId/quantity/:quantity
 */
router.get('/product/:productId/quantity/:quantity', PricingTierController.getTierByQuantity);

/**
 * PUBLIC - Tính giá cho số lượng nhất định (buyer xem giá)
 * GET /api/pricing-tiers/product/:productId/price/:quantity
 */
router.get('/product/:productId/price/:quantity', PricingTierController.calculatePrice);

/**
 * PROTECTED (Supplier) - Tạo tier giá mới
 * POST /api/pricing-tiers
 * Body: { product_id, min_quantity, max_quantity, tier_price, discount_percentage, description }
 */
router.post('/', authenticate, PricingTierController.createTier);

/**
 * PROTECTED (Supplier) - Cập nhật tier giá
 * PUT /api/pricing-tiers/:id
 * Body: { min_quantity, max_quantity, tier_price, discount_percentage, description, is_active }
 */
router.put('/:id', authenticate, PricingTierController.updateTier);

/**
 * PROTECTED (Supplier) - Xóa tier giá
 * DELETE /api/pricing-tiers/:id
 */
router.delete('/:id', authenticate, PricingTierController.deleteTier);

export default router;
