import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity, targetPrice, message, deliveryLocation } = req.body;

    if (!productId || !quantity || !targetPrice || !deliveryLocation) {
      res.status(400).json({ success: false, message: 'Product, quantity, target price, and delivery location are required.' });
      return;
    }

    // Resolve buyer ID
    let buyerId = req.user?.buyerId;
    if (!buyerId) {
      const [bRows]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user?.id || '']);
      if (bRows.length > 0) {
        buyerId = bRows[0].id;
      } else {
        const [defBuyer]: any = await db.execute(`SELECT id FROM buyers LIMIT 1`);
        buyerId = defBuyer[0]?.id || 'buy-1';
      }
    }

    // Get artisan_id from product
    const [pRows]: any = await db.execute(`SELECT artisan_id FROM products WHERE id = ?`, [productId]);
    if (!pRows || pRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const artisanId = pRows[0].artisan_id;
    const inquiryId = cryptoRandomUUID();

    await db.execute(
      `INSERT INTO inquiries (id, buyer_id, artisan_id, product_id, quantity, target_price, message, delivery_location, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', NOW(), NOW())`,
      [inquiryId, buyerId, artisanId, productId, parseInt(quantity, 10), parseFloat(targetPrice), message || '', deliveryLocation]
    );

    res.status(201).json({
      success: true,
      message: 'Bulk order inquiry sent to artisan successfully.',
      data: { id: inquiryId },
    });
  } catch (err: any) {
    console.error('createInquiry error:', err);
    res.status(500).json({ success: false, message: 'Failed to create bulk inquiry.' });
  }
};

export const getInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let sql = `
      SELECT i.*, p.name as product_title, p.original_image_url as product_image,
             u_buy.name as buyer_name, b.company_name as buyer_company, u_buy.phone as buyer_phone, u_buy.email as buyer_email,
             u_art.name as artisan_name, a.business_name
      FROM inquiries i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN buyers b ON i.buyer_id = b.id
      LEFT JOIN users u_buy ON b.user_id = u_buy.id
      LEFT JOIN artisans a ON i.artisan_id = a.id
      LEFT JOIN users u_art ON a.user_id = u_art.id
    `;

    const params: any[] = [];

    if (userRole === 'artisan') {
      sql += ` WHERE a.user_id = ? OR i.artisan_id = ?`;
      params.push(userId, req.user?.artisanId || '');
    } else if (userRole === 'buyer') {
      sql += ` WHERE b.user_id = ? OR i.buyer_id = ?`;
      params.push(userId, req.user?.buyerId || '');
    }

    sql += ` ORDER BY i.created_at DESC`;

    const [rows]: any = await db.execute(sql, params);

    const inquiries = rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      productImage: r.product_image,
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      buyerPhone: r.buyer_phone,
      buyerEmail: r.buyer_email,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price),
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: inquiries });
  } catch (err: any) {
    console.error('getInquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries' });
  }
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, counterPrice } = req.body;

    if (!['ACCEPTED', 'COUNTERED', 'DECLINED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    await db.execute(
      `UPDATE inquiries SET status = ?, counter_price = ?, updated_at = NOW() WHERE id = ?`,
      [status, counterPrice ? parseFloat(counterPrice) : null, id]
    );

    res.json({ success: true, message: `Inquiry status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update inquiry status' });
  }
};
