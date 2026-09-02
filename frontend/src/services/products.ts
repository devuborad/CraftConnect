import type { Product, Artisan } from '../types';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from './mockData';
import { api } from './api';

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_PRODUCTS]), 300);
    });
  },

  getMyProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_PRODUCTS]), 200);
    });
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      setTimeout(() => resolve(found), 200);
    });
  },

  getArtisans: async (): Promise<Artisan[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_ARTISANS]), 300);
    });
  },

  getArtisanById: async (id: string): Promise<Artisan | undefined> => {
    return new Promise((resolve) => {
      const found = MOCK_ARTISANS.find((a) => a.id === id);
      setTimeout(() => resolve(found), 200);
    });
  },

  createProduct: async (newProduct: Partial<Product>): Promise<Product> => {
    const titleNorm = (newProduct.title || '').trim().toLowerCase();
    const existing = MOCK_PRODUCTS.find((p) => p.title.trim().toLowerCase() === titleNorm);

    if (existing) {
      const addedStock = newProduct.stock !== undefined ? newProduct.stock : 5;
      existing.stock = (existing.stock || 0) + addedStock;
      if (newProduct.price) existing.price = newProduct.price;
      return existing;
    }

    const created: Product = {
      id: `prod-${Date.now()}`,
      title: newProduct.title || 'Untitled Craft Product',
      titleGujarati: newProduct.titleGujarati,
      titleHindi: newProduct.titleHindi,
      artisanId: newProduct.artisanId || 'artisan-1',
      artisanName: newProduct.artisanName || 'Meena Ben Vankar',
      artisanAvatar: newProduct.artisanAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      artisanLocation: newProduct.artisanLocation || 'Bhuj, Gujarat',
      category: newProduct.category || 'Textiles',
      material: newProduct.material || 'Handwoven Organic Cotton',
      craftType: newProduct.craftType || 'Handloom',
      origin: newProduct.origin || 'Gujarat',
      price: newProduct.price || 1999,
      originalImage: newProduct.originalImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      enhancedImage: newProduct.enhancedImage || newProduct.originalImage,
      descriptionEn: newProduct.descriptionEn || 'Authentic handmade Indian artisan product crafted with natural traditional techniques.',
      descriptionHi: newProduct.descriptionHi,
      descriptionGu: newProduct.descriptionGu,
      isAiEnhanced: true,
      status: 'Published',
      views: 1,
      inquiriesCount: 0,
      stock: newProduct.stock !== undefined ? newProduct.stock : 5,
      productionCost: newProduct.productionCost || 1100,
      recommendedPrice: newProduct.recommendedPrice || 1999,
      marketRange: newProduct.marketRange || { min: 1800, max: 2200 },
      pricingConfidence: 85,
      createdAt: new Date().toISOString().split('T')[0]
    };

    MOCK_PRODUCTS.unshift(created);
    return created;
  },

  getCatalogueAnalytics: async (): Promise<any> => {
    try {
      const res: any = await api.get('/products/analytics');
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend product analytics notice:', err);
    }
    return null;
  }
};
