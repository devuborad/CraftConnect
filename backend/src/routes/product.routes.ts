import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementProductView,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, requireRole('artisan', 'admin'), createProduct);
router.put('/:id', requireAuth, requireRole('artisan', 'admin'), updateProduct);
router.delete('/:id', requireAuth, requireRole('artisan', 'admin'), deleteProduct);
router.post('/:id/view', incrementProductView);

export default router;
