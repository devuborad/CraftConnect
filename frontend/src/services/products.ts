import type { Product, Artisan } from '../types';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from './mockData';
import { api } from './api';
import { authService } from './authService';

const STORAGE_KEY = 'craft_custom_products';

const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Could not save products to localStorage:', e);
  }
};

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    let apiProducts: Product[] = [];
    try {
      const res = await api.getProducts();
      if (res.success && Array.isArray(res.data)) {
        apiProducts = res.data;
      }
    } catch (e) {
      console.warn('Backend getProducts fallback:', e);
    }

    const stored = getStoredProducts();
    
    // Deduplicate combined list by product ID
    const productMap = new Map<string, Product>();

    // 1. First add stored products (newest created by user)
    for (const p of stored) {
      if (p && p.id) productMap.set(p.id, p);
    }

    // 2. Add API products
    for (const p of apiProducts) {
      if (p && p.id && !productMap.has(p.id)) {
        productMap.set(p.id, p);
      }
    }

    // 3. Add seed MOCK_PRODUCTS
    for (const p of MOCK_PRODUCTS) {
      if (p && p.id && !productMap.has(p.id)) {
        productMap.set(p.id, p);
      }
    }

    return Array.from(productMap.values());
  },

  getMyProducts: async (): Promise<Product[]> => {
    const currentUser = authService.getCurrentUser();
    let apiProducts: Product[] = [];
    try {
      const res = await api.getMyProducts();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        apiProducts = res.data;
      }
    } catch (e) {
      console.warn('Backend getMyProducts fallback:', e);
    }

    const allProducts = await productService.getProducts();

    const currentUserId = currentUser?.id || 'artisan-1';
    const currentName = currentUser?.name?.toLowerCase().trim();
    const currentBusiness = currentUser?.businessName?.toLowerCase().trim();

    // STRICT FILTER: Only return products owned/created by THIS artisan
    return allProducts.filter((p) => {
      if (p.artisanId === currentUserId) return true;
      if (currentName && p.artisanName?.toLowerCase().trim() === currentName) return true;
      if (currentBusiness && p.artisanName?.toLowerCase().trim() === currentBusiness) return true;
      if ((currentUserId === 'user-artisan-1' || currentUserId === 'artisan-1' || currentUserId === 'usr-dev-artisan-001') && (p.artisanId === 'artisan-1' || p.artisanId === currentUserId)) return true;
      return false;
    });
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const res: any = await api.getProductById(id);
      if (res.success && res.data) {
        return res.data as Product;
      }
    } catch (e) {
      console.warn('Backend getProductById fallback:', e);
    }

    const all = await productService.getProducts();
    return all.find((p) => p.id === id);
  },

  getArtisans: async (): Promise<Artisan[]> => {
    return [...MOCK_ARTISANS];
  },

  getArtisanById: async (id: string): Promise<Artisan | undefined> => {
    return MOCK_ARTISANS.find((a) => a.id === id);
  },

  createProduct: async (newProduct: Partial<Product>): Promise<Product> => {
    const currentUser = authService.getCurrentUser();
    
    const artisanName = currentUser?.name || currentUser?.businessName || 'Meena Ben Vankar';
    const artisanAvatar = currentUser?.avatar || currentUser?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400';
    const artisanLocation = currentUser?.city || currentUser?.location || 'Bhuj, Gujarat';
    const artisanId = currentUser?.id || 'artisan-1';

    let createdId = `prod-${Date.now()}`;

    // 1. Send to Express MySQL Backend API
    try {
      const res = await api.createProduct({
        name: newProduct.title || 'Untitled Craft Product',
        title: newProduct.title,
        titleGujarati: newProduct.titleGujarati,
        titleHindi: newProduct.titleHindi,
        categoryName: newProduct.category || 'Textiles',
        category: newProduct.category || 'Textiles',
        material: newProduct.material || 'Handwoven Organic Cotton',
        craftType: newProduct.craftType || 'Handloom',
        origin: newProduct.origin || artisanLocation,
        price: newProduct.price || 1999,
        originalImageUrl: newProduct.originalImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        enhancedImageUrl: newProduct.enhancedImage || newProduct.originalImage,
        descriptionEn: newProduct.descriptionEn || 'Authentic handmade Indian artisan product crafted with natural traditional techniques.',
        descriptionHi: newProduct.descriptionHi,
        descriptionGu: newProduct.descriptionGu,
        stockQuantity: newProduct.stock || 5,
        status: 'published',
      });

      if (res.success && res.data && (res.data as any).id) {
        createdId = (res.data as any).id;
      }
    } catch (e) {
      console.warn('Backend createProduct API fallback:', e);
    }

    const created: Product = {
      id: createdId,
      title: newProduct.title || 'Untitled Craft Product',
      titleGujarati: newProduct.titleGujarati,
      titleHindi: newProduct.titleHindi,
      artisanId: artisanId,
      artisanName: artisanName,
      artisanAvatar: artisanAvatar,
      artisanLocation: artisanLocation,
      category: newProduct.category || 'Textiles',
      material: newProduct.material || 'Handwoven Organic Cotton',
      craftType: newProduct.craftType || 'Handloom',
      origin: newProduct.origin || artisanLocation,
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
      stock: newProduct.stock || 5,
      productionCost: newProduct.productionCost || Math.round((newProduct.price || 1999) * 0.55),
      recommendedPrice: newProduct.price || 1999,
      marketRange: newProduct.marketRange || { min: Math.round((newProduct.price || 1999) * 0.9), max: Math.round((newProduct.price || 1999) * 1.25) },
      pricingConfidence: 92,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage & update in-memory array
    const stored = getStoredProducts();
    const updated = [created, ...stored.filter(p => p.id !== created.id)];
    saveStoredProducts(updated);
    MOCK_PRODUCTS.unshift(created);

    return created;
  },

  saveDraftProduct: async (newProduct: Partial<Product>): Promise<Product> => {
    const currentUser = authService.getCurrentUser();
    
    const artisanName = currentUser?.name || currentUser?.businessName || 'Meena Ben Vankar';
    const artisanAvatar = currentUser?.avatar || currentUser?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400';
    const artisanLocation = currentUser?.city || currentUser?.location || 'Bhuj, Gujarat';
    const artisanId = currentUser?.id || 'artisan-1';

    let createdId = `draft-${Date.now()}`;

    try {
      const res = await api.saveProductDraft({
        name: newProduct.title || 'Untitled Craft Draft',
        title: newProduct.title,
        titleGujarati: newProduct.titleGujarati,
        titleHindi: newProduct.titleHindi,
        categoryName: newProduct.category || 'Textiles',
        material: newProduct.material || 'Handwoven Organic Cotton',
        craftType: newProduct.craftType || 'Handloom',
        origin: newProduct.origin || artisanLocation,
        price: newProduct.price || 1999,
        originalImageUrl: newProduct.originalImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        enhancedImageUrl: newProduct.enhancedImage || newProduct.originalImage,
        descriptionEn: newProduct.descriptionEn || 'Draft craft product.',
        descriptionHi: newProduct.descriptionHi,
        descriptionGu: newProduct.descriptionGu,
        stockQuantity: newProduct.stock || 5,
        status: 'draft',
      });

      if (res.success && res.data && (res.data as any).id) {
        createdId = (res.data as any).id;
      }
    } catch (e) {
      console.warn('Backend saveProductDraft API fallback:', e);
    }

    const created: Product = {
      id: createdId,
      title: newProduct.title || 'Untitled Craft Draft',
      titleGujarati: newProduct.titleGujarati,
      titleHindi: newProduct.titleHindi,
      artisanId: artisanId,
      artisanName: artisanName,
      artisanAvatar: artisanAvatar,
      artisanLocation: artisanLocation,
      category: newProduct.category || 'Textiles',
      material: newProduct.material || 'Handwoven Organic Cotton',
      craftType: newProduct.craftType || 'Handloom',
      origin: newProduct.origin || artisanLocation,
      price: newProduct.price || 1999,
      originalImage: newProduct.originalImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      enhancedImage: newProduct.enhancedImage || newProduct.originalImage,
      descriptionEn: newProduct.descriptionEn || 'Draft craft product.',
      descriptionHi: newProduct.descriptionHi,
      descriptionGu: newProduct.descriptionGu,
      isAiEnhanced: false,
      status: 'Draft',
      views: 0,
      inquiriesCount: 0,
      stock: newProduct.stock || 5,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage & update in-memory array
    const stored = getStoredProducts();
    const updated = [created, ...stored.filter(p => p.id !== created.id)];
    saveStoredProducts(updated);
    MOCK_PRODUCTS.unshift(created);

    return created;
  }
};
