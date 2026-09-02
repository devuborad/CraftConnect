import type { BulkInquiry } from '../types';
import { MOCK_INQUIRIES } from './mockData';
import { api } from './api';

const STORAGE_KEY = 'craftconnect_inquiries_db';
const HISTORY_KEY = 'craftconnect_inquiries_history';

const getStoredInquiries = (): BulkInquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse inquiries:', err);
  }
  return [...MOCK_INQUIRIES];
};

const saveInquiries = (list: BulkInquiry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save inquiries:', err);
  }
};

const getStoredHistory = (): BulkInquiry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse history:', err);
  }
  return [];
};

const saveHistory = (list: BulkInquiry[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
};

export const inquiryService = {
  getInquiries: async (): Promise<BulkInquiry[]> => {
    try {
      const res = await api.getInquiries();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        saveInquiries(res.data);
        return res.data;
      }
    } catch (e) {
      console.warn('Backend getInquiries fallback:', e);
    }
    return getStoredInquiries();
  },

  getInquiriesByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    let all = getStoredInquiries();
    try {
      const res = await api.getInquiries();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        all = res.data;
        saveInquiries(all);
      }
    } catch (e) {
      console.warn('Backend getInquiriesByArtisan fallback:', e);
    }

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
    const list = await inquiryService.getInquiriesByArtisan(artisanId, artisanName);
    return list.filter((i) => i.status !== 'ARCHIVED' && i.status !== 'DECLINED');
  },

  getHistoryByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    const history = getStoredHistory();
    if (!artisanId && !artisanName) return history;

    const lowerId = artisanId?.toLowerCase() || '';
    const lowerName = artisanName?.toLowerCase() || '';

    return history.filter((i) => {
      const matchId = artisanId && i.artisanId && i.artisanId.toLowerCase() === lowerId;
      const matchName = artisanName && i.artisanName && i.artisanName.toLowerCase().includes(lowerName);
      return matchId || matchName;
    });
  },

  restoreFromHistory: async (id: string): Promise<BulkInquiry | undefined> => {
    const history = getStoredHistory();
    const itemIndex = history.findIndex((h) => h.id === id);
    if (itemIndex === -1) return undefined;

    const [restored] = history.splice(itemIndex, 1);
    restored.status = 'NEW';
    saveHistory(history);

    const currentInquiries = getStoredInquiries();
    currentInquiries.unshift(restored);
    saveInquiries(currentInquiries);

    return restored;
  },

  deleteHistoryItem: async (id: string): Promise<boolean> => {
    const history = getStoredHistory();
    const filtered = history.filter((h) => h.id !== id);
    saveHistory(filtered);
    return true;
  },

  clearAllHistory: async (artisanId?: string): Promise<boolean> => {
    if (!artisanId) {
      saveHistory([]);
      return true;
    }
    const history = getStoredHistory();
    const remaining = history.filter((h) => h.artisanId !== artisanId);
    saveHistory(remaining);
    return true;
  },

  recordDirectOrder: (orderData: {
    product: any;
    quantity: number;
    buyerName: string;
    buyerCompany?: string;
    buyerPhone?: string;
    buyerEmail?: string;
    deliveryAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    paymentMethod?: string;
    totalAmount?: number;
  }): BulkInquiry => {
    const newOrder: BulkInquiry = {
      id: `ORD-${Date.now()}`,
      productId: orderData.product.id || 'prod-1',
      productTitle: orderData.product.title || 'Handmade Product',
      productImage: orderData.product.originalImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: orderData.buyerName || 'Direct Buyer',
      buyerCompany: orderData.buyerCompany || 'Direct Consumer Purchase',
      buyerPhone: orderData.buyerPhone || '+91 98765 43210',
      buyerEmail: orderData.buyerEmail || 'buyer@craftconnect.in',
      artisanId: orderData.product.artisanId || 'artisan-1',
      artisanName: orderData.product.artisanName || 'Meena Ben Vankar',
      quantity: orderData.quantity || 1,
      targetPrice: orderData.product.price || 1999,
      message: `Direct Express Purchase: Delivery to ${orderData.deliveryAddress || ''}, ${orderData.city || ''}, ${orderData.state || ''} - ${orderData.pincode || ''}. Paid via ${orderData.paymentMethod || 'UPI'}. Total: ₹${orderData.totalAmount || 0}`,
      deliveryLocation: `${orderData.city || 'Mumbai'}, ${orderData.state || 'India'}`,
      status: 'NEW',
      type: 'DIRECT_ORDER',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const currentInquiries = getStoredInquiries();
    currentInquiries.unshift(newOrder);
    saveInquiries(currentInquiries);

    return newOrder;
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
          message: newInquiry.message || 'We would like to place a bulk order for our retail stores.',
          deliveryLocation: newInquiry.deliveryLocation || 'Mumbai, Maharashtra',
          status: 'NEW',
          createdAt: new Date().toISOString().split('T')[0]
        };
        const list = getStoredInquiries();
        list.unshift(created);
        saveInquiries(list);
        return created;
      }
    } catch (e) {
      console.warn('Backend sendInquiry fallback:', e);
    }

    const created: BulkInquiry = {
      id: `inq-${Date.now()}`,
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
      message: newInquiry.message || 'We would like to place a bulk order for our retail stores.',
      deliveryLocation: newInquiry.deliveryLocation || 'Mumbai, Maharashtra',
      status: 'NEW',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const list = getStoredInquiries();
    list.unshift(created);
    saveInquiries(list);
    return created;
  },

  updateStatus: async (
    id: string,
    status: 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'DISPATCHED' | 'ARCHIVED',
    counterPrice?: number,
    message?: string
  ): Promise<BulkInquiry | undefined> => {
    try {
      await api.updateInquiryStatus(id, status, counterPrice);
    } catch (e) {
      console.warn('Backend updateStatus fallback:', e);
    }

    const inquiries = getStoredInquiries();
    const inq = inquiries.find((i) => i.id === id);

    if (inq) {
      inq.status = status as any;
      if (counterPrice !== undefined) inq.counterPrice = counterPrice;
      if (message) inq.message = `${inq.message || ''}\n[Update]: ${message}`;

      if (status === 'DECLINED' || status === 'ARCHIVED') {
        // Move to history
        const activeRemaining = inquiries.filter((i) => i.id !== id);
        saveInquiries(activeRemaining);

        const history = getStoredHistory();
        history.unshift({ ...inq });
        saveHistory(history);
      } else {
        saveInquiries(inquiries);
      }
    }

    return inq;
  }
};
