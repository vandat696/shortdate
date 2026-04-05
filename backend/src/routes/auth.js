import express from 'express';
import multer from 'multer';
import * as authController from '../controllers/authController.js';
import AvatarUploadController from '../controllers/avatarUploadController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Configure multer for avatar upload
const upload = multer({
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

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);

// Protected routes (cần token)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/supplier-profile', authMiddleware, authController.updateSupplierProfile);

// Avatar routes (cần token)
router.post('/avatar/upload', authMiddleware, upload.single('avatar'), AvatarUploadController.uploadAvatar);
router.delete('/avatar', authMiddleware, AvatarUploadController.deleteAvatar);

// Location routes (cần token)
router.put('/location', authMiddleware, authController.updateUserLocation);
router.get('/location', authMiddleware, authController.getUserLocation);
router.put('/supplier-location', authMiddleware, authController.updateSupplierLocation);
router.get('/supplier-location', authMiddleware, authController.getSupplierLocation);

export default router;
