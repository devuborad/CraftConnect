import { Router } from 'express';
import multer from 'multer';
import { enhanceProductImage, generateCatalogue, craftMateChat } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed formats: JPEG, PNG, WEBP.'));
    }
  },
});

const router = Router();

router.post(
  '/image-enhance',
  optionalAuth,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({ success: false, message: 'Image file size exceeds maximum limit of 10 MB.' });
          return;
        }
        res.status(400).json({ success: false, message: err.message || 'Invalid image upload payload.' });
        return;
      }
      next();
    });
  },
  enhanceProductImage
);

router.post('/catalog', generateCatalogue);
router.post('/chat', craftMateChat);

export default router;
