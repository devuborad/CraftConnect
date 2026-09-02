import { Router } from 'express';
import { analyzePricing } from '../controllers/pricing.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Preferred endpoint & alias for frontend compatibility
router.post('/analyze', requireAuth, analyzePricing);
router.post('/recommend', requireAuth, analyzePricing);

export default router;
