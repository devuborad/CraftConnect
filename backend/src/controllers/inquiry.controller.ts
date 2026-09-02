import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Resolve buyer ID from authenticated user
 */
async function resolveBuyerId(req: AuthRequest): Promise<string> {
  const userId = req.user?.id;
  if (!userId) throw new Error('Authentication required.');

  if (req.user?.buyerId) return req.user.buyerId;

  const [bRows]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [userId]);
  if (bRows && bRows.length > 0) {
    return bRows[0].id;
  }

  const [uRows]: any = await db.execute(`SELECT id FROM users WHERE id = ?`, [userId]);
  if (uRows && uRows.length > 0) {
    const newBuyerId = cryptoRandomUUID();
    await db.execute(
      `INSERT INTO buyers (id, user_id, company_name, location, buyer_type, created_at, updated_at) VALUES (?, ?, 'Individual Buyer', 'India', 'individual', NOW(), NOW())`,
      [newBuyerId, userId]
    );
    return newBuyerId;
  }

  const [anyBuyer]: any = await db.execute(`SELECT id FROM buyers LIMIT 1`);
  if (anyBuyer && anyBuyer.length > 0) {
    return anyBuyer[0].id;
  }

  const fallbackUserId = cryptoRandomUUID();
  const fallbackBuyerId = cryptoRandomUUID();
  await db.execute(
    `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, 'Demo Buyer', 'demobuyer@craftconnect.ai', 'hash', 'buyer', NOW(), NOW())`,
    [fallbackUserId]
  );
  await db.execute(
    `INSERT INTO buyers (id, user_id, company_name, location, buyer_type, created_at, updated_at) VALUES (?, ?, 'Individual Buyer', 'India', 'individual', NOW(), NOW())`,
    [fallbackBuyerId, fallbackUserId]
  );
  return fallbackBuyerId;
}

/**
 * Resolve artisan ID from authenticated user
 */
async function resolveArtisanId(req: AuthRequest): Promise<string> {
  const userId = req.user?.id;
  if (!userId) throw new Error('Authentication required.');

  if (req.user?.artisanId) return req.user.artisanId;

  const [aRows]: any = await db.execute(`SELECT id FROM artisans WHERE user_id = ?`, [userId]);
  if (aRows && aRows.length > 0) {
    return aRows[0].id;
  }

  const [uRows]: any = await db.execute(`SELECT id FROM users WHERE id = ?`, [userId]);
  if (uRows && uRows.length > 0) {
    const newArtisanId = cryptoRandomUUID();
    await db.execute(
      `INSERT INTO artisans (id, user_id, business_name, location, state, craft_type, experience_years, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, 'Gujarat, India', 'Gujarat', 'Handloom & Handicrafts', 3, TRUE, NOW(), NOW())`,
      [newArtisanId, userId, `${req.user?.name || 'Master'} Studio`]
    );
    return newArtisanId;
  }

  const [anyArtisan]: any = await db.execute(`SELECT id FROM artisans LIMIT 1`);
  if (anyArtisan && anyArtisan.length > 0) {
    return anyArtisan[0].id;
  }

  throw new Error('Artisan profile not found.');
}

/**
 * POST /api/inquiries - Create B2B Bulk Order Inquiry or Direct Order
 */
export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      type = 'BULK_INQUIRY',
      productId,
      quantity,
      targetPrice,
      targetBudget,
      totalAmount,
      paymentMethod = 'Direct Invoice',
      buyerName,
      buyerCompany,
      buyerPhone,
      buyerEmail,
      message,
      deliveryLocation
    } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
      return;
    }

    const budgetPrice = targetPrice !== undefined ? parseFloat(targetPrice) : targetBudget !== undefined ? parseFloat(targetBudget) : 0;
    if (budgetPrice < 0) {
      res.status(400).json({ success: false, message: 'Target budget/price cannot be negative.' });
      return;
    }

    // 1. Check Product existence & retrieve owner artisan_id from MySQL
    const [prodRows]: any = await db.execute(
      `SELECT id, name, price, status, artisan_id FROM products WHERE id = ?`,
      [productId]
    );

    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const product = prodRows[0];
    const officialTargetPrice = budgetPrice > 0 ? budgetPrice : parseFloat(product.price || 0);
    const finalTotal = totalAmount ? parseFloat(totalAmount) : (qty * officialTargetPrice);

    // 2. Resolve buyer ID from JWT user or fallback
    let buyerId = req.user?.buyerId || null;
    if (!buyerId && req.user?.id) {
      try {
        buyerId = await resolveBuyerId(req);
      } catch (e) {
        // Fallback null if guest
      }
    }

    const artisanId = product.artisan_id || 'artisan-1';
    const inquiryId = cryptoRandomUUID();
    const location = deliveryLocation || 'India';
    const finalMessage = message && message.trim() !== '' ? message.trim() : 'Bulk order inquiry submitted';

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
        qty,
        officialTargetPrice,
        finalTotal,
        paymentMethod,
        buyerName || req.user?.name || 'Valued Buyer',
        buyerCompany || null,
        buyerPhone || req.user?.phone || null,
        buyerEmail || req.user?.email || null,
        finalMessage,
        location
      ]
    );

    // Decrement available stock in MySQL database
    if (productId) {
      await db.execute(
        `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?), updated_at = NOW() WHERE id = ?`,
        [qty, productId]
      );
    }

    res.status(201).json({
      success: true,
      message: `${type === 'DIRECT_ORDER' ? 'Direct Order' : 'Bulk Inquiry'} recorded successfully.`,
      data: {
        id: inquiryId,
        productId,
        quantity: qty,
        targetPrice: officialTargetPrice,
        totalAmount: finalTotal,
        status: 'NEW',
      },
    });
  } catch (err: any) {
    console.error('createInquiry error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to record inquiry / order.' });
  }
};

/**
 * GET /api/inquiries/my - Get inquiries created by authenticated buyer
 */
export const getBuyerInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = await resolveBuyerId(req);

    const [rows]: any = await db.execute(
      `SELECT i.*, p.name as product_title, p.price as product_retail_price, p.original_image_url as product_image,
              u_art.name as artisan_name, a.business_name as artisan_business, a.location as artisan_location
       FROM inquiries i
       LEFT JOIN products p ON i.product_id = p.id
       LEFT JOIN artisans a ON i.artisan_id = a.id
       LEFT JOIN users u_art ON a.user_id = u_art.id
       WHERE i.buyer_id = ?
       ORDER BY i.created_at DESC`,
      [buyerId]
    );

    const inquiries = rows.map((r: any) => ({
      id: r.id,
      type: r.type || 'BULK_INQUIRY',
      productId: r.product_id,
      productTitle: r.product_title || 'Handmade Craft Creation',
      productRetailPrice: r.product_retail_price ? parseFloat(r.product_retail_price) : 0,
      productImage: r.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      artisanId: r.artisan_id,
      artisanName: r.artisan_name || 'Master Artisan',
      artisanBusiness: r.artisan_business || 'Craft Workshop',
      artisanLocation: r.artisan_location || 'India',
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price || 0),
      totalAmount: r.total_amount ? parseFloat(r.total_amount) : (r.quantity * parseFloat(r.target_price || 0)),
      paymentMethod: r.payment_method,
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
      isArchived: Boolean(r.is_archived),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ success: true, data: inquiries });
  } catch (err: any) {
    console.error('getBuyerInquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch buyer inquiries' });
  }
};

/**
 * GET /api/inquiries/artisan - Get inquiries for products owned by authenticated artisan
 */
export const getArtisanInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const { type, archived } = req.query;

    let sql = `
      SELECT i.*, p.name as product_title, p.price as product_retail_price, p.original_image_url as product_image,
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
      const artisanId = await resolveArtisanId(req).catch(() => req.user?.artisanId || '');
      sql += ` AND (a.user_id = ? OR i.artisan_id = ?)`;
      params.push(userId, artisanId);
    } else if (userRole === 'buyer') {
      const buyerId = await resolveBuyerId(req).catch(() => req.user?.buyerId || '');
      sql += ` AND (b.user_id = ? OR i.buyer_id = ?)`;
      params.push(userId, buyerId);
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
      productRetailPrice: r.product_retail_price ? parseFloat(r.product_retail_price) : 0,
      productImage: r.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      buyerPhone: r.buyer_phone,
      buyerEmail: r.buyer_email,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price || 0),
      totalAmount: r.total_amount ? parseFloat(r.total_amount) : (r.quantity * parseFloat(r.target_price || 0)),
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
    console.error('getArtisanInquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch artisan inquiries' });
  }
};

/**
 * GET /api/inquiries/:id - Get single inquiry details (with Participant Security Verification)
 */
export const getInquiryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT i.*, p.name as product_title, p.price as product_retail_price, p.original_image_url as product_image,
              COALESCE(i.buyer_name, u_buy.name, 'Valued Buyer') as buyer_name,
              COALESCE(i.buyer_company, b.company_name, '') as buyer_company,
              COALESCE(i.buyer_phone, u_buy.phone, '') as buyer_phone,
              COALESCE(i.buyer_email, u_buy.email, '') as buyer_email,
              u_art.name as artisan_name, a.business_name as artisan_business, a.location as artisan_location
       FROM inquiries i
       LEFT JOIN products p ON i.product_id = p.id
       LEFT JOIN buyers b ON i.buyer_id = b.id
       LEFT JOIN users u_buy ON b.user_id = u_buy.id
       LEFT JOIN artisans a ON i.artisan_id = a.id
       LEFT JOIN users u_art ON a.user_id = u_art.id
       WHERE i.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Inquiry not found' });
      return;
    }

    const r = rows[0];

    // Participant Authorization Security Check
    let isAuthorized = req.user?.role === 'admin';
    if (!isAuthorized) {
      const [buyerCheck]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user?.id || '']);
      const currentBuyerId = buyerCheck[0]?.id || req.user?.buyerId;
      if (currentBuyerId && r.buyer_id === currentBuyerId) {
        isAuthorized = true;
      }

      const [artisanCheck]: any = await db.execute(`SELECT id FROM artisans WHERE user_id = ?`, [req.user?.id || '']);
      const currentArtisanId = artisanCheck[0]?.id || req.user?.artisanId;
      if (currentArtisanId && r.artisan_id === currentArtisanId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Unauthorized. You cannot access this inquiry.' });
      return;
    }

    const inquiry = {
      id: r.id,
      type: r.type || 'BULK_INQUIRY',
      productId: r.product_id,
      productTitle: r.product_title || 'Handmade Craft Creation',
      productRetailPrice: r.product_retail_price ? parseFloat(r.product_retail_price) : 0,
      productImage: r.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerId: r.buyer_id,
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      buyerPhone: r.buyer_phone,
      buyerEmail: r.buyer_email,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      artisanBusiness: r.artisan_business,
      artisanLocation: r.artisan_location,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price || 0),
      totalAmount: r.total_amount ? parseFloat(r.total_amount) : (r.quantity * parseFloat(r.target_price || 0)),
      paymentMethod: r.payment_method,
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
      isArchived: Boolean(r.is_archived),
      completedAt: r.completed_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };

    res.json({ success: true, data: inquiry });
  } catch (err: any) {
    console.error('getInquiryById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiry details' });
  }
};

/**
 * PUT /api/inquiries/:id/status - Update Inquiry Status & Optional Counter Price (Artisan/Admin)
 */
export const updateInquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, counterPrice, quotedPrice } = req.body;

    const [inqRows]: any = await db.execute(`SELECT * FROM inquiries WHERE id = ?`, [id]);
    if (!inqRows || inqRows.length === 0) {
      res.status(404).json({ success: false, message: 'Inquiry not found' });
      return;
    }

    const inquiry = inqRows[0];

    // Ownership check: Only related artisan or admin can update status
    if (req.user?.role !== 'admin') {
      const artisanId = await resolveArtisanId(req).catch(() => req.user?.artisanId || '');
      if (inquiry.artisan_id !== artisanId) {
        res.status(403).json({ success: false, message: "Unauthorized. Only the product artisan can respond to this inquiry." });
        return;
      }
    }

    let targetStatus = (status || '').toString().toUpperCase();
    const validStatuses = ['ACCEPTED', 'COUNTERED', 'DECLINED', 'DISPATCHED', 'COMPLETED', 'CANCELLED', 'CONFIRMED'];
    if (!validStatuses.includes(targetStatus)) {
      res.status(400).json({ success: false, message: `Invalid status '${status}'. Allowed: ${validStatuses.join(', ')}` });
      return;
    }

    if (targetStatus === 'CONFIRMED') targetStatus = 'ACCEPTED';

    const finalCounterPrice = counterPrice !== undefined ? parseFloat(counterPrice) : quotedPrice !== undefined ? parseFloat(quotedPrice) : null;
    const isArchiveStatus = ['DISPATCHED', 'COMPLETED', 'DECLINED', 'CANCELLED'].includes(targetStatus);

    await db.execute(
      `UPDATE inquiries 
       SET status = ?, 
           counter_price = ?, 
           is_archived = ?, 
           completed_at = CASE WHEN ? = TRUE THEN NOW() ELSE completed_at END,
           updated_at = NOW() 
       WHERE id = ?`,
      [targetStatus, finalCounterPrice, isArchiveStatus, isArchiveStatus, id]
    );

    if (['ACCEPTED', 'DISPATCHED'].includes(targetStatus)) {
      if (inquiry.product_id) {
        const qty = parseInt(inquiry.quantity || 1, 10);
        await db.execute(
          `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?), updated_at = NOW() WHERE id = ?`,
          [qty, inquiry.product_id]
        );
      }
    }

    res.json({
      success: true,
      message: `Inquiry status updated to ${targetStatus} successfully.`,
      data: { id, status: targetStatus, counterPrice: finalCounterPrice },
    });
  } catch (err: any) {
    console.error('updateInquiryStatus error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update inquiry status' });
  }
};

/**
 * POST /api/inquiries/:id/restore - Restore Archived Inquiry
 */
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

/**
 * DELETE /api/inquiries/:id - Delete Inquiry
 */
export const deleteInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM inquiries WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete inquiry' });
  }
};

/**
 * GET /api/inquiries/analytics - Get B2B Inquiry Analytics
 */
export const getInquiryAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let sql = `
      SELECT 
        COUNT(*) as total_deals,
        SUM(COALESCE(i.total_amount, i.quantity * i.target_price)) as grand_total_value,
        SUM(i.quantity) as grand_total_units,
        
        SUM(CASE WHEN i.type != 'DIRECT_ORDER' THEN COALESCE(i.total_amount, i.quantity * i.target_price) ELSE 0 END) as bulk_total_value,
        SUM(CASE WHEN i.type != 'DIRECT_ORDER' THEN i.quantity ELSE 0 END) as bulk_total_units,
        COUNT(CASE WHEN i.type != 'DIRECT_ORDER' THEN 1 END) as bulk_count,

        SUM(CASE WHEN i.type = 'DIRECT_ORDER' THEN COALESCE(i.total_amount, i.quantity * i.target_price) ELSE 0 END) as direct_total_value,
        SUM(CASE WHEN i.type = 'DIRECT_ORDER' THEN i.quantity ELSE 0 END) as direct_total_units,
        COUNT(CASE WHEN i.type = 'DIRECT_ORDER' THEN 1 END) as direct_count,

        SUM(CASE WHEN i.status IN ('COMPLETED', 'DISPATCHED') THEN COALESCE(i.total_amount, i.quantity * i.target_price) ELSE 0 END) as realized_revenue,
        SUM(CASE WHEN i.status IN ('NEW', 'COUNTERED', 'ACCEPTED') THEN COALESCE(i.total_amount, i.quantity * i.target_price) ELSE 0 END) as pending_pipeline,
        SUM(CASE WHEN i.status = 'DECLINED' THEN COALESCE(i.total_amount, i.quantity * i.target_price) ELSE 0 END) as declined_value
      FROM inquiries i
      LEFT JOIN artisans a ON i.artisan_id = a.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (userRole === 'artisan') {
      const artisanId = await resolveArtisanId(req).catch(() => req.user?.artisanId || '');
      sql += ` AND (a.user_id = ? OR i.artisan_id = ?)`;
      params.push(userId, artisanId);
    }

    const [rows]: any = await db.execute(sql, params);
    const data = rows[0] || {};

    res.json({
      success: true,
      data: {
        grandTotalValue: parseFloat(data.grand_total_value || 0),
        grandTotalUnits: parseInt(data.grand_total_units || 0, 10),
        totalDeals: parseInt(data.total_deals || 0, 10),
        bulkTotalValue: parseFloat(data.bulk_total_value || 0),
        bulkTotalUnits: parseInt(data.bulk_total_units || 0, 10),
        bulkCount: parseInt(data.bulk_count || 0, 10),
        directTotalValue: parseFloat(data.direct_total_value || 0),
        directTotalUnits: parseInt(data.direct_total_units || 0, 10),
        directCount: parseInt(data.direct_count || 0, 10),
        realizedRevenue: parseFloat(data.realized_revenue || 0),
        pendingPipeline: parseFloat(data.pending_pipeline || 0),
        declinedValue: parseFloat(data.declined_value || 0),
      }
    });
  } catch (err: any) {
    console.error('getInquiryAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
