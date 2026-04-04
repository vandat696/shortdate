import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);

// Protected routes (cần token)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/supplier-profile', authMiddleware, authController.updateSupplierProfile);

// Location routes (cần token)
router.put('/location', authMiddleware, authController.updateUserLocation);
router.get('/location', authMiddleware, authController.getUserLocation);
router.put('/supplier-location', authMiddleware, authController.updateSupplierLocation);
router.get('/supplier-location', authMiddleware, authController.getSupplierLocation);

export default router;
