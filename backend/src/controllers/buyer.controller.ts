import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getMyBuyerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || '';

    let rows: any = [];
    try {
      [rows] = await db.execute(
        `SELECT b.*, u.name, u.email, u.phone
         FROM buyers b
         JOIN users u ON b.user_id = u.id
         WHERE u.id = ?`,
        [userId]
      );
    } catch (_) {
      [rows] = await db.execute(
        `SELECT b.id, b.user_id, b.company_name, b.location, b.buyer_type, b.created_at, b.updated_at, u.name, u.email, u.phone
         FROM buyers b
         JOIN users u ON b.user_id = u.id
         WHERE u.id = ?`,
        [userId]
      );
    }

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Buyer profile not found' });
      return;
    }

    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving buyer profile' });
  }
};

export const updateMyBuyerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  try {
    const userId = req.user?.id;
    const { name, email, phone, companyName, location, avatar, profileImage } = req.body;
    const img = avatar || profileImage;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await connection.beginTransaction();

    // Update users table (name, email, phone)
    if (name !== undefined || email !== undefined || phone !== undefined) {
      await connection.execute(
        `UPDATE users 
         SET name = COALESCE(?, name), 
             email = COALESCE(?, email), 
             phone = COALESCE(?, phone), 
             updated_at = NOW()
         WHERE id = ?`,
        [name ?? null, email ?? null, phone ?? null, userId]
      );
    }

    // Update buyers table (company_name, location, profile_image)
    if (companyName !== undefined || location !== undefined || img !== undefined) {
      try {
        await connection.execute(
          `UPDATE buyers 
           SET company_name = COALESCE(?, company_name), 
               location = COALESCE(?, location), 
               profile_image = COALESCE(?, profile_image),
               updated_at = NOW()
           WHERE user_id = ?`,
          [companyName ?? null, location ?? null, img ?? null, userId]
        );
      } catch (err: any) {
        // Try adding column if missing
        try {
          await connection.execute(`ALTER TABLE buyers ADD COLUMN profile_image LONGTEXT`);
          await connection.execute(
            `UPDATE buyers 
             SET company_name = COALESCE(?, company_name), 
                 location = COALESCE(?, location), 
                 profile_image = COALESCE(?, profile_image),
                 updated_at = NOW()
             WHERE user_id = ?`,
            [companyName ?? null, location ?? null, img ?? null, userId]
          );
        } catch (_) {
          await connection.execute(
            `UPDATE buyers 
             SET company_name = COALESCE(?, company_name), 
                 location = COALESCE(?, location), 
                 updated_at = NOW()
             WHERE user_id = ?`,
            [companyName ?? null, location ?? null, userId]
          );
        }
      }
    }

    await connection.commit();

    res.json({ success: true, message: 'Buyer profile updated successfully' });
  } catch (err: any) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Failed to update buyer profile', error: err.message });
  } finally {
    connection.release();
  }
};
