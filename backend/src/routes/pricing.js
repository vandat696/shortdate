import express from 'express';
import { authenticate } from '../middleware/auth.js';
import PricingController from '../controllers/pricingController.js';

const router = express.Router();

/**
 * PUBLIC - Lấy giá hiện tại của sản phẩm
 * GET /pricing/:productId/current
 */
router.get('/:productId/current', PricingController.getCurrentPrice);

/**
 * PUBLIC - Lấy lịch sử thay đổi giá
 * GET /pricing/:productId/history?limit=50
 */
router.get('/:productId/history', PricingController.getPriceHistory);

/**
 * PUBLIC - Lấy giá hiện tại + lịch sử
 * GET /pricing/:productId/with-history
 */
router.get('/:productId/with-history', PricingController.getHistoryWithCurrent);

/**
 * PROTECTED (Supplier) - Cấu hình Auto-Pricing Engine
 * PUT /pricing/:productId/config
 * Body: { autoPricingEnabled: bool, floorPrice: number }
 */
router.put('/:productId/config', authenticate, PricingController.updatePricingConfig);

/**
 * ADMIN ONLY - Chạy pricing engine ngay cho sản phẩm (test)
 * POST /pricing/:productId/apply-engine
 */
router.post('/:productId/apply-engine', authenticate, PricingController.applyPricingEngine);

/**
 * ADMIN ONLY - Chạy pricing engine cho tất cả sản phẩm
 * POST /pricing/run-all-engines
 */
router.post('/run-all-engines', authenticate, PricingController.runAllPricingEngines);

export default router;
