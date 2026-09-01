import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireRole('admin'), createCategory);

export default router;
