import { Router } from 'express';
import { 
  createInquiry, 
  getInquiries, 
  updateInquiryStatus, 
  restoreInquiry, 
  deleteInquiry 
} from '../controllers/inquiry.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Create inquiry or direct order (allows guest or logged-in buyer)
router.post('/', optionalAuth, createInquiry);

// Get inquiries and orders for authenticated user
router.get('/', optionalAuth, getInquiries);

// Update status (Accept, Counter, Dispatch, Complete)
router.patch('/:id/status', optionalAuth, updateInquiryStatus);

// Restore archived inquiry back to active inbox
router.post('/:id/restore', optionalAuth, restoreInquiry);

// Delete inquiry/history record
router.delete('/:id', optionalAuth, deleteInquiry);

export default router;
