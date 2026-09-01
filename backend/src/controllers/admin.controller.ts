import { Request, Response } from 'express';
import { db } from '../config/db.js';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [artisanCount]: any = await db.execute(`SELECT COUNT(*) as count FROM artisans`);
    const [buyerCount]: any = await db.execute(`SELECT COUNT(*) as count FROM buyers`);
    const [productCount]: any = await db.execute(`SELECT COUNT(*) as count FROM products`);
    const [publishedCount]: any = await db.execute(`SELECT COUNT(*) as count FROM products WHERE status = 'published'`);
    const [pendingCount]: any = await db.execute(`SELECT COUNT(*) as count FROM products WHERE status = 'pending'`);
    const [inquiryCount]: any = await db.execute(`SELECT COUNT(*) as count FROM inquiries`);
    const [orderCount]: any = await db.execute(`SELECT COUNT(*) as count FROM orders`);
    const [aiCount]: any = await db.execute(`SELECT COUNT(*) as count FROM ai_activity`);

    res.json({
      success: true,
      data: {
        totalArtisans: artisanCount[0]?.count || 0,
        totalBuyers: buyerCount[0]?.count || 0,
        totalProducts: productCount[0]?.count || 0,
        publishedProducts: publishedCount[0]?.count || 0,
        pendingProducts: pendingCount[0]?.count || 0,
        totalInquiries: inquiryCount[0]?.count || 0,
        totalOrders: orderCount[0]?.count || 0,
        totalAIRequests: aiCount[0]?.count || 0,
        charts: {
          userGrowth: [
            { month: 'Jan', artisans: 12, buyers: 45 },
            { month: 'Feb', artisans: 24, buyers: 90 },
            { month: 'Mar', artisans: 48, buyers: 180 },
          ],
          aiUsage: [
            { feature: 'Image Studio', requests: 140 },
            { feature: 'Catalogue Gen', requests: 210 },
            { feature: 'Pricing Engine', requests: 180 },
            { feature: 'CraftMate Chat', requests: 95 },
          ],
        },
      },
    });
  } catch (err: any) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

export const getAdminArtisans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT a.*, u.name, u.email, u.phone, u.status as user_status, u.created_at as joined_at,
              (SELECT COUNT(*) FROM products WHERE artisan_id = a.id) as total_products
       FROM artisans a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin artisans list' });
  }
};

export const getAdminBuyers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT b.*, u.name, u.email, u.phone, u.status as user_status,
              (SELECT COUNT(*) FROM inquiries WHERE buyer_id = b.id) as inquiry_count,
              (SELECT COUNT(*) FROM orders WHERE buyer_id = b.id) as order_count
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin buyers list' });
  }
};

export const getAdminProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT p.*, c.name as category_name, a.business_name as artisan_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN artisans a ON p.artisan_id = a.id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin products' });
  }
};

export const moderateProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'pending', 'approved', 'rejected', 'archived'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid product status' });
      return;
    }

    await db.execute(`UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
    res.json({ success: true, message: `Product status set to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update product moderation status' });
  }
};

export const getAdminAIActivity = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT ai.*, u.name as user_name, u.role as user_role
       FROM ai_activity ai
       LEFT JOIN users u ON ai.user_id = u.id
       ORDER BY ai.created_at DESC
       LIMIT 50`
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch AI activity logs' });
  }
};
