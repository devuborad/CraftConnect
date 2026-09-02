import { Response } from 'express';
import { PricingService } from '../services/pricing.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { db } from '../config/db.js';

export const analyzePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      productId,
      productName,
      category,
      craftType,
      material,
      origin,
      rawMaterialCost,
      labourCost,
      labor, // support alias from frontend
      packagingCost,
      packaging, // support alias from frontend
      otherCost,
      other, // support alias from frontend
      rawMaterial, // support alias from frontend
      quantity,
      description,
    } = req.body;

    const raw = Number(rawMaterialCost !== undefined ? rawMaterialCost : rawMaterial || 0);
    const lab = Number(labourCost !== undefined ? labourCost : labor || 0);
    const pkg = Number(packagingCost !== undefined ? packagingCost : packaging || 0);
    const oth = Number(otherCost !== undefined ? otherCost : other || 0);

    // 1. Validation: Costs must not be negative
    if (raw < 0 || lab < 0 || pkg < 0 || oth < 0) {
      res.status(400).json({
        success: false,
        message: 'Cost values cannot be negative.',
      });
      return;
    }

    // 2. Ownership & Product check if productId supplied
    if (productId) {
      const [rows]: any = await db.execute(`SELECT * FROM products WHERE id = ?`, [productId]);
      if (!rows || rows.length === 0) {
        res.status(404).json({
          success: false,
          message: `Product with ID '${productId}' not found.`,
        });
        return;
      }

      const product = rows[0];
      if (req.user?.role === 'artisan' && req.user.artisanId) {
        if (product.artisan_id !== req.user.artisanId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden. You do not have permission to analyze pricing for another artisan product.',
          });
          return;
        }
      }
    }

    const input = {
      productId,
      productName,
      category,
      craftType,
      material,
      origin,
      rawMaterialCost: raw,
      labourCost: lab,
      packagingCost: pkg,
      otherCost: oth,
      quantity: Number(quantity) || 1,
      description,
    };

    const analysis = await PricingService.analyzePricing(input, req.user?.id || null);

    res.json({
      success: true,
      message: 'AI pricing analysis completed',
      data: {
        ...analysis,
        // Include marketRange object for compatibility with frontend component
        marketRange: {
          min: analysis.marketMin,
          max: analysis.marketMax,
        },
      },
    });
  } catch (err: any) {
    console.error('❌ Pricing Analysis Controller Error:', err.message || err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to complete AI pricing analysis.',
    });
  }
};
