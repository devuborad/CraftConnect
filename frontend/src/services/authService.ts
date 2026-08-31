import type { Role } from '../types';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  businessName?: string;
  city?: string;
  createdAt: string;
}

const STORAGE_KEY = 'craft_registered_users';
const CURRENT_USER_KEY = 'craft_current_user';

// Pre-seeded default demo accounts for instant login testing
const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'user-artisan-1',
    name: 'Meena Ben Vankar',
    email: 'meena@craftconnect.in',
    phone: '9825012345',
    password: 'password123',
    role: 'ARTISAN',
    businessName: 'Kutch Weavers Heritage',
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
      return JSON.parse(stored);
    } catch {
      return DEFAULT_USERS;
    }
  },

  registerUser: (userData: Omit<RegisteredUser, 'id' | 'createdAt'>): { success: boolean; message: string; user?: RegisteredUser } => {
    const users = authService.getUsers();

    // Check if email or phone is already registered
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPhone = userData.phone.replace(/\D/g, '');

    const existingUser = users.find((u) => {
      const userEmail = u.email.trim().toLowerCase();
      const userPhone = u.phone.replace(/\D/g, '');
      return (cleanEmail && userEmail === cleanEmail) || (cleanPhone && userPhone === cleanPhone);
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
      phone: userData.phone.trim(),
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

  loginUser: (emailOrPhone: string, passwordInput: string): { success: boolean; message: string; user?: RegisteredUser } => {
    const users = authService.getUsers();
    const cleanInput = emailOrPhone.trim().toLowerCase();
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

    if (foundUser.password !== passwordInput) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your password and try again.'
      };
    }

    // Save active session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));

    return {
      success: true,
      message: `Welcome back, ${foundUser.name}!`,
      user: foundUser
    };
  },

  getCurrentUser: (): RegisteredUser | null => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logoutUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
