import type { BulkInquiry, Product } from '../types';
import { MOCK_INQUIRIES } from './mockData';
import { api } from './api';

const STORAGE_KEY = 'craft_live_inquiries';
const HISTORY_KEY = 'craftconnect_inquiries_history';

const getStoredInquiries = (): BulkInquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredInquiries = (items: BulkInquiry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Could not save inquiries to localStorage:', e);
  }
};

const getStoredHistory = (): BulkInquiry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredHistory = (items: BulkInquiry[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Could not save history to localStorage:', e);
  }
};

export const inquiryService = {
  getInquiries: async (): Promise<BulkInquiry[]> => {
    try {
      const res = await api.getInquiries();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        saveStoredInquiries(res.data);
        return res.data;
      }
    } catch (e) {
      console.warn('Backend getInquiries fallback:', e);
    }
    const stored = getStoredInquiries();
    return [...stored, ...MOCK_INQUIRIES];
  },

  getInquiriesByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    const all = await inquiryService.getInquiries();
    if (!artisanId && !artisanName) return all;

    const lowerId = artisanId?.toLowerCase() || '';
    const lowerName = artisanName?.toLowerCase() || '';

    return all.filter((i) => {
      const matchId = artisanId && i.artisanId && i.artisanId.toLowerCase() === lowerId;
      const matchName = artisanName && i.artisanName && i.artisanName.toLowerCase().includes(lowerName);
      return matchId || matchName;
    });
  },

  getActiveInquiriesByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    const stored = getStoredInquiries();
    const all = [...stored, ...MOCK_INQUIRIES];

    const map = new Map<string, BulkInquiry>();
    for (const item of all) {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    const combined = Array.from(map.values());

    const targetId = artisanId || 'artisan-1';
    const targetName = artisanName?.toLowerCase().trim();

    return combined.filter((i) => {
      if (i.artisanId === targetId) return true;
      if (targetName && i.artisanName?.toLowerCase().trim() === targetName) return true;
      if (targetId === 'artisan-1' || targetId === 'user-artisan-1' || targetId === 'usr-dev-artisan-001') return true;
      return false;
    });
  },

  recordDirectOrder: async (data: {
    product: Product | any;
    quantity: number;
    buyerName?: string;
    buyerCompany?: string;
    buyerPhone?: string;
    buyerEmail?: string;
    deliveryAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    paymentMethod?: string;
    totalAmount?: number;
  }): Promise<BulkInquiry> => {
    const created: BulkInquiry = {
      id: `ord-${Date.now()}`,
      type: 'DIRECT_ORDER',
      productId: data.product.id || 'prod-1',
      productTitle: data.product.title || 'Handmade Product',
      productImage: data.product.enhancedImage || data.product.originalImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: data.buyerName || 'Valued Retail Customer',
      buyerCompany: data.buyerCompany || 'Direct Express Purchase',
      buyerPhone: data.buyerPhone || '+91 98765 43210',
      buyerEmail: data.buyerEmail || 'customer@craftconnect.in',
      artisanId: data.product.artisanId || 'artisan-1',
      artisanName: data.product.artisanName || 'Meena Ben Vankar',
      quantity: data.quantity || 1,
      targetPrice: data.product.price || 1999,
      totalAmount: data.totalAmount || (data.product.price || 1999) * (data.quantity || 1),
      message: `Direct purchase paid via ${data.paymentMethod || 'UPI'}. Deliver to: ${data.deliveryAddress || ''}, ${data.city || ''} (${data.pincode || ''})`,
      deliveryLocation: `${data.city || 'Mumbai'}, ${data.state || 'Maharashtra'}`,
      status: 'NEW',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const stored = getStoredInquiries();
    const updated = [created, ...stored];
    saveStoredInquiries(updated);
    MOCK_INQUIRIES.unshift(created);

    try {
      await api.createInquiry({
        productId: created.productId,
        quantity: created.quantity,
        targetPrice: created.targetPrice,
        targetBudget: created.totalAmount,
        message: created.message,
        deliveryLocation: created.deliveryLocation
      });
    } catch (e) {
      console.warn('Backend recordDirectOrder API fallback:', e);
    }

    return created;
  },

  sendInquiry: async (newInquiry: Partial<BulkInquiry>): Promise<BulkInquiry> => {
    try {
      const res: any = await api.createInquiry({
        productId: newInquiry.productId,
        quantity: newInquiry.quantity || 10,
        targetPrice: newInquiry.targetPrice || 0,
        targetBudget: newInquiry.targetPrice || 0,
        message: newInquiry.message || 'Bulk inquiry request',
        deliveryLocation: newInquiry.deliveryLocation || 'India',
      });

      if (res.success && res.data) {
        const created: BulkInquiry = {
          id: (res.data as any).id || `inq-${Date.now()}`,
          type: newInquiry.type || 'BULK_INQUIRY',
          productId: newInquiry.productId || 'prod-1',
          productTitle: newInquiry.productTitle || 'Handmade Product',
          productImage: newInquiry.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
          buyerName: newInquiry.buyerName || 'Valued Boutique Buyer',
          buyerCompany: newInquiry.buyerCompany || 'Craft Retailers Ltd',
          buyerPhone: newInquiry.buyerPhone || '+91 98765 43210',
          buyerEmail: newInquiry.buyerEmail || 'buyer@example.com',
          artisanId: newInquiry.artisanId || 'artisan-1',
          artisanName: newInquiry.artisanName || 'Meena Ben Vankar',
          quantity: newInquiry.quantity || 50,
          targetPrice: newInquiry.targetPrice || 2000,
          totalAmount: newInquiry.totalAmount || (newInquiry.quantity || 50) * (newInquiry.targetPrice || 2000),
          message: newInquiry.message || 'We would like to place a bulk order for our retail stores.',
          deliveryLocation: newInquiry.deliveryLocation || 'Mumbai, Maharashtra',
          status: 'NEW',
          createdAt: new Date().toISOString().split('T')[0]
        };
        const stored = getStoredInquiries();
        saveStoredInquiries([created, ...stored]);
        MOCK_INQUIRIES.unshift(created);
        return created;
      }
    } catch (e) {
      console.warn('Backend sendInquiry fallback:', e);
    }

    const created: BulkInquiry = {
      id: `inq-${Date.now()}`,
      type: newInquiry.type || 'BULK_INQUIRY',
      productId: newInquiry.productId || 'prod-1',
      productTitle: newInquiry.productTitle || 'Handmade Product',
      productImage: newInquiry.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: newInquiry.buyerName || 'Valued Boutique Buyer',
      buyerCompany: newInquiry.buyerCompany || 'Craft Retailers Ltd',
      buyerPhone: newInquiry.buyerPhone || '+91 98765 43210',
      buyerEmail: newInquiry.buyerEmail || 'buyer@example.com',
      artisanId: newInquiry.artisanId || 'artisan-1',
      artisanName: newInquiry.artisanName || 'Meena Ben Vankar',
      quantity: newInquiry.quantity || 50,
      targetPrice: newInquiry.targetPrice || 2000,
      totalAmount: newInquiry.totalAmount || (newInquiry.quantity || 50) * (newInquiry.targetPrice || 2000),
      message: newInquiry.message || 'We would like to place a bulk order for our retail stores.',
      deliveryLocation: newInquiry.deliveryLocation || 'Mumbai, Maharashtra',
      status: 'NEW',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const stored = getStoredInquiries();
    saveStoredInquiries([created, ...stored]);
    MOCK_INQUIRIES.unshift(created);
    return created;
  },

  updateStatus: async (
    id: string,
    status: 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'DISPATCHED' | 'ARCHIVED',
    counterPrice?: number,
    note?: string
  ): Promise<BulkInquiry | undefined> => {
    try {
      await api.updateInquiryStatus(id, status, counterPrice);
    } catch (e) {
      console.warn('Backend updateStatus fallback:', e);
    }
    const stored = getStoredInquiries();
    const target = stored.find((i) => i.id === id) || MOCK_INQUIRIES.find((i) => i.id === id);
    if (target) {
      target.status = status as any;
      if (counterPrice) target.counterPrice = counterPrice;
      if (note) target.message = `${target.message || ''}\n[Update]: ${note}`;

      if (status === 'DECLINED' || status === 'ARCHIVED') {
        const remaining = stored.filter((i) => i.id !== id);
        saveStoredInquiries(remaining);

        const history = getStoredHistory();
        history.unshift({ ...target });
        saveStoredHistory(history);
      } else {
        saveStoredInquiries(stored);
      }
    }
    return target;
  },

  getHistoryByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    const history = getStoredHistory();
    if (history.length > 0) {
      if (!artisanId && !artisanName) return history;
      const lowerId = artisanId?.toLowerCase() || '';
      const lowerName = artisanName?.toLowerCase() || '';

      return history.filter((i) => {
        const matchId = artisanId && i.artisanId && i.artisanId.toLowerCase() === lowerId;
        const matchName = artisanName && i.artisanName && i.artisanName.toLowerCase().includes(lowerName);
        return matchId || matchName;
      });
    }

    const all = await inquiryService.getActiveInquiriesByArtisan(artisanId, artisanName);
    return all.filter((i) => i.status !== 'NEW');
  },

  restoreFromHistory: async (id: string): Promise<BulkInquiry | undefined> => {
    const history = getStoredHistory();
    const itemIndex = history.findIndex((h) => h.id === id);
    if (itemIndex !== -1) {
      const [restored] = history.splice(itemIndex, 1);
      restored.status = 'NEW';
      saveStoredHistory(history);

      const stored = getStoredInquiries();
      saveStoredInquiries([restored, ...stored]);
      return restored;
    }
    return await inquiryService.updateStatus(id, 'ACCEPTED');
  },

  deleteHistoryItem: async (id: string): Promise<boolean> => {
    const history = getStoredHistory();
    const filtered = history.filter((h) => h.id !== id);
    saveStoredHistory(filtered);

    const stored = getStoredInquiries().filter((i) => i.id !== id);
    saveStoredInquiries(stored);
    return true;
  },

  clearAllHistory: async (artisanId?: string): Promise<boolean> => {
    saveStoredHistory([]);
    return true;
  }
};
