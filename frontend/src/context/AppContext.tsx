import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Role, LanguageCode, Product, CartItem, AppNotification } from '../types';
import { authService } from '../services/authService';
import type { RegisteredUser } from '../services/authService';
import { MOCK_PRODUCTS } from '../services/mockData';
import { translations } from '../services/translations';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // BUYER NOTIFICATIONS
  {
    id: 'notif-b1',
    targetRole: 'BUYER',
    title: 'Order Confirmed 🎉',
    message: 'Your bulk order for Kutch Handwoven Shawls (#ORD-9021) has been accepted by Meena Ben Vankar.',
    timestamp: '10m ago',
    type: 'order',
    isRead: false,
    link: '/buyer/dashboard'
  },
  {
    id: 'notif-b2',
    targetRole: 'BUYER',
    title: 'Artisan Counter Offer 💬',
    message: 'Ramesh Prajapati replied to your bulk inquiry for Terracotta Vases with a target price quote.',
    timestamp: '1h ago',
    type: 'inquiry',
    isRead: false,
    link: '/buyer/dashboard'
  },
  {
    id: 'notif-b3',
    targetRole: 'BUYER',
    title: 'Direct Artisan Price Drop 🏷️',
    message: 'Jaipur Blue Pottery Dinner Set is now available at direct artisan wholesale discount.',
    timestamp: '5h ago',
    type: 'price',
    isRead: true,
    link: '/marketplace'
  },
  {
    id: 'notif-b4',
    targetRole: 'BUYER',
    title: 'AI Sourcing Update 🤖',
    message: 'CraftConnect AI matched 3 new verified master handloom weavers to your boutique requirements.',
    timestamp: '1d ago',
    type: 'ai',
    isRead: true,
    link: '/marketplace'
  },

  // ARTISAN NOTIFICATIONS
  {
    id: 'notif-a1',
    targetRole: 'ARTISAN',
    title: 'New Bulk Inquiry Received 📦',
    message: 'Anita Sharma (Heritage Craft Boutique) sent a bulk quote request for 50 Ajrakh Shawls.',
    timestamp: '5m ago',
    type: 'inquiry',
    isRead: false,
    link: '/artisan/inquiries'
  },
  {
    id: 'notif-a2',
    targetRole: 'ARTISAN',
    title: 'AI Craft Pricing Advice 💡',
    message: 'CraftConnect AI engine recommends pricing your Hand-painted Terracotta Pot at ₹850 (+30% profit margin).',
    timestamp: '2h ago',
    type: 'ai',
    isRead: false,
    link: '/artisan/dashboard'
  },
  {
    id: 'notif-a3',
    targetRole: 'ARTISAN',
    title: 'Product Craft Verified ✅',
    message: 'Your Kutch Handloom Shawl was certified as 100% Authentic Handloom by GI Master Tag.',
    timestamp: '1d ago',
    type: 'system',
    isRead: true,
    link: '/artisan/dashboard'
  },
  {
    id: 'notif-a4',
    targetRole: 'ARTISAN',
    title: '5-Star Buyer Review ⭐',
    message: 'Boutique Buyer Anita left a 5-star review: "Superior quality weaving, direct from village artisan!"',
    timestamp: '2d ago',
    type: 'order',
    isRead: true,
    link: '/artisan/profile/artisan-1'
  }
];

interface AppContextType {
  role: Role;
  setRole: (role: Role, user?: RegisteredUser) => void;
  currentUser: RegisteredUser | null;
  setCurrentUser: (user: RegisteredUser | null) => void;
  userName: string;
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

  // Notification State & Methods
  notifications: AppNotification[];
  unreadNotifCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notif: {
    targetRole: Role | 'ALL';
    title: string;
    message: string;
    type?: 'order' | 'inquiry' | 'price' | 'system' | 'ai';
    link?: string;
    id?: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<RegisteredUser | null>(() => {
    return authService.getCurrentUser();
  });
  
  const [role, setRoleState] = useState<Role>(() => {
    const savedUser = authService.getCurrentUser();
    return savedUser ? savedUser.role : 'GUEST';
  });

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

  // Notifications state
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const setCurrentUser = (user: RegisteredUser | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('craft_current_user', JSON.stringify(user));
      setRoleState(user.role);
    } else {
      localStorage.removeItem('craft_current_user');
      setRoleState('GUEST');
    }
  };

  const setRole = (newRole: Role, user?: RegisteredUser) => {
    setRoleState(newRole);
    if (user) {
      setCurrentUser(user);
    } else {
      // Find matching seed user or update current user role
      if (currentUser) {
        setCurrentUserState({ ...currentUser, role: newRole });
      } else {
        const matchingSeed = authService.getUsers().find((u) => u.role === newRole);
        if (matchingSeed) {
          setCurrentUserState(matchingSeed);
        }
      }
    }
  };

  const userName = useMemo(() => {
    if (currentUser && currentUser.name) {
      return currentUser.name;
    }
    if (role === 'BUYER') return 'Anita Sharma';
    if (role === 'ARTISAN') return 'Meena Ben Vankar';
    if (role === 'ADMIN') return 'Admin Master';
    return 'Guest User';
  }, [currentUser, role]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('craft_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const activeArtisanId = 'artisan-1';

  // Filter notifications for active role with deduplication guarantee
  const notifications = useMemo(() => {
    const rawList = allNotifications.filter((n) => {
      if (role === 'GUEST') return true;
      if (role === 'ADMIN') return true;
      return n.targetRole === role || n.targetRole === 'ALL';
    });

    // Deduplicate by ID to prevent any duplicate/double notification rendering
    const map = new Map<string, AppNotification>();
    for (const item of rawList) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  }, [allNotifications, role]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setAllNotifications((prev) =>
      prev.map((n) => {
        if (role === 'GUEST' || role === 'ADMIN' || n.targetRole === role || n.targetRole === 'ALL') {
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  const clearAllNotifications = () => {
    setAllNotifications((prev) =>
      prev.filter((n) => {
        if (role === 'GUEST' || role === 'ADMIN') return false;
        return n.targetRole !== role && n.targetRole !== 'ALL';
      })
    );
    showToast('Notifications Cleared', 'All live notifications removed for this account', 'info');
  };

  const removeNotification = (id: string) => {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (notif: {
    targetRole: Role | 'ALL';
    title: string;
    message: string;
    type?: 'order' | 'inquiry' | 'price' | 'system' | 'ai';
    link?: string;
    id?: string;
  }) => {
    const id = notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setAllNotifications((prev) => {
      // Prevent duplicates
      if (prev.some((n) => n.id === id)) return prev;

      const newNotif: AppNotification = {
        id,
        targetRole: notif.targetRole,
        title: notif.title,
        message: notif.message,
        timestamp: 'Just now',
        type: notif.type || 'system',
        isRead: false,
        link: notif.link
      };
      return [newNotif, ...prev];
    });
  };

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToasts((prev) => {
      // Prevent duplicate toasts with identical title and message
      if (prev.some((t) => t.title === title && t.message === message)) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setTimeout(() => {
        removeToast(id);
      }, 3500);
      return [...prev, { id, title, message, type }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSaveProduct = (productId: string) => {
    let isSavedNow = false;
    setSavedProductIds((prev) => {
      const exists = prev.includes(productId);
      isSavedNow = !exists;
      if (exists) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });

    if (isSavedNow) {
      showToast('Saved to your collection ❤️', '', 'success');
    } else {
      showToast('Removed from Saved Crafts', '', 'info');
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    let toastTitle = '';
    let toastMsg = '';

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        toastTitle = `Updated "${product.title}" in Cart (${newQty} units)`;
        toastMsg = 'Buyer Craft Basket';
        return updated;
      } else {
        toastTitle = `Added "${product.title}" to Cart!`;
        toastMsg = 'Direct Artisan Sourcing';
        return [...prev, { product, quantity }];
      }
    });

    if (toastTitle) {
      showToast(toastTitle, toastMsg, 'success');
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    let updatedTitle = '';
    let updatedQty = quantity;

    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          updatedTitle = item.product.title;
          updatedQty = quantity;
          return { ...item, quantity };
        }
        return item;
      });
    });

    if (updatedTitle) {
      showToast(`Updated "${updatedTitle}" in Cart (${updatedQty} units)`, 'Buyer Craft Basket', 'success');
    }
  };

  const removeFromCart = (productId: string) => {
    let removedTitle = '';

    setCartItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        removedTitle = item.product.title;
      }
      return prev.filter((i) => i.product.id !== productId);
    });

    if (removedTitle) {
      showToast(`Removed "${removedTitle}" from Cart`, '', 'info');
    }
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
        currentUser,
        setCurrentUser,
        userName,
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
        cartSubtotal,
        notifications,
        unreadNotifCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        removeNotification,
        addNotification
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
