import type { Role } from '../types';
import { api } from './api';
import { compressImage } from '../utils/imageCompressor';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: Role;
  businessName?: string;
  craftType?: string;
  experienceYears?: number;
  city?: string;
  location?: string;
  state?: string;
  bio?: string;
  avatar?: string;
  profileImage?: string;
  createdAt: string;
}

const STORAGE_KEY = 'craft_registered_users';
const CURRENT_USER_KEY = 'craft_current_user';

export const safeSetLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    console.warn(`[LocalStorage Quota Exceeded] Clearing legacy cache to store ${key}:`, err);
    try {
      localStorage.removeItem('craft_live_inquiries_orders');
      localStorage.setItem(key, value);
    } catch {
      // Ignore if quota still exceeded
    }
  }
};

// Pre-seeded default demo accounts including Admin
const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'usr-admin-dax',
    name: 'Dax Koladiya',
    email: 'ticketfordax@gmail.com',
    phone: '8141702217',
    password: 'DAX!@#$%^&',
    role: 'ADMIN',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-admin-dev',
    name: 'CraftConnect Admin',
    email: 'devborad22@gmail.com',
    phone: '+919876543210',
    password: '492320Devu$',
    role: 'ADMIN',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-artisan-1',
    name: 'Meena Ben Vankar',
    email: 'meena@craftconnect.in',
    phone: '9825012345',
    password: 'password123',
    role: 'ARTISAN',
    businessName: 'Kutch Weavers Heritage',
    craftType: 'Handloom & Patola',
    experienceYears: 18,
    city: 'Bhuj, Gujarat',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-buyer-1',
    name: 'Anita Sharma',
    email: 'anita@heritagecrafts.in',
    phone: '9820011223',
    password: 'password123',
    role: 'BUYER',
    businessName: 'Heritage Craft Boutique',
    city: 'Mumbai, Maharashtra',
    createdAt: new Date().toISOString()
  }
];

export const authService = {
  getUsers: (): RegisteredUser[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      const parsed: RegisteredUser[] = JSON.parse(stored);
      if (!parsed.some(u => u.email.toLowerCase() === 'ticketfordax@gmail.com')) {
        parsed.unshift(DEFAULT_USERS[0]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_USERS;
    }
  },

  registerUser: async (userData: Omit<RegisteredUser, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string; user?: RegisteredUser }> => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPhone = userData.phone.trim();

    // 1. Send to Backend API to save in MySQL database
    const apiRes = await api.register({
      name: userData.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password,
      role: userData.role.toLowerCase(),
      businessName: userData.businessName,
      companyName: userData.businessName,
      craftType: userData.craftType,
      experienceYears: userData.experienceYears,
      location: userData.city,
    });

    if (apiRes.success && apiRes.data) {
      const resData = apiRes.data as any;
      if (resData.token) {
        localStorage.setItem('craftconnect_token', resData.token);
      }
      const backendUser = resData.user || {};
      const newUser: RegisteredUser = {
        id: backendUser.id || `user-${Date.now()}`,
        name: backendUser.name || userData.name,
        email: backendUser.email || cleanEmail,
        phone: backendUser.phone || cleanPhone,
        role: (backendUser.role?.toUpperCase() as Role) || userData.role,
        businessName: userData.businessName,
        createdAt: new Date().toISOString()
      };

      const users = authService.getUsers();
      const updatedList = [newUser, ...users.filter(u => u.email !== cleanEmail)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

      return {
        success: true,
        message: 'Registration successful! Saved to MySQL database.',
        user: newUser
      };
    }

    // 2. Fallback local registration if backend offline
    const users = authService.getUsers();
    const existingUser = users.find((u) => {
      const uEmail = u.email.trim().toLowerCase();
      const uPhone = u.phone.replace(/\D/g, '');
      return (cleanEmail && uEmail === cleanEmail) || (cleanPhone && uPhone === cleanPhone.replace(/\D/g, ''));
    });

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this Email or Mobile number already exists. Please log in.'
      };
    }

    const newUser: RegisteredUser = {
      ...userData,
      id: `user-${Date.now()}`,
      email: cleanEmail,
      phone: cleanPhone,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newUser, ...users];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    return {
      success: true,
      message: 'Registration successful! Please sign in with your credentials.',
      user: newUser
    };
  },

  loginUser: async (emailOrPhone: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: RegisteredUser }> => {
    const cleanInput = emailOrPhone.trim().toLowerCase();
    const cleanPhone = emailOrPhone.replace(/\D/g, '');

    // Direct check for Admin user Dax Koladiya
    if ((cleanInput === 'ticketfordax@gmail.com' || cleanPhone === '8141702217') && passwordInput === 'DAX!@#$%^&') {
      const adminUser: RegisteredUser = {
        id: 'usr-admin-dax',
        name: 'Dax Koladiya',
        email: 'ticketfordax@gmail.com',
        phone: '8141702217',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      };

      api.login({ emailOrPhone: cleanInput, password: passwordInput }).then(res => {
        const resData = res.data as any;
        if (res.success && resData?.token) {
          localStorage.setItem('craftconnect_token', resData.token);
        }
      }).catch(() => {});

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return {
        success: true,
        message: 'Welcome back Admin Dax Koladiya!',
        user: adminUser
      };
    }

    // Direct check for Admin user devborad22@gmail.com
    if (cleanInput === 'devborad22@gmail.com' && passwordInput === '492320Devu$') {
      const adminUser: RegisteredUser = {
        id: 'usr-admin-dev',
        name: 'CraftConnect Admin',
        email: 'devborad22@gmail.com',
        phone: '+919876543210',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      };

      api.login({ emailOrPhone: cleanInput, password: passwordInput }).then(res => {
        const resData = res.data as any;
        if (res.success && resData?.token) {
          localStorage.setItem('craftconnect_token', resData.token);
        }
      }).catch(() => {});

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return {
        success: true,
        message: 'Welcome back Admin!',
        user: adminUser
      };
    }

    // 1. Attempt Backend Express + MySQL authentication
    const apiRes = await api.login({
      emailOrPhone: cleanInput,
      password: passwordInput
    });

    if (apiRes.success && apiRes.data) {
      const resData = apiRes.data as any;
      if (resData.token) {
        localStorage.setItem('craftconnect_token', resData.token);
      }
      const u = resData.user || {};
      const normalizedRole: Role = (u.role?.toUpperCase() as Role) || 'BUYER';
      const loggedInUser: RegisteredUser = {
        id: u.id || `user-${Date.now()}`,
        name: u.name || 'User',
        email: u.email || cleanInput,
        phone: u.phone || '',
        role: normalizedRole,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));

      return {
        success: true,
        message: `Welcome back, ${loggedInUser.name}!`,
        user: loggedInUser
      };
    }

    // 2. Fallback local user check
    const users = authService.getUsers();
    const numericInput = emailOrPhone.replace(/\D/g, '');

    const foundUser = users.find((u) => {
      const uEmail = u.email.trim().toLowerCase();
      const uPhone = u.phone.replace(/\D/g, '');
      const matchesId = (cleanInput && uEmail === cleanInput) || (numericInput && numericInput.length >= 8 && uPhone === numericInput);
      return matchesId;
    });

    if (!foundUser) {
      return {
        success: false,
        message: 'No registered account found with this Email or Mobile number. Please check or register first.'
      };
    }

    if (foundUser.password && foundUser.password !== passwordInput) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your password and try again.'
      };
    }

    const normalizedUser: RegisteredUser = {
      ...foundUser,
      role: (foundUser.role.toUpperCase() as Role)
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedUser));

    return {
      success: true,
      message: `Welcome back, ${normalizedUser.name}!`,
      user: normalizedUser
    };
  },

  updateUserProfile: async (updatedData: Partial<RegisteredUser>): Promise<{ success: boolean; message: string; user?: RegisteredUser }> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'No user is currently signed in.' };
    }

    const rawAvatar = updatedData.profileImage || updatedData.avatar;
    let newAvatar = rawAvatar;
    if (rawAvatar && rawAvatar.length > 500000) {
      try {
        newAvatar = await compressImage(rawAvatar);
      } catch {
        newAvatar = rawAvatar;
      }
    }

    // 1. Send update to Backend MySQL API
    const apiRes = await api.updateProfile({
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      password: updatedData.password,
      businessName: updatedData.businessName,
      craftType: updatedData.craftType,
      experienceYears: updatedData.experienceYears,
      location: updatedData.city,
      bio: updatedData.bio,
      profileImage: newAvatar,
      avatar: newAvatar,
    });

    if (apiRes.success && apiRes.data) {
      const resData = apiRes.data as any;
      if (resData.token) {
        safeSetLocalStorage('craftconnect_token', resData.token);
      }
      const backendUser = resData.user || {};
      const finalImg = backendUser.avatar || backendUser.profileImage || newAvatar || currentUser.avatar || currentUser.profileImage;
      const newUser: RegisteredUser = {
        ...currentUser,
        ...updatedData,
        id: backendUser.id || currentUser.id,
        name: backendUser.name || updatedData.name || currentUser.name,
        email: backendUser.email || updatedData.email || currentUser.email,
        phone: backendUser.phone || updatedData.phone || currentUser.phone,
        businessName: backendUser.businessName || updatedData.businessName || currentUser.businessName,
        craftType: backendUser.craftType || updatedData.craftType || currentUser.craftType,
        experienceYears: backendUser.experienceYears || updatedData.experienceYears || currentUser.experienceYears,
        city: backendUser.city || backendUser.location || updatedData.city || currentUser.city,
        bio: backendUser.bio || updatedData.bio || currentUser.bio,
        avatar: finalImg,
        profileImage: finalImg,
        password: updatedData.password || currentUser.password,
      };

      safeSetLocalStorage(CURRENT_USER_KEY, JSON.stringify(newUser));
      const allUsers = authService.getUsers();
      const updatedAll = allUsers.map(u => u.id === newUser.id || (u.email && u.email === newUser.email) ? newUser : u);
      safeSetLocalStorage(STORAGE_KEY, JSON.stringify(updatedAll));

      return {
        success: true,
        message: 'Profile and database updated successfully! 🎉',
        user: newUser
      };
    }

    // 2. Fallback local update
    const finalImg = newAvatar || currentUser.avatar || currentUser.profileImage;
    const newUser: RegisteredUser = {
      ...currentUser,
      ...updatedData,
      avatar: finalImg,
      profileImage: finalImg,
    };
    safeSetLocalStorage(CURRENT_USER_KEY, JSON.stringify(newUser));
    const allUsers = authService.getUsers();
    const updatedAll = allUsers.map(u => u.id === newUser.id ? newUser : u);
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(updatedAll));

    return {
      success: true,
      message: 'Profile updated successfully.',
      user: newUser
    };
  },

  getCurrentUser: (): RegisteredUser | null => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  logoutUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('craftconnect_token');
  }
};
