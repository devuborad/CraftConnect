import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getCart);
router.post('/items', requireAuth, addToCart);
router.put('/items/:productId', requireAuth, updateCartItem);
router.delete('/items/:productId', requireAuth, removeCartItem);
router.delete('/', requireAuth, clearCart);

export default router;
