import express from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getProductCategories 
} from '../controllers/categoryController.js';
import auth from '../middleware/auth.js';
import authOptional from '../middleware/auth-optional.js';

const router = express.Router();

// Public routes
router.get('/', authOptional, getCategories); // Lấy tất cả categories

// Protected routes (Admin)
router.post('/', auth, createCategory); // Thêm category
router.put('/:id', auth, updateCategory); // Cập nhật category
router.delete('/:id', auth, deleteCategory); // Xóa category

// Lấy categories của một sản phẩm
router.get('/product/:productId', getProductCategories);

export default router;
