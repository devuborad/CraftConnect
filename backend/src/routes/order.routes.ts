import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrders);

export default router;
