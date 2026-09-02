// @ts-ignore
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';

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
    processingTimeMs: number
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
   * Enhance product image using native Gemini AI image model
   */
  static async enhanceProductImage(input: ImageEnhanceInput, userId: string | null): Promise<ImageEnhanceOutput> {
    const startTime = Date.now();
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // 1. Input Validation
    let mimeType = input.file?.mimetype || '';
    let fileSize = input.file?.size || 0;
    let originalUrl = input.imageUrl || '';

    if (input.file) {
      if (fileSize > MAX_SIZE) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const err: any = new Error('Image file size exceeds maximum limit of 10 MB.');
        err.statusCode = 413;
        throw err;
      }

      if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const err: any = new Error('Invalid image format. Allowed formats: JPEG, PNG, WEBP.');
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
            const err: any = new Error('Invalid image format. Allowed formats: JPEG, PNG, WEBP.');
            err.statusCode = 400;
            throw err;
          }
          mimeType = detectedMime;
        }
      }
    } else {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const err: any = new Error('No image file or image URL provided.');
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

    if (!base64Data) {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const err: any = new Error('Unable to extract valid image data for AI processing.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Gemini API Client Initialization
    if (!ENV.GEMINI_API_KEY) {
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const err: any = new Error('GEMINI_API_KEY is not configured in .env.');
      err.statusCode = 500;
      throw err;
    }

    const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    const primaryModel = ENV.GEMINI_MODEL || 'gemini-3.6-flash';
    const imageModel = ENV.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

    const enhancementPrompt = `Enhance this craft product photograph for a premium e-commerce marketplace. Clean up background clutter, balance natural studio lighting, sharpen intricate artisan craft details, and format cleanly. Preserve the original product appearance exactly without changing the product design, shape, or colors.`;

    try {
      // Call Gemini model for image editing
      let response: any = null;
      try {
        response = await ai.models.generateContent({
          model: primaryModel,
          contents: [
            enhancementPrompt,
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        });
      } catch (primaryErr: any) {
        console.warn(`⚠️  Gemini model '${primaryModel}' notice: ${primaryErr.message}. Trying '${imageModel}'...`);
        response = await ai.models.generateContent({
          model: imageModel,
          contents: [
            enhancementPrompt,
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        });
      }

      // 4. Extract Enhanced Image Result from Gemini Response
      let enhancedImageUrl = '';

      if (response && response.candidates && response.candidates[0]?.content?.parts) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const outMime = part.inlineData.mimeType || 'image/png';
            enhancedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text && (part.text.includes('data:image/') || part.text.includes('http'))) {
            const dataUriMatch = part.text.match(/data:image\/[a-zA-Z0-9\+\-]+;base64,[A-Za-z0-9+/=]+/);
            if (dataUriMatch) {
              enhancedImageUrl = dataUriMatch[0];
              break;
            }
            const httpMatch = part.text.match(/https?:\/\/[^\s"]+\.(png|jpg|jpeg|webp)/i);
            if (httpMatch) {
              enhancedImageUrl = httpMatch[0];
              break;
            }
          }
        }
      }

      // If Gemini did not return an enhanced image, fail rather than return faked data
      if (!enhancedImageUrl) {
        await this.logActivity(userId, 'failed', Date.now() - startTime);
        const noImgErr: any = new Error('Gemini AI image model did not return a generated enhanced image.');
        noImgErr.statusCode = 500;
        throw noImgErr;
      }

      // Update database if productId was provided
      if (input.productId) {
        await db.execute(
          `UPDATE products SET enhanced_image_url = ?, updated_at = NOW() WHERE id = ?`,
          [enhancedImageUrl, input.productId]
        );
      }

      await this.logActivity(userId, 'success', Date.now() - startTime);

      return {
        originalImageUrl: originalUrl,
        enhancedImageUrl: enhancedImageUrl,
        status: 'completed',
      };
    } catch (err: any) {
      console.error('❌ Gemini Image AI Error:', err.message || err);
      await this.logActivity(userId, 'failed', Date.now() - startTime);
      const error: any = new Error(err.message || 'Gemini AI image enhancement failed.');
      error.statusCode = err.statusCode || 500;
      throw error;
    }
  }
}
