import { Router } from 'express';
import {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  saveProductDraft,
  updateProduct,
  publishProduct,
  archiveProduct,
  deleteProduct,
  incrementProductView,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Public / Filtered product retrieval
router.get('/', getProducts);

// Authenticated artisan's products
router.get('/my-products', requireAuth, requireRole('artisan', 'admin'), getMyProducts);

// Individual product detail
router.get('/:id', getProductById);

// Product Lifecycle CRUD
router.post('/', requireAuth, requireRole('artisan', 'admin'), createProduct);
router.post('/draft', requireAuth, requireRole('artisan', 'admin'), saveProductDraft);
router.put('/:id', requireAuth, requireRole('artisan', 'admin'), updateProduct);
router.post('/:id/publish', requireAuth, requireRole('artisan', 'admin'), publishProduct);
router.post('/:id/archive', requireAuth, requireRole('artisan', 'admin'), archiveProduct);
router.delete('/:id', requireAuth, requireRole('artisan', 'admin'), deleteProduct);
router.post('/:id/view', incrementProductView);

export default router;
