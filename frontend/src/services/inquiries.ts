import type { BulkInquiry } from '../types';
import { MOCK_INQUIRIES } from './mockData';

export const inquiryService = {
  getInquiries: async (): Promise<BulkInquiry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_INQUIRIES]), 300);
    });
  },

  getInquiriesByArtisan: async (artisanId: string): Promise<BulkInquiry[]> => {
    return new Promise((resolve) => {
      const list = MOCK_INQUIRIES.filter((i) => i.artisanId === artisanId);
      setTimeout(() => resolve(list), 200);
    });
  },

  sendInquiry: async (newInquiry: Partial<BulkInquiry>): Promise<BulkInquiry> => {
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
    const inq = MOCK_INQUIRIES.find((i) => i.id === id);
    if (inq) {
      inq.status = status;
      if (counterPrice) inq.counterPrice = counterPrice;
    }
    return inq;
  }
};
