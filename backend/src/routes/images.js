import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import ImageUploadController from '../controllers/imageUploadController.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP'));
    }
  }
});

// ======== IMAGE UPLOAD ROUTES ========

/**
 * POST /api/images/:productId/upload
 * Upload up to 4 images for a product
 */
router.post('/:productId/upload', authenticate, upload.array('images', 4), ImageUploadController.uploadProductImages);

/**
 * GET /api/images/:productId
 * Get all images for a product
 */
router.get('/:productId', ImageUploadController.getProductImages);

/**
 * DELETE /api/images/:productId/:imageId
 * Delete a specific image
 */
router.delete('/:productId/:imageId', authenticate, ImageUploadController.deleteProductImage);

export default router;
