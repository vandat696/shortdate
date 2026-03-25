import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createProduct,
  getProduct,
  getSupplierProducts,
  getAllProducts,
  updateProduct,
  updateInventory,
  deleteProduct,
  getCategories,
  getExpiringProducts,
  getLowStockProducts
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/all', getAllProducts); // Lấy danh sách sản phẩm (cho Buyer - tìm kiếm & lọc)
router.get('/categories', getCategories); // Lấy danh sách danh mục

// Protected routes - specific supplier routes MUST come before /:id catch-all
router.get('/supplier/list', authenticateToken, getSupplierProducts); // Danh sách sản phẩm của Supplier
router.get('/supplier/alerts/expiring', authenticateToken, getExpiringProducts); // Sản phẩm sắp hết hạn
router.get('/supplier/alerts/low-stock', authenticateToken, getLowStockProducts); // Sản phẩm tồn kho thấp

// Protected routes (cần đăng nhập)
router.post('/', authenticateToken, createProduct); // Thêm sản phẩm mới (Supplier)
router.get('/:id', getProduct); // Lấy chi tiết sản phẩm (Public)
router.put('/:id', authenticateToken, updateProduct); // Cập nhật sản phẩm
router.patch('/:id/inventory', authenticateToken, updateInventory); // Cập nhật tồn kho
router.delete('/:id', authenticateToken, deleteProduct); // Xóa sản phẩm

export default router;
