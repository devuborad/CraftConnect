import { Router } from 'express';
import { getArtisanById, getArtisanProducts, getMyArtisanProfile, updateMyArtisanProfile } from '../controllers/artisan.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile/me', requireAuth, getMyArtisanProfile);
router.put('/profile/me', requireAuth, updateMyArtisanProfile);
router.get('/:id', getArtisanById);
router.get('/:id/products', getArtisanProducts);

export default router;
