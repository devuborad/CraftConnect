import type { Product, Artisan } from '../types';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from './mockData';
import { api } from './api';
import { authService } from './authService';

const STORAGE_KEY = 'craft_custom_products';
const REMOVED_STORAGE_KEY = 'craft_removed_product_ids';

const getRemovedProductIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(REMOVED_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

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
    window.dispatchEvent(new Event('storage'));
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

    const removedIds = getRemovedProductIds();
    const all = Array.from(productMap.values()).filter((p) => !removedIds.has(p.id));
    const currentUser = authService.getCurrentUser();

    // Dynamically synchronize products with current artisan's latest name, company/business name, avatar & location
    if (currentUser && (currentUser.role === 'ARTISAN' || currentUser.role === 'ADMIN')) {
      const currentArtisanId = currentUser.id;
      const ownerName = currentUser.name || '';
      const compName = currentUser.businessName || '';
      const formattedName = compName && ownerName && compName !== ownerName
        ? `${ownerName} • ${compName}`
        : (compName || ownerName);

      return all.map((p) => {
        const isOwner = p.artisanId === currentArtisanId ||
                        ((currentArtisanId === 'user-artisan-1' || currentArtisanId === 'artisan-1' || currentArtisanId === 'usr-dev-artisan-001') && (p.artisanId === 'artisan-1' || p.artisanId === currentArtisanId));
        if (isOwner) {
          return {
            ...p,
            artisanName: formattedName || p.artisanName,
            businessName: compName || p.businessName,
            companyName: compName || p.companyName,
            ownerName: ownerName || p.ownerName,
            artisanAvatar: currentUser.avatar || currentUser.profileImage || p.artisanAvatar,
            artisanLocation: currentUser.city || currentUser.location || p.artisanLocation,
          };
        }
        return p;
      });
    }

    return all;
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
  },

  updateArtisanProducts: (
    artisanId: string,
    artisanName?: string,
    businessName?: string,
    artisanAvatar?: string,
    artisanLocation?: string
  ): void => {
    const formattedName = businessName && artisanName && businessName !== artisanName
      ? `${artisanName} • ${businessName}`
      : (businessName || artisanName || 'Master Artisan');

    // 1. Update localStorage products ('craft_custom_products')
    const stored = getStoredProducts();
    const updatedStored = stored.map((p) => {
      const isOwner = p.artisanId === artisanId || 
                      (artisanId === 'user-artisan-1' && (p.artisanId === 'artisan-1' || p.artisanId === 'user-artisan-1')) ||
                      (artisanId === 'usr-dev-artisan-001' && (p.artisanId === 'artisan-1' || p.artisanId === 'usr-dev-artisan-001'));
      if (isOwner) {
        return {
          ...p,
          artisanName: formattedName,
          businessName: businessName || p.businessName,
          companyName: businessName || p.companyName,
          ownerName: artisanName || p.ownerName,
          artisanAvatar: artisanAvatar || p.artisanAvatar,
          artisanLocation: artisanLocation || p.artisanLocation,
        };
      }
      return p;
    });
    saveStoredProducts(updatedStored);

    // 2. Update in-memory MOCK_PRODUCTS array
    for (let i = 0; i < MOCK_PRODUCTS.length; i++) {
      const p = MOCK_PRODUCTS[i];
      const isOwner = p.artisanId === artisanId ||
                      (artisanId === 'user-artisan-1' && (p.artisanId === 'artisan-1' || p.artisanId === 'user-artisan-1')) ||
                      (artisanId === 'usr-dev-artisan-001' && (p.artisanId === 'artisan-1' || p.artisanId === 'usr-dev-artisan-001'));
      if (isOwner) {
        MOCK_PRODUCTS[i] = {
          ...p,
          artisanName: formattedName,
          businessName: businessName || p.businessName,
          companyName: businessName || p.companyName,
          ownerName: artisanName || p.ownerName,
          artisanAvatar: artisanAvatar || p.artisanAvatar,
          artisanLocation: artisanLocation || p.artisanLocation,
        };
      }
    }

    try {
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}
  },

  deleteProduct: async (productId: string): Promise<boolean> => {
    // 1. Call Backend DELETE API
    try {
      await api.deleteProduct(productId);
    } catch (e) {
      console.warn('Backend deleteProduct fallback:', e);
    }

    // 2. Remove from craft_custom_products in localStorage
    const stored = getStoredProducts();
    const updatedStored = stored.filter((p) => p.id !== productId);
    saveStoredProducts(updatedStored);

    // 3. Mark in craft_removed_product_ids so it stays removed across sessions/reloads
    try {
      const removedIds = getRemovedProductIds();
      removedIds.add(productId);
      localStorage.setItem(REMOVED_STORAGE_KEY, JSON.stringify(Array.from(removedIds)));
    } catch (_) {}

    // 4. Filter out from in-memory MOCK_PRODUCTS
    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      MOCK_PRODUCTS.splice(idx, 1);
    }

    // 5. Fire storage event so all pages & components instantly re-render
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    return true;
  }
};
