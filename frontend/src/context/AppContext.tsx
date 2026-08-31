import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, LanguageCode, Product } from '../types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('GUEST');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>(['prod-1', 'prod-3']);
  const [demoProduct, setDemoProduct] = useState<Product | null>(null);

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
        setDemoProduct
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
