const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch wrapper supporting JWT authorization and error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = localStorage.getItem('craftconnect_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.warn(`[API Client] Request to ${endpoint} failed, utilizing local state fallback:`, err.message);
    return {
      success: false,
      message: err.message || 'Network request failed',
    };
  }
}

export const api = {
  // Auth
  register: (userData: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/me'),
  getBuyerProfile: () => apiRequest('/buyers/profile/me'),
  updateBuyerProfile: (data: any) => apiRequest('/buyers/profile/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Products
  getProducts: (params: string = '') => apiRequest(`/products?${params}`),
  getProductById: (id: string) => apiRequest(`/products/${id}`),
  createProduct: (productData: any) => apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) }),
  incrementView: (id: string) => apiRequest(`/products/${id}/view`, { method: 'POST' }),

  // Categories
  getCategories: () => apiRequest('/categories'),

  // Bulk Inquiries
  createInquiry: (inquiryData: any) => apiRequest('/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) }),
  getInquiries: () => apiRequest('/inquiries'),
  updateInquiryStatus: (id: string, status: string, counterPrice?: number) =>
    apiRequest(`/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, counterPrice }) }),

  // Cart & Orders
  getCart: () => apiRequest('/cart'),
  addToCart: (productId: string, quantity: number = 1) => apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  createOrder: (orderData: any) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) }),

  // AI & Pricing
  getPricingRecommendation: (costData: any) => apiRequest('/pricing/recommend', { method: 'POST', body: JSON.stringify(costData) }),
  enhanceImage: (imageUrl: string) => apiRequest('/ai/image-enhance', { method: 'POST', body: JSON.stringify({ imageUrl }) }),
  generateCatalogue: (voiceData: any) => apiRequest('/ai/catalog', { method: 'POST', body: JSON.stringify(voiceData) }),
  sendCraftMateMessage: (message: string) => apiRequest('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  // Admin
  getAdminStats: () => apiRequest('/admin/dashboard'),
  getAdminArtisans: () => apiRequest('/admin/artisans'),
  getAdminBuyers: () => apiRequest('/admin/buyers'),
  getAdminProducts: () => apiRequest('/admin/products'),
  moderateProduct: (id: string, status: string) => apiRequest(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
