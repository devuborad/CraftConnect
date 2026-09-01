import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getArtisanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT a.*, u.name, u.email, u.phone, u.language,
              (SELECT COUNT(*) FROM products WHERE artisan_id = a.id AND status = 'published') as published_count
       FROM artisans a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ? OR a.user_id = ?`,
      [id, id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Artisan not found' });
      return;
    }

    const r = rows[0];
    const artisan = {
      id: r.id,
      name: r.name,
      businessName: r.business_name,
      avatar: r.profile_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      location: r.location,
      state: r.state,
      craftType: r.craft_type,
      experienceYears: r.experience_years,
      story: r.bio,
      rating: 4.9,
      reviewCount: 24,
      phone: r.phone,
      isVerified: Boolean(r.is_verified),
      publishedCount: r.published_count,
    };

    res.json({ success: true, data: artisan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch artisan profile' });
  }
};

export const getArtisanProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.artisan_id = ? OR p.artisan_id IN (SELECT id FROM artisans WHERE user_id = ?)
       ORDER BY p.created_at DESC`,
      [id, id]
    );

    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch artisan products' });
  }
};

export const getMyArtisanProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || '';

    const [rows]: any = await db.execute(
      `SELECT a.*, u.name, u.email, u.phone
       FROM artisans a
       JOIN users u ON a.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Artisan profile not found' });
      return;
    }

    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving artisan profile' });
  }
};

export const updateMyArtisanProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { businessName, location, craftType, experienceYears, bio, profileImage } = req.body;

    await db.execute(
      `UPDATE artisans 
       SET business_name = COALESCE(?, business_name), location = COALESCE(?, location),
           craft_type = COALESCE(?, craft_type), experience_years = COALESCE(?, experience_years),
           bio = COALESCE(?, bio), profile_image = COALESCE(?, profile_image), updated_at = NOW()
       WHERE user_id = ?`,
      [businessName, location, craftType, experienceYears, bio, profileImage, userId]
    );

    res.json({ success: true, message: 'Artisan profile updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update artisan profile' });
  }
};
