import { Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { ImageService } from '../services/image.service.js';
import { PricingService } from '../services/pricing.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const enhanceProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const imageUrl = req.body?.imageUrl || req.body?.image;
    const productId = req.body?.productId;
    const file = req.file;

    const result = await ImageService.enhanceProductImage(
      {
        imageUrl,
        file: file
          ? {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
            }
          : undefined,
        productId,
      },
      req.user?.id || null
    );

    res.json({
      success: true,
      message: 'Product image enhanced successfully',
      data: result,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Image AI enhancement failed',
    });
  }
};

export const generateCatalogue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const body = req.body || {};
    const { transcript, language, craftType } = body;
    const rawImage = body.image || body.originalImage;

    // Validate that an actual image is provided (via multipart file or base64/URL string)
    if (!file && !rawImage) {
      res.status(400).json({
        success: false,
        message: 'Product image is required for AI catalogue generation.',
      });
      return;
    }

    const cleanTranscript = (typeof transcript === 'string' && transcript.trim()) ? transcript.trim() : 'Not provided';

    const result = await AIService.generateCatalogue(
      {
        transcript: cleanTranscript,
        language: language || 'gu',
        craftType: craftType || undefined,
        originalImage: rawImage,
        file: file
          ? {
              buffer: file.buffer,
              mimetype: file.mimetype,
            }
          : undefined,
      },
      req.user?.id || null
    );

    res.json({
      success: true,
      message: 'AI Catalogue generated successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to generate catalogue with Gemini AI',
    });
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

export const generateDescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, material, craftType, origin, story } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'Product title is required' });
      return;
    }

    const result = await AIService.generateMultilingualDescriptions(
      { title, category, material, craftType, origin, story },
      req.user?.id || null
    );

    res.json({
      success: true,
      message: 'Multilingual descriptions generated successfully with Gemini AI',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate descriptions with Gemini AI',
    });
  }
};

export const generatePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      name,
      productName,
      titleGujarati,
      titleHindi,
      category,
      material,
      craftType,
      origin,
      descriptionEn,
      descriptionHi,
      descriptionGu,
      productionCost,
      rawMaterialCost,
      laborCost,
      packagingCost,
      otherCost,
      productSize,
      size,
      quantity,
      location,
      productId,
    } = req.body || {};

    const effectiveTitle = title || productName || name;
    if (!effectiveTitle && !category && !material && !craftType) {
      res.status(400).json({
        success: false,
        message: 'Product information (title, category, material, or craft type) is required for pricing analysis.',
      });
      return;
    }

    // Determine production cost if explicit or if breakdown provided
    let calcProdCost: number | undefined = undefined;
    if (productionCost !== undefined && productionCost !== null && !isNaN(Number(productionCost))) {
      calcProdCost = Number(productionCost);
    } else if (rawMaterialCost || laborCost || packagingCost || otherCost) {
      calcProdCost =
        (Number(rawMaterialCost) || 0) +
        (Number(laborCost) || 0) +
        (Number(packagingCost) || 0) +
        (Number(otherCost) || 0);
    }

    if (calcProdCost !== undefined && calcProdCost < 0) {
      res.status(400).json({
        success: false,
        message: 'Production cost cannot be negative.',
      });
      return;
    }

    const result = await PricingService.generateProductPricing(
      {
        title: effectiveTitle,
        titleGujarati,
        titleHindi,
        category,
        material,
        craftType,
        origin,
        descriptionEn,
        descriptionHi,
        descriptionGu,
        productionCost: calcProdCost,
        productSize: productSize || size,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        location,
        productId,
      },
      req.user?.id || null
    );

    res.json({
      success: true,
      message: 'Fair-trade product pricing generated successfully with Gemini AI',
      data: result,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to generate product pricing with Gemini AI',
    });
  }
};

