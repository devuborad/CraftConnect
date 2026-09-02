import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { ENV } from '../config/env.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role = 'artisan', language = 'en', businessName, companyName, craftType, location, experienceYears } = req.body;

    if (!name || (!email && !phone) || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, password, and either email or phone number are required.',
        error: { code: 'VALIDATION_ERROR' },
      });
      return;
    }

    // Check existing user
    const [existing]: any = await db.execute(
      `SELECT id FROM users WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?)`,
      [email || null, phone || null]
    );

    if (existing && existing.length > 0) {
      res.status(409).json({
        success: false,
        message: 'A user with this email or phone number already exists.',
        error: { code: 'DUPLICATE_USER' },
      });
      return;
    }

    const userId = cryptoRandomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    await db.execute(
      `INSERT INTO users (id, name, email, phone, password_hash, role, language, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [userId, name, email || null, phone || null, passwordHash, role, language]
    );

    let artisanId: string | undefined;
    let buyerId: string | undefined;

    if (role === 'artisan') {
      artisanId = cryptoRandomUUID();
      const expYears = parseInt(String(experienceYears || '1'), 10) || 1;
      await db.execute(
        `INSERT INTO artisans (id, user_id, business_name, location, craft_type, experience_years, is_verified, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [artisanId, userId, businessName || `${name}'s Craft Studio`, location || 'Gujarat', craftType || 'Handloom & Handicrafts', expYears]
      );
    } else if (role === 'buyer') {
      buyerId = cryptoRandomUUID();
      await db.execute(
        `INSERT INTO buyers (id, user_id, company_name, location, buyer_type, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 'individual', NOW(), NOW())`,
        [buyerId, userId, companyName || `${name} Collection`, location || 'India']
      );
    }

    const isArtisan = role === 'artisan' || Boolean(artisanId);
    const isBuyer = role === 'buyer' || Boolean(buyerId);

    const payload = {
      id: userId,
      name,
      email,
      phone,
      role,
      userType: isArtisan ? 'ARTISAN' : isBuyer ? 'BUYER' : 'ADMIN',
      isArtisan,
      isBuyer,
      artisanId,
      buyerId,
      businessName,
      companyName,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: payload,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to register user.',
      error: { code: 'SERVER_ERROR' },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({
        success: false,
        message: 'Email/Phone and password are required.',
        error: { code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const cleanInput = emailOrPhone.trim().toLowerCase();

    // Special auto-detect for Admin user devborad22@gmail.com
    if (cleanInput === 'devborad22@gmail.com' && password === '492320Devu$') {
      let [adminRows]: any = await db.execute(`SELECT * FROM users WHERE LOWER(email) = 'devborad22@gmail.com'`);
      let adminId = 'usr-admin-dev';

      if (!adminRows || adminRows.length === 0) {
        const passwordHash = await bcrypt.hash('492320Devu$', 10);
        await db.execute(
          `INSERT INTO users (id, name, email, phone, password_hash, role, language, status, created_at, updated_at)
           VALUES (?, 'CraftConnect Admin', 'devborad22@gmail.com', '+919876543210', ?, 'admin', 'en', 'active', NOW(), NOW())`,
          [adminId, passwordHash]
        );
      } else {
        adminId = adminRows[0].id;
      }

      const payload = {
        id: adminId,
        name: 'CraftConnect Admin',
        email: 'devborad22@gmail.com',
        phone: '+919876543210',
        role: 'admin',
        userType: 'ADMIN',
        isArtisan: false,
        isBuyer: false,
      };

      const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        message: 'Admin login successful.',
        data: {
          token,
          user: payload,
        },
      });
      return;
    }

    const [rows]: any = await db.execute(
      `SELECT u.*, a.id as artisan_id, a.business_name, a.craft_type, b.id as buyer_id, b.company_name 
       FROM users u 
       LEFT JOIN artisans a ON u.id = a.user_id 
       LEFT JOIN buyers b ON u.id = b.user_id 
       WHERE LOWER(u.email) = ? OR u.phone = ?`,
      [cleanInput, emailOrPhone]
    );

    if (!rows || rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
        error: { code: 'INVALID_CREDENTIALS' },
      });
      return;
    }

    const user = rows[0];

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact admin.',
        error: { code: 'ACCOUNT_SUSPENDED' },
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
        error: { code: 'INVALID_CREDENTIALS' },
      });
      return;
    }

    const isArtisan = user.role === 'artisan' || Boolean(user.artisan_id);
    const isBuyer = user.role === 'buyer' || Boolean(user.buyer_id);

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userType: isArtisan ? 'ARTISAN' : isBuyer ? 'BUYER' : 'ADMIN',
      isArtisan,
      isBuyer,
      artisanId: user.artisan_id || undefined,
      buyerId: user.buyer_id || undefined,
      businessName: user.business_name || undefined,
      companyName: user.company_name || undefined,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: payload,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate user.',
      error: { code: 'SERVER_ERROR' },
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const [rows]: any = await db.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.language, u.status, u.created_at,
              a.id as artisan_id, a.business_name, a.craft_type, a.location as artisan_location, a.state as artisan_state, a.experience_years, a.bio as artisan_bio, a.profile_image, a.is_verified,
              b.id as buyer_id, b.company_name, b.location as buyer_location, b.buyer_type
       FROM users u 
       LEFT JOIN artisans a ON u.id = a.user_id 
       LEFT JOIN buyers b ON u.id = b.user_id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const r = rows[0];
    const isArtisan = r.role === 'artisan' || Boolean(r.artisan_id);
    const isBuyer = r.role === 'buyer' || Boolean(r.buyer_id);

    const data = {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      userType: isArtisan ? 'ARTISAN' : isBuyer ? 'BUYER' : 'ADMIN',
      isArtisan,
      isBuyer,
      language: r.language,
      status: r.status,
      createdAt: r.created_at,
      artisanProfile: isArtisan ? {
        artisanId: r.artisan_id,
        businessName: r.business_name,
        craftType: r.craft_type,
        location: r.artisan_location,
        state: r.artisan_state,
        experienceYears: r.experience_years,
        bio: r.artisan_bio,
        profileImage: r.profile_image,
        isVerified: Boolean(r.is_verified),
      } : null,
      buyerProfile: isBuyer ? {
        buyerId: r.buyer_id,
        companyName: r.company_name,
        location: r.buyer_location,
        buyerType: r.buyer_type,
      } : null,
    };

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('getMe DB error, using mock fallback:', err.message);
    if (req.user) {
      res.json({
        success: true,
        data: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          buyerProfile: {
             buyerId: req.user.buyerId,
             companyName: (req.user as any).companyName || (req.user as any).businessName || '',
          },
          artisanProfile: {
             artisanId: req.user.artisanId,
             businessName: (req.user as any).businessName || '',
          }
        }
      });
      return;
    }
    res.status(500).json({ success: false, message: 'Error retrieving user details' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.language, u.status, u.created_at,
              a.id as artisan_id, a.business_name, a.craft_type, a.location as artisan_location, a.state as artisan_state,
              b.id as buyer_id, b.company_name, b.location as buyer_location
       FROM users u 
       LEFT JOIN artisans a ON u.id = a.user_id 
       LEFT JOIN buyers b ON u.id = b.user_id 
       WHERE u.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const r = rows[0];
    const isArtisan = r.role === 'artisan' || Boolean(r.artisan_id);
    const isBuyer = r.role === 'buyer' || Boolean(r.buyer_id);

    res.json({
      success: true,
      data: {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        userType: isArtisan ? 'ARTISAN' : isBuyer ? 'BUYER' : 'ADMIN',
        isArtisan,
        isBuyer,
        artisanId: r.artisan_id || null,
        buyerId: r.buyer_id || null,
        businessName: r.business_name || null,
        companyName: r.company_name || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user query' });
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
              a.id as artisan_id, a.business_name, a.craft_type,
              b.id as buyer_id, b.company_name
       FROM users u 
       LEFT JOIN artisans a ON u.id = a.user_id 
       LEFT JOIN buyers b ON u.id = b.user_id 
       ORDER BY u.created_at DESC`
    );

    const users = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      userType: (r.role === 'artisan' || Boolean(r.artisan_id)) ? 'ARTISAN' : (r.role === 'buyer' || Boolean(r.buyer_id)) ? 'BUYER' : 'ADMIN',
      isArtisan: r.role === 'artisan' || Boolean(r.artisan_id),
      isBuyer: r.role === 'buyer' || Boolean(r.buyer_id),
      artisanId: r.artisan_id || null,
      buyerId: r.buyer_id || null,
      businessName: r.business_name || null,
      companyName: r.company_name || null,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to list users' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const userId = req.user.id;
    const { 
      name, 
      email, 
      phone, 
      password, 
      businessName, 
      craftType, 
      experienceYears, 
      location, 
      state, 
      bio, 
      profileImage 
    } = req.body;

    // 1. Update user fields
    let passwordHash: string | null = null;
    if (password && String(password).trim().length >= 6) {
      passwordHash = await bcrypt.hash(String(password).trim(), 10);
    }

    await db.execute(
      `UPDATE users 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           password_hash = CASE WHEN ? IS NOT NULL THEN ? ELSE password_hash END,
           updated_at = NOW()
       WHERE id = ?`,
      [
        name ? String(name).trim() : null,
        email ? String(email).trim().toLowerCase() : null,
        phone ? String(phone).trim() : null,
        passwordHash,
        passwordHash,
        userId
      ]
    );

    // 2. Update artisan profile if exists
    const [artisanRows]: any = await db.execute(`SELECT id FROM artisans WHERE user_id = ?`, [userId]);

    if (artisanRows && artisanRows.length > 0) {
      const expYears = experienceYears !== undefined && experienceYears !== null ? (parseInt(String(experienceYears), 10) || 1) : null;
      await db.execute(
        `UPDATE artisans 
         SET business_name = COALESCE(?, business_name),
             craft_type = COALESCE(?, craft_type),
             experience_years = COALESCE(?, experience_years),
             location = COALESCE(?, location),
             state = COALESCE(?, state),
             bio = COALESCE(?, bio),
             profile_image = COALESCE(?, profile_image),
             updated_at = NOW()
         WHERE user_id = ?`,
        [
          businessName ? String(businessName).trim() : null,
          craftType ? String(craftType).trim() : null,
          expYears,
          location ? String(location).trim() : null,
          state ? String(state).trim() : null,
          bio ? String(bio).trim() : null,
          profileImage ? String(profileImage).trim() : null,
          userId
        ]
      );
    }

    // 3. Fetch latest user details
    const [userRows]: any = await db.execute(
      `SELECT u.*, a.id as artisan_id, a.business_name, a.craft_type, a.experience_years, a.location as artisan_location, a.state as artisan_state, a.bio as artisan_bio, a.profile_image,
              b.id as buyer_id, b.company_name
       FROM users u 
       LEFT JOIN artisans a ON u.id = a.user_id 
       LEFT JOIN buyers b ON u.id = b.user_id 
       WHERE u.id = ?`,
      [userId]
    );

    const u = userRows[0];
    const isArtisan = u.role === 'artisan' || Boolean(u.artisan_id);
    const isBuyer = u.role === 'buyer' || Boolean(u.buyer_id);

    const payload = {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      userType: isArtisan ? 'ARTISAN' : isBuyer ? 'BUYER' : 'ADMIN',
      isArtisan,
      isBuyer,
      artisanId: u.artisan_id || undefined,
      buyerId: u.buyer_id || undefined,
      businessName: u.business_name || undefined,
      craftType: u.craft_type || undefined,
      experienceYears: u.experience_years || undefined,
      location: u.artisan_location || undefined,
      city: u.artisan_location || undefined,
      bio: u.artisan_bio || undefined,
      avatar: u.profile_image || undefined,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        token,
        user: payload,
      },
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update profile' });
  }
};

