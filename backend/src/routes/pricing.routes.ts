import { Router } from 'express';
import { recommendPricing } from '../controllers/pricing.controller.js';

const router = Router();

router.post('/recommend', recommendPricing);

export default router;
