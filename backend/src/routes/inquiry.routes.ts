import { Router } from 'express';
import {
  createInquiry,
  getBuyerInquiries,
  getArtisanInquiries,
  getInquiryById,
  updateInquiryStatus,
} from '../controllers/inquiry.controller.js';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Create new bulk inquiry
router.post('/', requireAuth, createInquiry);

// Get inquiries by participant
router.get('/my', requireAuth, getBuyerInquiries);
router.get('/artisan', requireAuth, requireRole('artisan', 'admin'), getArtisanInquiries);

// Get single inquiry detail (participant security check)
router.get('/:id', requireAuth, getInquiryById);

// Update inquiry status (artisan/admin only)
router.put('/:id/status', requireAuth, requireRole('artisan', 'admin'), updateInquiryStatus);
router.patch('/:id/status', requireAuth, requireRole('artisan', 'admin'), updateInquiryStatus);

// General list fallback
router.get('/', requireAuth, (req: AuthRequest, res) => {
  if (req.user?.role === 'artisan') {
    getArtisanInquiries(req, res);
  } else {
    getBuyerInquiries(req, res);
  }
});

export default router;
