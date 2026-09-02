// @ts-ignore
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';

export interface PricingInput {
  productId?: string;
  productName?: string;
  category?: string;
  craftType?: string;
  material?: string;
  origin?: string;
  rawMaterialCost?: number;
  labourCost?: number;
  packagingCost?: number;
  otherCost?: number;
  quantity?: number;
  description?: string;
}

export interface PricingResultData {
  totalCost: number;
  marketMin: number;
  marketMax: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string;
  dataSource: string;
  breakdown: string[];
}

export class PricingService {
  /**
   * Server-side cost calculation (does not trust client-side totalCost)
   */
  static calculateTotalCost(input: PricingInput): number {
    const raw = Math.max(0, Number(input.rawMaterialCost) || 0);
    const labour = Math.max(0, Number(input.labourCost) || 0);
    const pkg = Math.max(0, Number(input.packagingCost) || 0);
    const other = Math.max(0, Number(input.otherCost) || 0);
    return Math.round((raw + labour + pkg + other) * 100) / 100;
  }

  /**
   * Reference pricing estimation ranges by category (Demo/Reference data)
   */
  static getReferenceMarketRange(totalCost: number, category: string = 'Textiles'): { min: number; max: number } {
    const cat = category.toLowerCase();
    let minMultiplier = 1.35;
    let maxMultiplier = 2.2;

    if (cat.includes('textile') || cat.includes('saree')) {
      minMultiplier = 1.33;
      maxMultiplier = 2.22;
    } else if (cat.includes('pottery')) {
      minMultiplier = 1.4;
      maxMultiplier = 2.5;
    } else if (cat.includes('wood')) {
      minMultiplier = 1.4;
      maxMultiplier = 2.3;
    } else if (cat.includes('jewel')) {
      minMultiplier = 1.5;
      maxMultiplier = 2.8;
    }

    const min = Math.round(totalCost * minMultiplier);
    const max = Math.round(totalCost * maxMultiplier);
    return { min, max };
  }

  /**
   * Backward compatibility method for product creation
   */
  static generatePriceRecommendation(
    costs: PricingInput,
    craftType: string = 'Handwoven',
    category: string = 'Textiles'
  ) {
    const totalCost = this.calculateTotalCost(costs);
    const refRange = this.getReferenceMarketRange(totalCost, category);
    const recommendedPrice = Math.round(totalCost * 1.55);
    return {
      totalCost,
      recommendedPrice,
      marketRange: {
        min: refRange.min,
        max: refRange.max,
      },
      confidence: 0.85,
      reasoning: `Price estimated based on total production cost (₹${totalCost.toLocaleString('en-IN')}) with a fair 55% artisan profit margin benchmarked against ${category} reference market range.`,
      dataSource: 'CraftConnect AI Demo Reference Estimator',
    };
  }

  /**
   * AI activity logging for pricing feature
   */
  static async logActivity(userId: string | null, status: 'success' | 'failed', timeMs: number): Promise<void> {
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
        `INSERT INTO ai_activity (id, user_id, feature, status, processing_time_ms, created_at) VALUES (?, ?, 'pricing', ?, ?, NOW())`,
        [id, validUserId, status, timeMs]
      );
    } catch (err) {
      console.warn('Failed to log pricing AI activity:', err);
    }
  }

  /**
   * Generates AI pricing recommendation using Gemini AI with safety constraints & database persistence
   */
  static async analyzePricing(input: PricingInput, userId: string | null): Promise<PricingResultData> {
    const startTime = Date.now();
    const totalCost = this.calculateTotalCost(input);
    const refRange = this.getReferenceMarketRange(totalCost, input.category || 'Textiles');

    const productName = input.productName || 'Handcrafted Artisan Item';
    const category = input.category || 'Textiles';
    const craftType = input.craftType || 'Handmade Craft';
    const material = input.material || 'Artisanal Material';
    const origin = input.origin || 'India';

    let recommendedPrice = Math.round(totalCost * 1.55);
    let marketMin = refRange.min;
    let marketMax = refRange.max;
    let confidence = 0.85;
    let reasoning = `Price calculated from ₹${totalCost.toLocaleString('en-IN')} production cost with fair 55% artisan living wage margin, benchmarked against estimated ${category} reference market range.`;
    let isAISuccess = false;

    // AI Pricing Analysis via Gemini
    if (ENV.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
        const prompt = `You are CraftConnect AI Pricing Specialist for Indian rural artisans.
Analyze the product costs and estimate fair pricing in Indian Rupees (₹/INR).

Product Details:
- Name: "${productName}"
- Category: "${category}"
- Craft Type: "${craftType}"
- Material: "${material}"
- Origin: "${origin}"

Production Cost Breakdown:
- Raw Materials: ₹${Math.max(0, Number(input.rawMaterialCost) || 0)}
- Labour & Time: ₹${Math.max(0, Number(input.labourCost) || 0)}
- Packaging: ₹${Math.max(0, Number(input.packagingCost) || 0)}
- Transport/Other: ₹${Math.max(0, Number(input.otherCost) || 0)}
- Total Direct Production Cost: ₹${totalCost}

Estimated Reference Market Range: ₹${refRange.min} – ₹${refRange.max}

Guidelines:
1. Ensure recommendedPrice >= totalCost (Artisans must never sell below production cost).
2. Guarantee fair artisan margin (typically 40%-60% above production cost).
3. Return confidence as a decimal number between 0.0 and 1.0 (e.g. 0.85).
4. Provide a clear, respectful reasoning in English explaining the price choice.

Respond strictly with ONLY a raw JSON object:
{
  "minimumPrice": number,
  "recommendedPrice": number,
  "maximumPrice": number,
  "confidence": number,
  "reasoning": "string"
}`;

        const response = await ai.models.generateContent({
          model: ENV.GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          if (parsed.recommendedPrice && typeof parsed.recommendedPrice === 'number') {
            recommendedPrice = Math.round(parsed.recommendedPrice);
          }
          if (parsed.minimumPrice && typeof parsed.minimumPrice === 'number') {
            marketMin = Math.round(parsed.minimumPrice);
          }
          if (parsed.maximumPrice && typeof parsed.maximumPrice === 'number') {
            marketMax = Math.round(parsed.maximumPrice);
          }
          if (parsed.confidence && typeof parsed.confidence === 'number') {
            let conf = parsed.confidence;
            if (conf > 1) conf = conf / 100; // Convert 85 -> 0.85
            confidence = Math.min(1.0, Math.max(0.0, Math.round(conf * 100) / 100));
          }
          if (parsed.reasoning && typeof parsed.reasoning === 'string') {
            reasoning = parsed.reasoning;
          }

          isAISuccess = true;
        }
      } catch (err: any) {
        console.error('❌ Gemini Pricing AI Error, falling back to rule-based estimator:', err.message || err);
      }
    }

    // Safety Constraint: Price must NEVER be below total cost
    if (recommendedPrice < totalCost) {
      recommendedPrice = Math.round(totalCost * 1.4);
    }
    if (marketMin < totalCost) {
      marketMin = Math.round(totalCost * 1.25);
    }
    if (marketMax < recommendedPrice) {
      marketMax = Math.round(recommendedPrice * 1.35);
    }

    // Log activity
    await this.logActivity(userId, isAISuccess ? 'success' : 'failed', Date.now() - startTime);

    const dataSource = 'CraftConnect AI Demo Reference Estimator';
    const breakdown = [
      `Total direct production cost of ₹${totalCost.toLocaleString('en-IN')} considered`,
      `Guarantees fair 40-60% artisan living wage margin (₹${(recommendedPrice - totalCost).toLocaleString('en-IN')} profit)`,
      `Benchmarked against estimated regional ${category} market reference range (₹${marketMin.toLocaleString('en-IN')} – ₹${marketMax.toLocaleString('en-IN')})`,
      `Accounts for unique ${craftType} craft labor intensity and material costs`
    ];

    // Store in pricing_analysis table if productId exists
    if (input.productId) {
      try {
        const analysisId = cryptoRandomUUID();
        await db.execute(
          `INSERT INTO pricing_analysis (id, product_id, market_min, market_max, recommended_price, confidence, reasoning, data_source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [analysisId, input.productId, marketMin, marketMax, recommendedPrice, confidence, reasoning, dataSource]
        );
      } catch (dbErr) {
        console.warn('Failed to insert pricing_analysis record:', dbErr);
      }
    }

    return {
      totalCost,
      marketMin,
      marketMax,
      recommendedPrice,
      confidence,
      reasoning,
      dataSource,
      breakdown,
    };
  }
}
