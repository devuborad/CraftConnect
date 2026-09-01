import { Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const enhanceProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;
    const result = await AIService.enhanceImage(imageUrl, req.user?.id || null);
    res.json({
      success: true,
      message: 'Image enhanced successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to enhance image' });
  }
};

export const generateCatalogue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transcript, language, originalImage, craftType } = req.body;
    const result = await AIService.generateCatalogue({ transcript, language, originalImage, craftType }, req.user?.id || null);

    res.json({
      success: true,
      message: 'AI Catalogue generated successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate catalogue' });
  }
};

export const craftMateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: 'Message prompt is required' });
      return;
    }

    const reply = await AIService.handleCraftMateChat(message, req.user?.id || null);
    res.json({
      success: true,
      data: {
        reply,
        assistant: 'CraftMate 🤖',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to process assistant request' });
  }
};
