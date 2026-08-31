export type Role = 'ARTISAN' | 'BUYER' | 'ADMIN' | 'GUEST';

export type LanguageCode = 'gu' | 'hi' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
}

export interface Artisan {
  id: string;
  name: string;
  avatar: string;
  location: string;
  state: string;
  craftType: string;
  experienceYears: number;
  story: string;
  rating: number;
  reviewCount: number;
  phone: string;
  languages: LanguageCode[];
  isVerified: boolean;
  publishedCount: number;
  totalSales: string;
}

export interface Product {
  id: string;
  title: string;
  titleGujarati?: string;
  titleHindi?: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanLocation: string;
  category: 'Textiles' | 'Pottery' | 'Woodcraft' | 'Jewellery' | 'Handicrafts' | 'Art' | 'Home Decor';
  material: string;
  craftType: string;
  origin: string;
  price: number;
  originalImage: string;
  enhancedImage?: string;
  descriptionEn: string;
  descriptionHi?: string;
  descriptionGu?: string;
  isAiEnhanced: boolean;
  status: 'Published' | 'Pending' | 'Draft' | 'Rejected';
  views: number;
  inquiriesCount: number;
  stock: number;
  productionCost?: number;
  recommendedPrice?: number;
  marketRange?: { min: number; max: number };
  pricingConfidence?: number;
  createdAt: string;
}

export interface BulkInquiry {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerName: string;
  buyerCompany: string;
  buyerPhone: string;
  buyerEmail: string;
  artisanId: string;
  artisanName: string;
  quantity: number;
  targetPrice: number;
  message: string;
  deliveryLocation: string;
  status: 'NEW' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED';
  counterPrice?: number;
  createdAt: string;
}

export interface AIActivityMetric {
  id: string;
  type: 'IMAGE_ENHANCE' | 'SPEECH_CATALOGUE' | 'PRICING_ENGINE' | 'TRANSLATION';
  artisanName: string;
  status: 'SUCCESS' | 'FAILED';
  durationMs: number;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

