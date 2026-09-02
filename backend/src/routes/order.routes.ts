import { Router } from 'express';
import { createOrder, buyNowOrder, getOrders, getOrderById } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getOrders);
router.get('/:id', requireAuth, getOrderById);
router.post('/', requireAuth, createOrder);
router.post('/buy-now', requireAuth, buyNowOrder);

export default router;
