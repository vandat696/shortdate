import express from 'express';
import { authenticate } from '../middleware/auth.js';
import authenticateOptional from '../middleware/auth-optional.js';
import PricingPackageController from '../controllers/pricingPackageController.js';

const router = express.Router();

/**
 * PUBLIC - Lấy danh sách tất cả gói giá (có filter)
 * GET /api/pricing-packages?supplier_id=1&search=Mini
 */
router.get('/', authenticateOptional, PricingPackageController.getAllPackages);

/**
 * PUBLIC - Lấy chi tiết gói giá (kèm sản phẩm bên trong)
 * GET /api/pricing-packages/:id
 */
router.get('/:id', PricingPackageController.getPackageDetail);

/**
 * PROTECTED (Supplier) - Lấy tất cả gói của supplier (chính họ)
 * GET /api/pricing-packages/supplier/:supplierId
 */
router.get('/supplier/:supplierId', authenticate, PricingPackageController.getSupplierPackages);

/**
 * PROTECTED (Supplier) - Tạo gói giá mới
 * POST /api/pricing-packages
 * Body: { package_name, description, package_price, display_image, display_order }
 */
router.post('/', authenticate, PricingPackageController.createPackage);

/**
 * PROTECTED (Supplier) - Cập nhật gói giá
 * PUT /api/pricing-packages/:id
 * Body: { package_name, description, package_price, display_image, display_order, is_active }
 */
router.put('/:id', authenticate, PricingPackageController.updatePackage);

/**
 * PROTECTED (Supplier) - Xóa gói giá
 * DELETE /api/pricing-packages/:id
 */
router.delete('/:id', authenticate, PricingPackageController.deletePackage);

/**
 * PROTECTED (Supplier) - Thêm sản phẩm vào gói
 * POST /api/pricing-packages/:packageId/items
 * Body: { product_id, quantity }
 */
router.post('/:packageId/items', authenticate, PricingPackageController.addItemToPackage);

/**
 * PROTECTED (Supplier) - Xóa sản phẩm khỏi gói
 * DELETE /api/pricing-packages/:packageId/items/:productId
 */
router.delete('/:packageId/items/:productId', authenticate, PricingPackageController.removeItemFromPackage);

/**
 * PROTECTED (Supplier) - Cập nhật số lượng sản phẩm trong gói
 * PUT /api/pricing-packages/:packageId/items/:productId
 * Body: { quantity }
 */
router.put('/:packageId/items/:productId', authenticate, PricingPackageController.updateItemQuantity);

export default router;
