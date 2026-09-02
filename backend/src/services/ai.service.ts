// @ts-ignore
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { ImageService } from './image.service.js';

export interface CatalogueAIInput {
  transcript?: string;
  language?: 'gu' | 'hi' | 'en';
  originalImage?: string;
  craftType?: string;
}

export interface CatalogueAIOutput {
  title: string;
  titleGujarati: string;
  titleHindi: string;
  category: string;
  material: string;
  craftType: string;
  origin: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionGu: string;
}

export class AIService {
  /**
   * Log AI requests into ai_activity table for admin analytics
   */
  static async logActivity(
    userId: string | null,
    feature: 'image_enhancement' | 'catalogue' | 'pricing' | 'chat' | 'speech',
    status: 'success' | 'failed' = 'success',
    processingTimeMs: number = 1200
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
        `INSERT INTO ai_activity (id, user_id, feature, status, processing_time_ms, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
        [id, validUserId, feature, status, processingTimeMs]
      );
    } catch (err) {
      console.warn('Failed to log AI activity:', err);
    }
  }

  /**
   * Image studio enhancement abstraction
   */
  static async enhanceImage(imageUrl: string, userId: string | null) {
    return ImageService.enhanceProductImage({ imageUrl }, userId);
  }

  /**
   * Generates multi-lingual catalogue from voice transcript using Gemini AI
   */
  static async generateCatalogue(input: CatalogueAIInput, userId: string | null): Promise<CatalogueAIOutput> {
    const startTime = Date.now();
    const modelName = ENV.GEMINI_MODEL;

    if (!ENV.GEMINI_API_KEY) {
      console.error('❌ Gemini Catalogue Error: GEMINI_API_KEY is not configured in environment variables.');
      await this.logActivity(userId, 'catalogue', 'failed', Date.now() - startTime);
      throw new Error('Gemini API key or model configuration is missing. Please configure GEMINI_API_KEY in .env.');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      
      const promptText = `You are CraftConnect AI, an expert digital cataloguer for rural Indian artisans.
Inspect the attached product photo carefully (if provided) and read the artisan's spoken story/input.
Create an accurate, high-quality, multilingual product catalogue tailored to the EXACT item shown in the image and described in the story.

Artisan Input Details:
- Spoken Story / Details: "${input.transcript || 'Handcrafted Indian Artisan Item'}"
- Primary Language: "${input.language || 'gu'}"
- Craft Specialty: "${input.craftType || 'Traditional Craft'}"

Guidelines:
1. EXAMINE THE ATTACHED PRODUCT PHOTO CAREFULLY. If the photo shows dishes/pottery/ceramics, classify as "Pottery" and title appropriately (e.g. "Hand-painted Blue Pottery Plates Set"). If it shows a saree/fabric, classify as "Textiles". If woodcraft, classify as "Woodcraft", etc.
2. Assign the category to EXACTLY ONE of: "Textiles", "Pottery", "Woodcraft", "Jewellery", "Handicrafts", "Art", "Home Decor".
3. Provide titles and descriptions in:
   - English ("title", "descriptionEn")
   - Gujarati ("titleGujarati", "descriptionGu") in authentic Gujarati script
   - Hindi ("titleHindi", "descriptionHi") in Devanagari script
4. Provide material, craftType, and origin based on visual image details and transcript.

Respond with ONLY a raw JSON object with these exact keys:
{
  "title": "string (English title)",
  "titleGujarati": "string (Gujarati title in Gujarati script)",
  "titleHindi": "string (Hindi title in Devanagari script)",
  "category": "Textiles" | "Pottery" | "Woodcraft" | "Jewellery" | "Handicrafts" | "Art" | "Home Decor",
  "material": "string",
  "craftType": "string",
  "origin": "string",
  "descriptionEn": "string",
  "descriptionHi": "string",
  "descriptionGu": "string"
}`;

      const contentsParts: any[] = [];
      if (input.originalImage && typeof input.originalImage === 'string' && input.originalImage.startsWith('data:image')) {
        const matches = input.originalImage.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          contentsParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
      contentsParts.push(promptText);

      const candidateModels = [ENV.GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
      let response: any = null;
      let lastErr: any = null;

      for (const mName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: mName,
            contents: contentsParts.length > 1 ? contentsParts : promptText,
            config: {
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) break;
        } catch (e: any) {
          lastErr = e;
          console.warn(`[Gemini AI] Model ${mName} call failed, trying next candidate:`, e.message || e);
        }
      }

      if (!response || !response.text) {
        throw new Error(lastErr?.message || 'Gemini API models call failed.');
      }

      const rawText = response.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini API response did not contain a valid JSON object structure.');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      const requiredFields: (keyof CatalogueAIOutput)[] = [
        'title', 'titleGujarati', 'titleHindi', 'category',
        'material', 'craftType', 'origin',
        'descriptionEn', 'descriptionHi', 'descriptionGu'
      ];

      for (const field of requiredFields) {
        if (!parsed[field] || typeof parsed[field] !== 'string') {
          throw new Error(`JSON validation failed: missing or invalid required field '${field}'`);
        }
      }

      const output: CatalogueAIOutput = {
        title: parsed.title,
        titleGujarati: parsed.titleGujarati,
        titleHindi: parsed.titleHindi,
        category: parsed.category,
        material: parsed.material,
        craftType: parsed.craftType,
        origin: parsed.origin,
        descriptionEn: parsed.descriptionEn,
        descriptionHi: parsed.descriptionHi,
        descriptionGu: parsed.descriptionGu,
      };

      await this.logActivity(userId, 'catalogue', 'success', Date.now() - startTime);
      return output;
    } catch (err: any) {
      console.error('❌ Gemini Catalogue Generation Failed:', err.message || err);
      await this.logActivity(userId, 'catalogue', 'failed', Date.now() - startTime);
      throw new Error(err.message || 'Failed to generate catalogue with Gemini AI.');
    }
  }

  /**
   * CraftMate Floating AI Assistant chatbot response using Gemini AI
   */
  static async handleCraftMateChat(prompt: string, userId: string | null): Promise<string> {
    const startTime = Date.now();
    const modelName = ENV.GEMINI_MODEL;

    if (ENV.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `You are CraftMate 🤖, an AI assistant for CraftConnect AI—an e-commerce platform helping Indian rural artisans bring their crafts online and connect with buyers.
Artisan/User question: "${prompt}".

Provide a friendly, helpful, short response (2-3 sentences max) answering their query in clear language. You may include Gujarati or Hindi words naturally.`,
        });

        if (response.text) {
          await this.logActivity(userId, 'chat', 'success', Date.now() - startTime);
          return response.text.trim();
        }
      } catch (err: any) {
        console.error('❌ Gemini Chat Error, falling back to rule-based response:', err.message || err);
        await this.logActivity(userId, 'chat', 'failed', Date.now() - startTime);
      }
    } else {
      await this.logActivity(userId, 'chat', 'failed', Date.now() - startTime);
    }

    const lower = prompt.toLowerCase();
    let reply = 'Namaste! I am CraftMate 🤖. I am here to assist you with describing your products, setting fair prices, translating descriptions into Gujarati, Hindi, or English, and finding buyers across India!';

    if (lower.includes('price') || lower.includes('cost') || lower.includes('ભાવ')) {
      reply = 'To set a fair price, list your raw material cost, labor hours, and packaging expenses. Our AI Pricing Assistant will calculate fair market ranges and recommended prices!';
    } else if (lower.includes('photo') || lower.includes('image') || lower.includes('ફોટો')) {
      reply = 'Use clear, bright lighting for your product photos! You can tap "Improve Photo with AI" in the Add Product wizard to automatically clean the background and enhance colors.';
    } else if (lower.includes('buyer') || lower.includes('sell') || lower.includes('વેચાણ')) {
      reply = 'Buyers on CraftConnect can view your products in the Marketplace or send direct Bulk Order Inquiries. Keep your stock and details updated to receive more inquiries!';
    }

    return reply;
  }
}
