import { Router } from 'express';
import {
  createInquiry,
  getBuyerInquiries,
  getArtisanInquiries,
  getInquiryById,
  updateInquiryStatus,
  restoreInquiry,
  deleteInquiry,
  getInquiryAnalytics
} from '../controllers/inquiry.controller.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Analytics
router.get('/analytics', optionalAuth, getInquiryAnalytics);

// Create new bulk inquiry or direct order
router.post('/', optionalAuth, createInquiry);

// Get inquiries by participant
router.get('/my', requireAuth, getBuyerInquiries);
router.get('/artisan', requireAuth, requireRole('artisan', 'admin'), getArtisanInquiries);

// Get single inquiry detail (participant security check)
router.get('/:id', requireAuth, getInquiryById);

// Update inquiry status
router.put('/:id/status', optionalAuth, updateInquiryStatus);
router.patch('/:id/status', optionalAuth, updateInquiryStatus);

// Restore & Delete
router.post('/:id/restore', optionalAuth, restoreInquiry);
router.delete('/:id', optionalAuth, deleteInquiry);

// General list fallback
router.get('/', optionalAuth, (req: AuthRequest, res) => {
  if (req.user?.role === 'artisan') {
    getArtisanInquiries(req, res);
  } else {
    getBuyerInquiries(req, res);
  }
});

export default router;
