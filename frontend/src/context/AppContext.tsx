import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, LanguageCode, Product, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../services/mockData';
import { translations } from '../services/translations';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  savedProductIds: string[];
  toggleSaveProduct: (productId: string) => void;
  activeArtisanId: string;
  demoProduct: Product | null;
  setDemoProduct: (product: Product | null) => void;
  
  // Translation function
  t: (key: string) => string;

  // Cart State & Methods
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('GUEST');
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('craft_lang') as LanguageCode;
    return saved || 'gu'; // Default to Gujarati or saved
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>(['prod-1', 'prod-3']);
  const [demoProduct, setDemoProduct] = useState<Product | null>(null);

  // Initial cart populated with 1 demo product for smooth testing
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: MOCK_PRODUCTS[0], quantity: 1 }
  ]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('craft_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const activeArtisanId = 'artisan-1'; // Default Meena Ben Vankar

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    showToast(`Role switched to ${newRole}`, `Now testing ${newRole} experience`, 'info');
  };

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSaveProduct = (productId: string) => {
    setSavedProductIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Saved Crafts', '', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your collection ❤️', '', 'success');
        return [...prev, productId];
      }
    });
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        showToast(`Updated "${product.title}" in Cart (${newQty} units)`, 'Buyer Craft Basket', 'success');
        return updated;
      } else {
        showToast(`Added "${product.title}" to Cart!`, 'Direct Artisan Sourcing', 'success');
        return [...prev, { product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        showToast(`Removed "${item.product.title}" from Cart`, '', 'info');
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        toasts,
        showToast,
        removeToast,
        savedProductIds,
        toggleSaveProduct,
        activeArtisanId,
        demoProduct,
        setDemoProduct,
        t,
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
