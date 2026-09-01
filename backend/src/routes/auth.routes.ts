import { Router } from 'express';
import { register, login, getMe, getUserById, getUsers, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.get('/users', requireAuth, getUsers);
router.get('/users/:id', getUserById);
router.post('/logout', logout);

export default router;
