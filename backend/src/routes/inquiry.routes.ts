import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus } from '../controllers/inquiry.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, createInquiry);
router.get('/', requireAuth, getInquiries);
router.patch('/:id/status', requireAuth, updateInquiryStatus);

export default router;
