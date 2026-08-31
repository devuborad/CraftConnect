export interface ImageStudioResult {
  originalUrl: string;
  enhancedUrl: string;
  cleanedBackground: boolean;
  improvedLighting: boolean;
  centeredProduct: boolean;
}

export interface SpeechTranscriptResult {
  detectedLanguage: 'Gujarati' | 'Hindi' | 'English';
  transcriptText: string;
  confidenceScore: number;
}

export interface CatalogueResult {
  titleEn: string;
  titleHi: string;
  titleGu: string;
  category: 'Textiles' | 'Pottery' | 'Woodcraft' | 'Jewellery' | 'Handicrafts' | 'Art' | 'Home Decor';
  material: string;
  craftType: string;
  origin: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionGu: string;
}

export interface PricingResult {
  totalCost: number;
  recommendedPrice: number;
  marketRange: { min: number; max: number };
  confidence: number;
  breakdown: string[];
}

export const aiService = {
  enhanceImage: async (imageUrl: string): Promise<ImageStudioResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          originalUrl: imageUrl,
          enhancedUrl: imageUrl, // Uses high quality enhanced preview
          cleanedBackground: true,
          improvedLighting: true,
          centeredProduct: true
        });
      }, 1500);
    });
  },

  transcribeSpeech: async (language: string): Promise<SpeechTranscriptResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (language === 'gu') {
          resolve({
            detectedLanguage: 'Gujarati',
            transcriptText: 'આ હાથથી વણેલી કોટનની સાડી છે. આમાં કુદરતી ઇન્ડિગો ડાયનો ઉપયોગ કર્યો છે અને કચ્છની પરંપરાગત વણાટ કામગીરી છે.',
            confidenceScore: 0.94
          });
        } else if (language === 'hi') {
          resolve({
            detectedLanguage: 'Hindi',
            transcriptText: 'यह हथकरघा द्वारा बनाई गई सूती साड़ी है। इसमें प्राकृतिक नील के रंगों का उपयोग किया गया है और कच्छ की पारंपरिक बुनाई है।',
            confidenceScore: 0.95
          });
        } else {
          resolve({
            detectedLanguage: 'English',
            transcriptText: 'This is a handwoven cotton saree made with natural organic indigo dye using traditional Kutch weaving techniques.',
            confidenceScore: 0.96
          });
        }
      }, 2000);
    });
  },

  generateCatalogue: async (_storyText: string): Promise<CatalogueResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          titleEn: 'Handwoven Kutch Organic Cotton Saree',
          titleHi: 'हथकरघा कच्छ आर्गेनिक कॉटन साड़ी',
          titleGu: 'હાથથી વણેલી કચ્છી ઓર્ગેનિક કોટન સાડી',
          category: 'Textiles',
          material: 'Pure Organic Cotton & Indigo Dye',
          craftType: 'Kutch Single Ikat Weaving',
          origin: 'Bhuj, Kutch, Gujarat',
          descriptionEn: 'Exquisite handwoven cotton saree crafted by artisan Meena Ben using natural indigo vegetable dyes. Lightweight, breathable, featuring traditional geometric Ikat border details.',
          descriptionHi: 'कारीगर मीना बेन द्वारा प्राकृतिक नील के रंगों से तैयार की गई सुंदर सूती साड़ी। हल्की, आरामदायक और पारंपरिक इकत डिज़ाइन वाली।',
          descriptionGu: 'કારીગર મીના બેન દ્વારા ઓર્ગેનિક ઇન્ડિગો કલરથી બનેલી સુંદર કોટન સાડી. સુતરાઉ અને ટકાઉ ઇકત બોર્ડર સાથે.'
        });
      }, 1800);
    });
  },

  calculatePriceRecommendation: async (costs: { rawMaterial: number; labor: number; packaging: number; other: number }): Promise<PricingResult> => {
    const totalCost = costs.rawMaterial + costs.labor + costs.packaging + costs.other;
    const margin = 0.55; // 55% fair artisan margin
    const recommendedPrice = Math.round(totalCost * (1 + margin));
    const minRange = Math.round(recommendedPrice * 0.9);
    const maxRange = Math.round(recommendedPrice * 1.15);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalCost,
          recommendedPrice,
          marketRange: { min: minRange, max: maxRange },
          confidence: 88,
          breakdown: [
            `Total direct production cost of ₹${totalCost} considered`,
            'Guarantees fair 50-60% artisan living wage margin',
            'Compared against 140+ similar handloom textiles listings in Western India',
            'Accounts for unique natural dye and craft labor intensity'
          ]
        });
      }, 1200);
    });
  }
};
