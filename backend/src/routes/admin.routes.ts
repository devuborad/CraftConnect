import { Router } from 'express';
import {
  getDashboardStats,
  getAdminArtisans,
  getAdminBuyers,
  getAdminProducts,
  moderateProductStatus,
  getAdminAIActivity,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/artisans', getAdminArtisans);
router.get('/buyers', getAdminBuyers);
router.get('/products', getAdminProducts);
router.patch('/products/:id/status', moderateProductStatus);
router.get('/ai-activity', getAdminAIActivity);

export default router;
