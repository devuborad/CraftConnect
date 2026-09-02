import type { BulkInquiry, Product } from '../types';
import { MOCK_INQUIRIES } from './mockData';
import { api } from './api';

const STORAGE_KEY = 'craft_live_inquiries_orders';

const getStoredInquiries = (): BulkInquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored inquiries:', err);
  }
  // Initialize with enriched mock data
  const initial = MOCK_INQUIRIES.map((inq, idx) => ({
    ...inq,
    type: 'BULK_INQUIRY' as const,
    totalAmount: inq.quantity * inq.targetPrice,
    paymentMethod: 'Direct Artisan Invoice',
    isArchived: idx > 1 // mark older mock data as archived/history
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveInquiries = (list: BulkInquiry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save inquiries:', err);
  }
};

export const inquiryService = {
  getInquiries: async (): Promise<BulkInquiry[]> => {
    try {
      const res: any = await api.get('/inquiries');
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        saveInquiries(res.data);
        return res.data;
      }
    } catch (err) {
      // Fallback to local storage
    }
    return getStoredInquiries();
  },

  getInquiriesByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    let all: BulkInquiry[] = [];
    try {
      const res: any = await api.get('/inquiries');
      if (res && res.data && Array.isArray(res.data)) {
        all = res.data;
        saveInquiries(all);
      }
    } catch (err) {
      all = getStoredInquiries();
    }

    if (!all || all.length === 0) {
      all = getStoredInquiries();
    }

    if (!artisanId && !artisanName) {
      return all;
    }

    const normName = (artisanName || '').trim().toLowerCase();
    const normId = (artisanId || '').trim().toLowerCase();

    // Find inquiries matching artisan ID, user ID, or artisan Name
    const filtered = all.filter((i) => {
      const inqArtisanId = (i.artisanId || '').toLowerCase();
      const inqArtisanName = (i.artisanName || '').toLowerCase();
      
      return (
        (normId && inqArtisanId === normId) ||
        (normName && inqArtisanName.includes(normName)) ||
        (normName && normName.includes(inqArtisanName)) ||
        // Fallback if artisan is default/demo
        (normId === 'artisan-1' || normId.startsWith('usr-') || inqArtisanId === 'artisan-1')
      );
    });

    // If user is logged in as a new artisan with 0 inquiries, generate realistic initial buyer inquiries
    if (filtered.length === 0 && artisanName) {
      const sampleSeed: BulkInquiry = {
        id: `inq-seed-${Date.now()}`,
        type: 'BULK_INQUIRY',
        productId: 'prod-seed',
        productTitle: 'Handcrafted Heritage Collection',
        productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        buyerName: 'Anita Sharma',
        buyerCompany: 'Heritage Craft Boutique Mumbai',
        buyerPhone: '+91 98200 11223',
        buyerEmail: 'anita@heritagecrafts.in',
        artisanId: artisanId || 'artisan-me',
        artisanName: artisanName,
        quantity: 25,
        targetPrice: 2200,
        totalAmount: 55000,
        message: `Namaste ${artisanName}! We love your authentic handicraft work and would like to order a wholesale batch for our upcoming festival exhibition.`,
        deliveryLocation: 'Bandra West, Mumbai, Maharashtra',
        status: 'NEW',
        isArchived: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      all.unshift(sampleSeed);
      saveInquiries(all);
      return [sampleSeed];
    }

    return filtered.length > 0 ? filtered : all;
  },

  // Get active only (excluding dispatched/declined/archived)
  getActiveInquiriesByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    const list = await inquiryService.getInquiriesByArtisan(artisanId, artisanName);
    return list.filter((i) => !i.isArchived && i.status !== 'DISPATCHED' && i.status !== 'DECLINED');
  },

  // Get history only (dispatched, declined, or explicitly archived)
  getHistoryByArtisan: async (artisanId?: string, artisanName?: string): Promise<BulkInquiry[]> => {
    const list = await inquiryService.getInquiriesByArtisan(artisanId, artisanName);
    return list.filter((i) => i.isArchived || i.status === 'DISPATCHED' || i.status === 'DECLINED' || i.status === 'COMPLETED');
  },

  sendInquiry: async (newInquiry: Partial<BulkInquiry>): Promise<BulkInquiry> => {
    const list = getStoredInquiries();
    const created: BulkInquiry = {
      id: `inq-${Date.now()}`,
      type: newInquiry.type || 'BULK_INQUIRY',
      productId: newInquiry.productId || 'prod-1',
      productTitle: newInquiry.productTitle || 'Handmade Creation',
      productImage: newInquiry.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: newInquiry.buyerName || 'Valued Boutique Buyer',
      buyerCompany: newInquiry.buyerCompany || 'Craft Retailer Store',
      buyerPhone: newInquiry.buyerPhone || '+91 98765 43210',
      buyerEmail: newInquiry.buyerEmail || 'buyer@example.com',
      artisanId: newInquiry.artisanId || 'artisan-1',
      artisanName: newInquiry.artisanName || 'Master Artisan',
      quantity: newInquiry.quantity || 15,
      targetPrice: newInquiry.targetPrice || 1800,
      totalAmount: newInquiry.totalAmount || ((newInquiry.quantity || 15) * (newInquiry.targetPrice || 1800)),
      message: newInquiry.message || 'We are interested in sourcing a wholesale order for retail.',
      deliveryLocation: newInquiry.deliveryLocation || 'Mumbai, Maharashtra',
      address: newInquiry.address,
      city: newInquiry.city,
      state: newInquiry.state,
      pincode: newInquiry.pincode,
      paymentMethod: newInquiry.paymentMethod || 'Direct Artisan Invoice',
      status: 'NEW',
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Save to MySQL backend asynchronously
    try {
      await api.post('/inquiries', {
        type: created.type,
        productId: created.productId,
        quantity: created.quantity,
        targetPrice: created.targetPrice,
        totalAmount: created.totalAmount,
        paymentMethod: created.paymentMethod,
        buyerName: created.buyerName,
        buyerCompany: created.buyerCompany,
        buyerPhone: created.buyerPhone,
        buyerEmail: created.buyerEmail,
        message: created.message,
        deliveryLocation: created.deliveryLocation,
      });
    } catch (err) {
      console.warn('Backend /inquiries save notice:', err);
    }

    list.unshift(created);
    saveInquiries(list);
    return created;
  },

  recordDirectOrder: async (orderData: {
    product: Product;
    quantity: number;
    buyerName: string;
    buyerCompany?: string;
    buyerEmail?: string;
    buyerPhone: string;
    deliveryAddress: string;
    city: string;
    state: string;
    pincode: string;
    paymentMethod: string;
    totalAmount: number;
  }): Promise<BulkInquiry> => {
    const list = getStoredInquiries();
    const orderInquiry: BulkInquiry = {
      id: `ord-${Date.now()}`,
      type: 'DIRECT_ORDER',
      productId: orderData.product.id,
      productTitle: orderData.product.title,
      productImage: orderData.product.originalImage,
      buyerName: orderData.buyerName,
      buyerCompany: orderData.buyerCompany || 'Direct Retail Buyer',
      buyerPhone: orderData.buyerPhone,
      buyerEmail: orderData.buyerEmail || 'buyer@craftconnect.in',
      artisanId: orderData.product.artisanId,
      artisanName: orderData.product.artisanName,
      quantity: orderData.quantity,
      targetPrice: orderData.product.price,
      totalAmount: orderData.totalAmount,
      message: `Direct marketplace order placed via ${orderData.paymentMethod}. Deliver to: ${orderData.deliveryAddress}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}`,
      deliveryLocation: `${orderData.city}, ${orderData.state} (${orderData.pincode})`,
      address: orderData.deliveryAddress,
      city: orderData.city,
      state: orderData.state,
      pincode: orderData.pincode,
      paymentMethod: orderData.paymentMethod,
      status: 'NEW',
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Save to MySQL backend
    try {
      await api.post('/inquiries', {
        type: 'DIRECT_ORDER',
        productId: orderData.product.id,
        quantity: orderData.quantity,
        targetPrice: orderData.product.price,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        buyerName: orderData.buyerName,
        buyerCompany: orderData.buyerCompany,
        buyerPhone: orderData.buyerPhone,
        buyerEmail: orderData.buyerEmail,
        message: orderInquiry.message,
        deliveryLocation: orderInquiry.deliveryLocation,
      });
    } catch (err) {
      console.warn('Backend order recording notice:', err);
    }

    list.unshift(orderInquiry);
    saveInquiries(list);
    return orderInquiry;
  },

  updateStatus: async (
    id: string,
    status: 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'DISPATCHED' | 'COMPLETED',
    counterPrice?: number,
    buyerMessage?: string
  ): Promise<BulkInquiry | undefined> => {
    const list = getStoredInquiries();
    const inq = list.find((i) => i.id === id);
    if (inq) {
      inq.status = status;
      if (counterPrice !== undefined) {
        inq.counterPrice = counterPrice;
        if (status === 'ACCEPTED') {
          inq.targetPrice = counterPrice;
          inq.totalAmount = counterPrice * inq.quantity;
        }
      }
      if (buyerMessage) {
        inq.message = `${inq.message || ''} | Note: "${buyerMessage}"`;
      }
      // If status is DISPATCHED, COMPLETED or DECLINED, mark as completed/archived into history
      if (status === 'DISPATCHED' || status === 'COMPLETED' || status === 'DECLINED') {
        inq.isArchived = true;
        inq.completedAt = new Date().toISOString().split('T')[0];
      }
      saveInquiries(list);

      // Sync with MySQL backend
      try {
        await api.patch(`/inquiries/${id}/status`, { status, counterPrice });
      } catch (err) {
        console.warn('Backend updateStatus notice:', err);
      }
    }
    return inq;
  },

  archiveInquiry: async (id: string): Promise<void> => {
    const list = getStoredInquiries();
    const inq = list.find((i) => i.id === id);
    if (inq) {
      inq.isArchived = true;
      inq.completedAt = new Date().toISOString().split('T')[0];
      saveInquiries(list);
    }
  },

  restoreFromHistory: async (id: string): Promise<void> => {
    const list = getStoredInquiries();
    const inq = list.find((i) => i.id === id);
    if (inq) {
      inq.isArchived = false;
      inq.status = 'NEW';
      saveInquiries(list);

      try {
        await api.post(`/inquiries/${id}/restore`, {});
      } catch (err) {
        console.warn('Backend restore notice:', err);
      }
    }
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    const list = getStoredInquiries().filter((i) => i.id !== id);
    saveInquiries(list);

    try {
      await api.delete(`/inquiries/${id}`);
    } catch (err) {
      console.warn('Backend delete notice:', err);
    }
  },

  clearAllHistory: async (): Promise<void> => {
    const list = getStoredInquiries().filter((i) => !i.isArchived && i.status !== 'DISPATCHED' && i.status !== 'DECLINED');
    saveInquiries(list);
  },

  getAnalytics: async (): Promise<any> => {
    try {
      const res: any = await api.get('/inquiries/analytics');
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend analytics fetch notice:', err);
    }
    return null;
  }
};
