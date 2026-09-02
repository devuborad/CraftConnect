import { Router } from 'express';
import {
  getAdminOverview,
  getAdminArtisans,
  getAdminArtisanById,
  getAdminBuyers,
  getAdminProducts,
  moderateProductStatus,
  getAdminOrders,
  getAdminInquiries,
  getAdminAIActivity,
  getAdminAIStats,
  getAdminPricingAnalytics,
  getPlatformAnalytics,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Enforce Admin Authentication & Role Authorization across all endpoints
router.use(requireAuth, requireRole('admin'));

// Platform Overview & Analytics
router.get('/overview', getAdminOverview);
router.get('/dashboard', getAdminOverview);
router.get('/analytics', getPlatformAnalytics);

// Artisan & Buyer Management
router.get('/artisans', getAdminArtisans);
router.get('/artisans/:id', getAdminArtisanById);
router.get('/buyers', getAdminBuyers);

// Product Moderation
router.get('/products', getAdminProducts);
router.patch('/products/:id/status', moderateProductStatus);
router.put('/products/:id/status', moderateProductStatus);

// Order & Inquiry Monitoring
router.get('/orders', getAdminOrders);
router.get('/inquiries', getAdminInquiries);

// AI & Pricing Activity Analytics
router.get('/ai-activity', getAdminAIActivity);
router.get('/ai-stats', getAdminAIStats);
router.get('/pricing-analytics', getAdminPricingAnalytics);

export default router;
