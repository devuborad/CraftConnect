import { Request, Response } from 'express';
import { PricingService } from '../services/pricing.service.js';
import { AIService } from '../services/ai.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const recommendPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rawMaterialCost = 0, labourCost = 0, packagingCost = 0, otherCost = 0, craftType = 'Handwoven', category = 'Textiles' } = req.body;

    const costs = {
      rawMaterialCost: Number(rawMaterialCost),
      labourCost: Number(labourCost),
      packagingCost: Number(packagingCost),
      otherCost: Number(otherCost),
    };

    const recommendation = PricingService.generatePriceRecommendation(costs, craftType, category);

    // Log AI activity
    await AIService.logActivity(req.user?.id || null, 'pricing', 'success', 950);

    res.json({
      success: true,
      message: 'AI Price recommendation calculated',
      data: recommendation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to calculate pricing recommendation' });
  }
};
