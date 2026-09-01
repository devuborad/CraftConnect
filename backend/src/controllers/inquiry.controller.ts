import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      type = 'BULK_INQUIRY',
      productId, 
      quantity, 
      targetPrice, 
      totalAmount,
      paymentMethod = 'Direct Invoice',
      buyerName,
      buyerCompany,
      buyerPhone,
      buyerEmail,
      message, 
      deliveryLocation 
    } = req.body;

    if (!productId || !quantity || !targetPrice || !deliveryLocation) {
      res.status(400).json({ success: false, message: 'Product, quantity, target price, and delivery location are required.' });
      return;
    }

    // Resolve buyer ID if user is authenticated
    let buyerId = req.user?.buyerId || null;
    if (!buyerId && req.user?.id) {
      const [bRows]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user.id]);
      if (bRows.length > 0) {
        buyerId = bRows[0].id;
      }
    }

    // Get artisan_id from product
    const [pRows]: any = await db.execute(`SELECT artisan_id FROM products WHERE id = ?`, [productId]);
    let artisanId = pRows && pRows.length > 0 ? pRows[0].artisan_id : 'artisan-1';

    const inquiryId = cryptoRandomUUID();
    const finalTotal = totalAmount || (parseInt(quantity, 10) * parseFloat(targetPrice));

    await db.execute(
      `INSERT INTO inquiries (
        id, type, buyer_id, artisan_id, product_id, quantity, target_price, total_amount, 
        payment_method, buyer_name, buyer_company, buyer_phone, buyer_email, message, 
        delivery_location, status, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', FALSE, NOW(), NOW())`,
      [
        inquiryId,
        type,
        buyerId,
        artisanId,
        productId,
        parseInt(quantity, 10),
        parseFloat(targetPrice),
        parseFloat(finalTotal),
        paymentMethod,
        buyerName || req.user?.name || 'Valued Buyer',
        buyerCompany || null,
        buyerPhone || req.user?.phone || null,
        buyerEmail || req.user?.email || null,
        message || '',
        deliveryLocation
      ]
    );

    res.status(201).json({
      success: true,
      message: `${type === 'DIRECT_ORDER' ? 'Direct Order' : 'Bulk Inquiry'} recorded successfully.`,
      data: { id: inquiryId },
    });
  } catch (err: any) {
    console.error('createInquiry error:', err);
    res.status(500).json({ success: false, message: 'Failed to record inquiry / order.' });
  }
};

export const getInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const { type, archived } = req.query;

    let sql = `
      SELECT i.*, p.name as product_title, p.original_image_url as product_image,
             COALESCE(i.buyer_name, u_buy.name, 'Valued Buyer') as buyer_name,
             COALESCE(i.buyer_company, b.company_name, '') as buyer_company,
             COALESCE(i.buyer_phone, u_buy.phone, '') as buyer_phone,
             COALESCE(i.buyer_email, u_buy.email, '') as buyer_email,
             COALESCE(u_art.name, 'Master Artisan') as artisan_name,
             COALESCE(a.business_name, 'Craft Workshop') as business_name
      FROM inquiries i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN buyers b ON i.buyer_id = b.id
      LEFT JOIN users u_buy ON b.user_id = u_buy.id
      LEFT JOIN artisans a ON i.artisan_id = a.id
      LEFT JOIN users u_art ON a.user_id = u_art.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userRole === 'artisan') {
      sql += ` AND (a.user_id = ? OR i.artisan_id = ?)`;
      params.push(userId, req.user?.artisanId || '');
    } else if (userRole === 'buyer') {
      sql += ` AND (b.user_id = ? OR i.buyer_id = ?)`;
      params.push(userId, req.user?.buyerId || '');
    }

    if (type) {
      sql += ` AND i.type = ?`;
      params.push(type);
    }

    if (archived === 'true') {
      sql += ` AND (i.is_archived = TRUE OR i.status IN ('DISPATCHED', 'COMPLETED', 'DECLINED'))`;
    } else if (archived === 'false') {
      sql += ` AND (i.is_archived = FALSE AND i.status NOT IN ('DISPATCHED', 'COMPLETED', 'DECLINED'))`;
    }

    sql += ` ORDER BY i.created_at DESC`;

    const [rows]: any = await db.execute(sql, params);

    const inquiries = rows.map((r: any) => ({
      id: r.id,
      type: r.type || 'BULK_INQUIRY',
      productId: r.product_id,
      productTitle: r.product_title || 'Handmade Craft Creation',
      productImage: r.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      buyerPhone: r.buyer_phone,
      buyerEmail: r.buyer_email,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price),
      totalAmount: r.total_amount ? parseFloat(r.total_amount) : (r.quantity * parseFloat(r.target_price)),
      paymentMethod: r.payment_method,
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      isArchived: Boolean(r.is_archived),
      completedAt: r.completed_at,
      createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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

    const validStatuses = ['ACCEPTED', 'COUNTERED', 'DECLINED', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const isArchiveStatus = ['DISPATCHED', 'COMPLETED', 'DECLINED'].includes(status);

    await db.execute(
      `UPDATE inquiries 
       SET status = ?, 
           counter_price = ?, 
           is_archived = ?, 
           completed_at = CASE WHEN ? = TRUE THEN NOW() ELSE completed_at END,
           updated_at = NOW() 
       WHERE id = ?`,
      [status, counterPrice ? parseFloat(counterPrice) : null, isArchiveStatus, isArchiveStatus, id]
    );

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err: any) {
    console.error('updateInquiryStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const restoreInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute(
      `UPDATE inquiries SET is_archived = FALSE, status = 'NEW', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    res.json({ success: true, message: 'Inquiry restored to active inbox' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to restore inquiry' });
  }
};

export const deleteInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM inquiries WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete inquiry' });
  }
};
