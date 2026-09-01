import { Router } from 'express';
import { enhanceProductImage, generateCatalogue, craftMateChat } from '../controllers/ai.controller.js';

const router = Router();

router.post('/image-enhance', enhanceProductImage);
router.post('/catalog', generateCatalogue);
router.post('/chat', craftMateChat);

export default router;
