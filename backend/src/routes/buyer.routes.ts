import { Router } from 'express';
import { getMyBuyerProfile, updateMyBuyerProfile } from '../controllers/buyer.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile/me', requireAuth, getMyBuyerProfile);
router.put('/profile/me', requireAuth, updateMyBuyerProfile);

export default router;
