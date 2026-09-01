import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(`SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC`);
    res.json({
      success: true,
      data: rows,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const id = cryptoRandomUUID();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await db.execute(
      `INSERT INTO categories (id, name, slug, description, image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [id, name, slug, description || null, image || null]
    );

    res.status(201).json({ success: true, message: 'Category created', data: { id, name, slug } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};
