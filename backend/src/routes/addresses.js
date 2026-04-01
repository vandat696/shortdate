import express from 'express';
import authenticate from '../middleware/auth.js';
import * as addressController from '../controllers/addressController.js';

const router = express.Router();

// Delivery methods route (public, no authentication required)
router.get('/methods/all', addressController.getDeliveryMethods);

// All other routes require authentication
router.use(authenticate);

// Address routes
router.get('/', addressController.getAddresses);
router.get('/default', addressController.getDefaultAddress);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;
