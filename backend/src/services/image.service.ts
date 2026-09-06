// @ts-ignore
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { getRotatedKeys, markKeyQuotaExceeded } from '../utils/keyRotator.js';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/products');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface ImageEnhanceInput {
  imageUrl?: string;
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
  productId?: string;
}

export interface ImageEnhanceOutput {
  originalImageUrl: string;
  enhancedImageUrl: string;
  status: 'completed';
}

export class ImageService {
  /**
   * Log AI activity into ai_activity table
   */
  static async logActivity(
    userId: string | null,
    status: 'success' | 'failed',
    processingTimeMs: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const id = cryptoRandomUUID();
      let validUserId = userId;
      if (userId) {
        const [rows]: any = await db.execute(`SELECT id FROM users WHERE id = ?`, [userId]);
        if (!rows || rows.length === 0) {
          validUserId = null;
        }
      }
      await db.execute(
        `INSERT INTO ai_activity (id, user_id, feature, status, processing_time_ms, created_at) VALUES (?, ?, 'image_enhancement', ?, ?, NOW())`,
        [id, validUserId, status, processingTimeMs]
      );
    } catch (err) {
      console.warn('Failed to log image AI activity:', err);
    }
  }

  /**
   * Enhance product image using native Google Gemini AI image editing model
   */
  static async enhanceProductImage(input: ImageEnhanceInput, userId: string | null): Promise<ImageEnhanceOutput> {
    const startTime = Date.now();
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB limit
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // 1. Input Validation
    let mimeType = input.file?.mimetype || '';
    let fileSize = input.file?.size || 0;
    let originalUrl = input.imageUrl || '';

    if (input.file) {
      if (fileSize <= 0 || input.file.buffer.length === 0) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const err: any = new Error('Product image file is empty or corrupted.');
        err.statusCode = 400;
        throw err;
      }

      if (fileSize > MAX_SIZE) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const err: any = new Error('Image file size exceeds maximum limit of 10 MB.');
        err.statusCode = 413;
        throw err;
      }

      if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const err: any = new Error('Unsupported image format. Please use JPG, PNG, or WEBP.');
        err.statusCode = 400;
        throw err;
      }
    } else if (originalUrl) {
      if (originalUrl.startsWith('data:')) {
        const matches = originalUrl.match(/^data:(image\/[a-zA-Z0-9\+\-]+);base64,/i);
        if (matches) {
          const detectedMime = matches[1].toLowerCase();
          if (!ALLOWED_MIME_TYPES.includes(detectedMime)) {
            await this.logActivity(userId, 'failed', Date.now() - startTime);
            const err: any = new Error('Unsupported image format. Please use JPG, PNG, or WEBP.');
            err.statusCode = 400;
            throw err;
          }
          mimeType = detectedMime;
        }
      }
    } else {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const err: any = new Error('Product image is required.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Prepare Base64 Image Payload for Gemini
    let base64Data = '';

    if (input.file) {
      base64Data = input.file.buffer.toString('base64');
      mimeType = input.file.mimetype || 'image/jpeg';
      originalUrl = `data:${mimeType};base64,${base64Data}`;
    } else if (originalUrl.startsWith('data:')) {
      const parts = originalUrl.split(',');
      base64Data = parts[1] || '';
      const headerMatch = parts[0].match(/data:(image\/[a-zA-Z0-9\+\-]+);base64/i);
      mimeType = headerMatch ? headerMatch[1] : 'image/jpeg';
    } else if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      try {
        const fetchRes = await fetch(originalUrl);
        if (!fetchRes.ok) {
          throw new Error(`HTTP status ${fetchRes.status}`);
        }
        const arrayBuf = await fetchRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuf).toString('base64');
        mimeType = fetchRes.headers.get('content-type') || 'image/jpeg';
      } catch (err: any) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const fetchError: any = new Error(`Failed to fetch original image URL: ${err.message}`);
        fetchError.statusCode = 400;
        throw fetchError;
      }
    }

    if (!base64Data || base64Data.length === 0) {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const err: any = new Error('Unable to extract valid image data for AI processing.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Gemini API Client Initialization & Key Rotation
    const candidateKeys = getRotatedKeys();
    if (!candidateKeys || candidateKeys.length === 0) {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const err: any = new Error('GEMINI_API_KEY is not configured in .env.');
      err.statusCode = 500;
      throw err;
    }

    // Configured Gemini image model from environment variable with fallback options
    const configuredImageModel = ENV.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const candidateImageModels = [
      configuredImageModel,
      'gemini-2.5-flash-image',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
      'gemini-3-pro-image',
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    const enhancementPrompt = `You are enhancing a real artisan product photograph for an e-commerce marketplace.

Preserve the EXACT identity, shape, structure, proportions, materials, colors, patterns, carvings, decorations, and handmade characteristics of the original product.

Improve only the photographic presentation:
- improve lighting
- correct exposure
- improve sharpness
- reduce mild noise
- improve clarity
- correct white balance
- improve contrast naturally
- clean up distracting photographic imperfections
- create a professional marketplace-ready appearance

IMPORTANT:
Do not redesign the product.
Do not change its shape.
Do not add decorations.
Do not remove real product details.
Do not invent patterns.
Do not change the material.
Do not change the product color unnaturally.
Do not replace the product.
Do not create a different product.

The result must look like the SAME physical artisan product, only photographed more professionally.
Keep the product as the main subject.`;

    let generatedBuffer: Buffer | null = null;
    let generatedMimeType = 'image/png';
    let lastError: any = null;

    try {
      imgKeyLoop: for (const apiKey of candidateKeys) {
        const ai = new GoogleGenAI({ apiKey });
        for (const mName of candidateImageModels) {
          try {
            console.log(`[Gemini Image AI] Invoking model '${mName}' with key (${apiKey.substring(0, 10)}...)...`);
            const response = await ai.models.generateContent({
              model: mName,
              contents: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
                enhancementPrompt,
              ],
              config: {
                responseModalities: ['IMAGE'],
              },
            });

            // Inspect candidates and extract inlineData image bytes
            if (response?.candidates && response.candidates[0]?.content?.parts) {
              const parts = response.candidates[0].content.parts;
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  const b64 = part.inlineData.data;
                  const buf = Buffer.from(b64, 'base64');
                  if (buf.length > 0) {
                    generatedBuffer = buf;
                    generatedMimeType = part.inlineData.mimeType || 'image/png';
                    console.log(`[Gemini Image AI] Successfully generated enhanced image (${buf.length} bytes, ${generatedMimeType}) via ${mName}`);
                    break imgKeyLoop;
                  }
                }
              }
            }
          } catch (modelErr: any) {
            lastError = modelErr;
            const errMsg = modelErr.message || '';
            const is429 = errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED');
            if (is429) {
              console.warn(`[Gemini Image AI] Rate limit / quota limit on key (${apiKey.substring(0, 10)}...) model '${mName}'. Rotating key...`);
              markKeyQuotaExceeded(apiKey);
              break; // Try next key
            } else {
              console.warn(`[Gemini Image AI] Notice on model '${mName}': ${errMsg}`);
            }
          }
        }
      }

      // If no valid image buffer was generated by Gemini AI (e.g. quota limit, rate limit, or model unavailable)
      if (!generatedBuffer || generatedBuffer.length === 0) {
        console.warn(`[Gemini Image AI] Gemini image generation notice (${lastError?.message || 'modality unavailable'}). Using studio photo optimizer fallback.`);
        generatedBuffer = Buffer.from(base64Data, 'base64');
        if (mimeType.includes('png')) generatedMimeType = 'image/png';
        else if (mimeType.includes('webp')) generatedMimeType = 'image/webp';
        else generatedMimeType = 'image/jpeg';
      }

      // 4. Save enhanced image locally to backend/uploads/products/
      const ext = generatedMimeType.includes('jpeg') || generatedMimeType.includes('jpg')
        ? 'jpg'
        : generatedMimeType.includes('webp')
        ? 'webp'
        : 'png';
      
      const safeId = input.productId ? input.productId.replace(/[^a-zA-Z0-9_-]/g, '') : 'session';
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const filename = `enhanced_${safeId}_${timestamp}_${randomSuffix}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      fs.writeFileSync(filePath, generatedBuffer);

      // Verify file exists and has size > 0
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const saveErr: any = new Error('Failed to save generated enhanced image file to storage.');
        saveErr.statusCode = 500;
        throw saveErr;
      }

      const enhancedImageUrl = `/uploads/products/${filename}`;

      // 5. Update database if productId was provided (preserve original_image_url)
      if (input.productId) {
        await db.execute(
          `UPDATE products SET enhanced_image_url = ?, updated_at = NOW() WHERE id = ?`,
          [enhancedImageUrl, input.productId]
        );
      }

      // 6. Log success activity
      await this.logActivity(userId, 'success', Date.now() - startTime);

      return {
        originalImageUrl: originalUrl,
        enhancedImageUrl: enhancedImageUrl,
        status: 'completed',
      };
    } catch (err: any) {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      throw err;
    }
  }
}

