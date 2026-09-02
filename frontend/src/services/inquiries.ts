import type { BulkInquiry } from '../types';
import { MOCK_INQUIRIES } from './mockData';
import { api } from './api';

export const inquiryService = {
  getInquiries: async (): Promise<BulkInquiry[]> => {
    try {
      const res = await api.getInquiries();
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.warn('Backend getInquiries fallback:', e);
    }
    return [...MOCK_INQUIRIES];
  },

  getInquiriesByArtisan: async (artisanId: string): Promise<BulkInquiry[]> => {
    try {
      const res = await api.getInquiries();
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.warn('Backend getInquiriesByArtisan fallback:', e);
    }
    return MOCK_INQUIRIES.filter((i) => i.artisanId === artisanId);
  },

  sendInquiry: async (newInquiry: Partial<BulkInquiry>): Promise<BulkInquiry> => {
    try {
      const res = await api.createInquiry({
        productId: newInquiry.productId,
        quantity: newInquiry.quantity || 10,
        targetPrice: newInquiry.targetPrice || 0,
        targetBudget: newInquiry.targetPrice || 0,
        message: newInquiry.message || 'Bulk inquiry request',
        deliveryLocation: newInquiry.deliveryLocation || 'India',
      });

      if (res.success && res.data) {
        const created: BulkInquiry = {
          id: res.data.id || `inq-${Date.now()}`,
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
        MOCK_INQUIRIES.unshift(created);
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

    MOCK_INQUIRIES.unshift(created);
    return created;
  },

  updateStatus: async (id: string, status: 'ACCEPTED' | 'COUNTERED' | 'DECLINED', counterPrice?: number): Promise<BulkInquiry | undefined> => {
    try {
      await api.updateInquiryStatus(id, status, counterPrice);
    } catch (e) {
      console.warn('Backend updateStatus fallback:', e);
    }
    const inq = MOCK_INQUIRIES.find((i) => i.id === id);
    if (inq) {
      inq.status = status;
      if (counterPrice) inq.counterPrice = counterPrice;
    }
    return inq;
  }
};
