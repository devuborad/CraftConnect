// @ts-ignore
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { ImageService } from './image.service.js';
import { getRotatedKeys, markKeyQuotaExceeded } from '../utils/keyRotator.js';

export function sanitizeCatalogueOutput(item: any): CatalogueAIOutput {
  const guRegex = /[\u0A80-\u0AFF]/g;
  const hiRegex = /[\u0900-\u097F]/g;
  const latinRegex = /[a-zA-Z]/;

  // 1. Clean English Title & Description (MUST contain valid Latin words and NO Gujarati or Devanagari characters)
  let rawTitleEn = (item.title || item.titleEn || '')
    .replace(guRegex, '')
    .replace(hiRegex, '')
    .replace(/[^\w\s\-\,\&\(\)\'\"]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!latinRegex.test(rawTitleEn) || rawTitleEn.length < 3) {
    rawTitleEn = item.title || 'Handcrafted Artisan Product';
  }

  let rawDescEn = (item.descriptionEn || '')
    .replace(guRegex, '')
    .replace(hiRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!latinRegex.test(rawDescEn) || rawDescEn.length < 5) {
    rawDescEn = item.descriptionEn || '';
  }

  // 2. Clean Hindi Title & Description (MUST contain valid Devanagari script and NO Gujarati characters)
  let rawTitleHi = (item.titleHindi || item.titleHi || '')
    .replace(guRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!hiRegex.test(rawTitleHi) || rawTitleHi.length < 2) {
    rawTitleHi = item.titleHindi || 'हस्तनिर्मित उत्पाद';
  }

  let rawDescHi = (item.descriptionHi || '')
    .replace(guRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!hiRegex.test(rawDescHi) || rawDescHi.length < 5) {
    rawDescHi = item.descriptionHi || '';
  }

  // 3. Clean Gujarati Title & Description (MUST contain valid Gujarati script and NO Devanagari characters)
  let rawTitleGu = (item.titleGujarati || item.titleGu || '')
    .replace(hiRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!guRegex.test(rawTitleGu) || rawTitleGu.length < 2) {
    rawTitleGu = item.titleGujarati || 'હસ્તનિર્મિત વસ્તુ';
  }

  let rawDescGu = (item.descriptionGu || '')
    .replace(hiRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!guRegex.test(rawDescGu) || rawDescGu.length < 5) {
    rawDescGu = item.descriptionGu || '';
  }

  return {
    title: rawTitleEn || item.title,
    titleGujarati: rawTitleGu || item.titleGujarati,
    titleHindi: rawTitleHi || item.titleHindi,
    category: item.category || 'Handicrafts',
    material: item.material || 'Not specified',
    craftType: item.craftType || 'Not specified',
    origin: item.origin || 'Not specified',
    descriptionEn: rawDescEn || item.descriptionEn || '',
    descriptionHi: rawDescHi || item.descriptionHi || '',
    descriptionGu: rawDescGu || item.descriptionGu || '',
  };
}

export interface CatalogueAIInput {
  transcript?: string;
  language?: 'gu' | 'hi' | 'en';
  originalImage?: string;
  craftType?: string;
  file?: {
    buffer: Buffer;
    mimetype: string;
  };
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
   * Generates multi-lingual catalogue from image & voice transcript using Gemini multimodal AI
   */
  static async generateCatalogue(input: CatalogueAIInput, userId: string | null): Promise<CatalogueAIOutput> {
    const startTime = Date.now();
    const candidateKeys = getRotatedKeys();
    const candidateModels = [
      'gemini-flash-latest',
      ENV.GEMINI_MODEL,
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-1.5-flash'
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    try {
      if (!candidateKeys || candidateKeys.length === 0) {
        console.warn('⚠️ Gemini Catalogue Warning: GEMINI_API_KEY is not configured in environment variables.');
        throw new Error('GEMINI_API_KEY not configured.');
      }

      // 1. Process and encode the uploaded image
      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (input.file && input.file.buffer) {
        base64Data = input.file.buffer.toString('base64');
        mimeType = input.file.mimetype || 'image/jpeg';
      } else if (input.originalImage && typeof input.originalImage === 'string') {
        if (input.originalImage.startsWith('data:image')) {
          const parts = input.originalImage.split(',');
          base64Data = parts[1] || '';
          const match = parts[0].match(/data:(image\/[a-zA-Z0-9\+\-]+);base64/i);
          if (match) mimeType = match[1];
        } else if (input.originalImage.startsWith('http://') || input.originalImage.startsWith('https://')) {
          try {
            const fetchRes = await fetch(input.originalImage, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const arrayBuf = await fetchRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuf).toString('base64');
            const contentHeader = fetchRes.headers.get('content-type');
            if (contentHeader) mimeType = contentHeader.split(';')[0].trim();
          } catch (e) {
            console.warn('[Gemini AI] Failed to fetch image URL for vision processing:', e);
          }
        }
      }

      if (!base64Data) {
        throw new Error('Product image is required for AI catalogue generation.');
      }

      const transcriptText = (input.transcript && input.transcript.trim()) ? input.transcript.trim() : 'Not provided';
      const lang = input.language || 'gu';
      const craft = input.craftType || 'Not specified';

      const promptText = `You are analyzing a product image uploaded by a rural Indian artisan.

Analyze the actual visible product first.
Use the artisan's spoken/typed story as additional context.
Do not invent facts that cannot reasonably be inferred from the image or story.
If exact origin is not known, return 'Not specified' rather than inventing a location.
If material is uncertain, return the most likely material only when visually reasonable; otherwise return 'Not specified'.
Identify the visible product as specifically as possible.
Generate a marketplace-ready catalogue.

Context provided:
- Spoken / Typed Story: "${transcriptText}"
- Artisan Preferred Language: "${lang}"
- Craft Specialty / Type (if selected): "${craft}"

Reasoning order:
1. What is visibly present in the image?
2. What product type does the image indicate? (e.g., clay pot / kalash / matka, saree, wooden figurine, jewellery, terracotta vase, etc.)
3. What material can reasonably be identified?
4. What craft technique can reasonably be identified?
5. Use artisan transcript to add context.
6. Use transcript for origin/location if provided.
7. Never invent exact location from appearance alone.

Strict Language Isolation & Formatting Rules:
- "title" must be in 100% English (Latin script).
- "titleHindi" must be in 100% Hindi (Devanagari script).
- "titleGujarati" must be in 100% Gujarati (Gujarati script).
- "category" must be assigned to EXACTLY ONE of: "Textiles", "Pottery", "Woodcraft", "Jewellery", "Handicrafts", "Art", "Home Decor".
- "material": most likely visible material or from story; if uncertain, return "Not specified".
- "craftType": visible craft technique or from story; if uncertain, return "Not specified".
- "origin": if stated in artisan story, use that; otherwise return "Not specified".
- "descriptionEn": 2-3 sentences in 100% pure English describing the visible product and artisan heritage.
- "descriptionHi": 2-3 sentences in 100% pure Hindi (Devanagari script) describing the same product.
- "descriptionGu": 2-3 sentences in 100% pure Gujarati (Gujarati script) describing the same product.
- The three descriptions must be translations/appropriate localized versions of the SAME product information. Do not merge languages into one description.

Do NOT generate generic text like "Authentic Handcrafted Artisan Heritage Item" unless the image genuinely cannot be identified.
Do NOT output markdown (no \`\`\`json code blocks).
Do NOT return explanatory text outside JSON.

Return ONLY a valid raw JSON object with exactly these fields:
{
  "title": "",
  "titleGujarati": "",
  "titleHindi": "",
  "category": "",
  "material": "",
  "craftType": "",
  "origin": "",
  "descriptionEn": "",
  "descriptionHi": "",
  "descriptionGu": ""
}`;

      const contentsParts: any[] = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        promptText,
      ];

      let response: any = null;
      let lastErr: any = null;

      // Key & Model Rotation Loop
      keyLoop: for (const apiKey of candidateKeys) {
        const ai = new GoogleGenAI({ apiKey });
        for (const mName of candidateModels) {
          try {
            const apiPromise = ai.models.generateContent({
              model: mName,
              contents: contentsParts,
              config: {
                responseMimeType: 'application/json',
              },
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout on ${mName}`)), 20000));
            response = await Promise.race([apiPromise, timeoutPromise]);
            if (response && response.text) {
              console.log(`[Gemini AI] Successfully generated catalogue using key (${apiKey.substring(0, 12)}...) and model '${mName}'`);
              break keyLoop;
            }
          } catch (e: any) {
            lastErr = e;
            const is429 = e.message?.includes('429') || e.message?.includes('Quota exceeded') || e.message?.includes('RESOURCE_EXHAUSTED');
            if (is429) {
              console.warn(`[Gemini AI] Rate limit (429) on key (${apiKey.substring(0, 12)}...) model '${mName}'. Switching active key...`);
              markKeyQuotaExceeded(apiKey);
              break;
            } else {
              console.warn(`[Gemini AI] Model '${mName}' notice:`, e.message || e);
            }
          }
        }
      }

      if (!response || !response.text) {
        throw new Error(lastErr?.message || 'Gemini API models call failed across all candidate keys/models.');
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
      return sanitizeCatalogueOutput(output);
    } catch (err: any) {
      console.warn('⚠️ Gemini AI Catalogue Generation notice, using fallback cataloguer:', err.message || err);
      await this.logActivity(userId, 'catalogue', 'failed', Date.now() - startTime);

      const transcriptText = (input.transcript && input.transcript.trim()) ? input.transcript.trim() : 'Authentic Indian Handcraft';
      const fallbackTitle = transcriptText.length > 3 && transcriptText !== 'Not provided'
        ? transcriptText.split('.')[0].slice(0, 45)
        : 'Handcrafted Artisan Product';

      return sanitizeCatalogueOutput({
        title: fallbackTitle,
        titleGujarati: 'હસ્તનિર્મિત કારીગરી વસ્તુ',
        titleHindi: 'हस्तनिर्मित कारीगरी उत्पाद',
        category: 'Handicrafts',
        material: 'Natural Organic Materials',
        craftType: input.craftType || 'Heritage Handcraft',
        origin: 'India',
        descriptionEn: `Handcrafted with authentic passion. ${transcriptText}`,
        descriptionHi: `भारतीय कारीगरों द्वारा पारंपरिक तकनीकों से निर्मित प्रामाणिक उत्कृष्ट हस्तशिल्प। ${transcriptText}`,
        descriptionGu: `ભારતીય કારીગરો દ્વારા પરંપરાગત શૈલીથી બનાવેલ અસલી અને ઉત્કૃષ્ટ હસ્તકળા. ${transcriptText}`,
      });
    }
  }

  /**
   * Generates rich multilingual product descriptions using Gemini AI
   */
  static async generateMultilingualDescriptions(input: {
    title: string;
    category?: string;
    material?: string;
    craftType?: string;
    origin?: string;
    story?: string;
  }, userId: string | null): Promise<{ descriptionEn: string; descriptionHi: string; descriptionGu: string }> {
    const startTime = Date.now();
    const candidateKeys = ENV.GEMINI_KEYS;
    const candidateModels = [ENV.GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'].filter((v, i, a) => v && a.indexOf(v) === i);

    if (candidateKeys && candidateKeys.length > 0) {
      const prompt = `You are CraftConnect AI, an expert digital cataloguer and copywriter for Indian rural artisans.
Write rich, compelling, 2-3 sentence multilingual product descriptions tailored to the craft item described below.

Product Details:
- Title: "${input.title}"
- Category: "${input.category || 'Handicrafts'}"
- Material: "${input.material || 'Natural Materials'}"
- Craft Specialty: "${input.craftType || 'Traditional Handcraft'}"
- Origin / Region: "${input.origin || 'India'}"
- Artisan Story / Input: "${input.story || ''}"

Guidelines:
1. "descriptionEn": Write an elegant, rich 2-3 sentence English description highlighting heritage, design, materials, and artisan skill.
2. "descriptionHi": Write an authentic 2-3 sentence Hindi description in Devanagari script.
3. "descriptionGu": Write an authentic 2-3 sentence Gujarati description in Gujarati script.

Respond with ONLY a raw JSON object:
{
  "descriptionEn": "string",
  "descriptionHi": "string",
  "descriptionGu": "string"
}`;

      for (const apiKey of candidateKeys) {
        const ai = new GoogleGenAI({ apiKey });
        for (const mName of candidateModels) {
          try {
            const apiPromise = ai.models.generateContent({
              model: mName,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              },
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI Description Timeout')), 12000));
            const response: any = await Promise.race([apiPromise, timeoutPromise]);

            const rawText = response.text || '';
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.descriptionEn && parsed.descriptionHi && parsed.descriptionGu) {
                await this.logActivity(userId, 'catalogue', 'success', Date.now() - startTime);
                return {
                  descriptionEn: parsed.descriptionEn,
                  descriptionHi: parsed.descriptionHi,
                  descriptionGu: parsed.descriptionGu,
                };
              }
            }
          } catch (err: any) {
            const is429 = err.message?.includes('429') || err.message?.includes('Quota exceeded') || err.message?.includes('RESOURCE_EXHAUSTED');
            if (is429) {
              console.warn(`[Gemini AI] Rate limit (429) notice on model '${mName}'. Fallback description ready.`);
              break;
            } else {
              console.warn(`⚠️ Gemini AI description enhancement notice (${mName}):`, err.message || err);
            }
          }
        }
      }
    }

    await this.logActivity(userId, 'catalogue', 'failed', Date.now() - startTime);
    const title = input.title || 'Handcrafted Indian Artisan Item';
    const mat = input.material || 'traditional natural materials';
    const craft = input.craftType || 'handicraft techniques';
    const origin = input.origin || 'India';

    return {
      descriptionEn: `Handmade with authentic artisan passion in ${origin}, this original ${title} is crafted using finest ${mat} and heritage ${craft} techniques. Perfect for adding timeless Indian elegance, rustic charm, and rich cultural heritage to your collection.`,
      descriptionHi: `${origin} के प्रसिद्ध कारीगरों द्वारा ${mat} और पारंपरिक ${craft} से हस्तनिर्मित यह प्रामाणिक ${title} भारतीय लोक कला और सांस्कृतिक विरासत का उत्कृष्ट प्रतीक है।`,
      descriptionGu: `${origin} ના શ્રેષ્ઠ કારીગરો દ્વારા ${mat} અને પરંપરાગત ${craft} કળા વડે હાથથી બનાવેલ આ અસલી ${title} ભારતીય સંસ્કૃતિ અને અનન્ય કારીગરીનું અદભુત પ્રતીક છે.`
    };
  }

  /**
   * CraftMate Floating AI Assistant chatbot response using Gemini AI
   */
  static async handleCraftMateChat(prompt: string, userId: string | null): Promise<string> {
    const startTime = Date.now();
    const candidateKeys = ENV.GEMINI_KEYS;
    const candidateModels = [ENV.GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'].filter((v, i, a) => v && a.indexOf(v) === i);

    if (candidateKeys && candidateKeys.length > 0) {
      for (const apiKey of candidateKeys) {
        const ai = new GoogleGenAI({ apiKey });
        for (const mName of candidateModels) {
          try {
            const apiPromise = ai.models.generateContent({
              model: mName,
              contents: `You are CraftMate 🤖, an AI assistant for CraftConnect AI—an e-commerce platform helping Indian rural artisans bring their crafts online and connect with buyers.
Artisan/User question: "${prompt}".

Provide a friendly, helpful, short response (2-3 sentences max) answering their query in clear language. You may include Gujarati or Hindi words naturally.`,
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI Chat Timeout')), 6000));
            const response: any = await Promise.race([apiPromise, timeoutPromise]);

            if (response && response.text) {
              await this.logActivity(userId, 'chat', 'success', Date.now() - startTime);
              return response.text.trim();
            }
          } catch (err: any) {
            console.warn(`❌ Gemini Chat notice (${mName}):`, err.message || err);
          }
        }
      }
      await this.logActivity(userId, 'chat', 'failed', Date.now() - startTime);
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
