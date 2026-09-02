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
 * POST /api/inquiries - Create B2B Bulk Order Inquiry
 */
export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity, targetPrice, targetBudget, message, deliveryLocation } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
      return;
    }

    if (!message || message.trim() === '') {
      res.status(400).json({ success: false, message: 'Inquiry message is required.' });
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
    if (product.status !== 'published') {
      res.status(400).json({ success: false, message: 'Cannot inquire on an unpublished product.' });
      return;
    }

    // 2. Resolve buyer ID from JWT user (NEVER trust buyer_id from body)
    const buyerId = await resolveBuyerId(req);
    const artisanId = product.artisan_id;
    const inquiryId = cryptoRandomUUID();

    const location = deliveryLocation || 'India';
    const officialTargetPrice = budgetPrice > 0 ? budgetPrice : parseFloat(product.price);

    await db.execute(
      `INSERT INTO inquiries (id, buyer_id, artisan_id, product_id, quantity, target_price, message, delivery_location, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', NOW(), NOW())`,
      [inquiryId, buyerId, artisanId, productId, qty, officialTargetPrice, message.trim(), location]
    );

    res.status(201).json({
      success: true,
      message: 'Bulk order inquiry sent to artisan successfully.',
      data: {
        id: inquiryId,
        productId,
        quantity: qty,
        targetPrice: officialTargetPrice,
        status: 'NEW',
      },
    });
  } catch (err: any) {
    console.error('createInquiry error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create bulk inquiry.' });
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
       JOIN products p ON i.product_id = p.id
       JOIN artisans a ON i.artisan_id = a.id
       JOIN users u_art ON a.user_id = u_art.id
       WHERE i.buyer_id = ?
       ORDER BY i.created_at DESC`,
      [buyerId]
    );

    const inquiries = rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      productRetailPrice: parseFloat(r.product_retail_price),
      productImage: r.product_image,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      artisanBusiness: r.artisan_business,
      artisanLocation: r.artisan_location,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price),
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
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
    const artisanId = await resolveArtisanId(req);

    const [rows]: any = await db.execute(
      `SELECT i.*, p.name as product_title, p.price as product_retail_price, p.original_image_url as product_image,
              u_buy.name as buyer_name, b.company_name as buyer_company, u_buy.phone as buyer_phone, u_buy.email as buyer_email
       FROM inquiries i
       JOIN products p ON i.product_id = p.id
       JOIN buyers b ON i.buyer_id = b.id
       JOIN users u_buy ON b.user_id = u_buy.id
       WHERE i.artisan_id = ?
       ORDER BY i.created_at DESC`,
      [artisanId]
    );

    const inquiries = rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      productRetailPrice: parseFloat(r.product_retail_price),
      productImage: r.product_image,
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      buyerPhone: r.buyer_phone,
      buyerEmail: r.buyer_email,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price),
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
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
              u_buy.name as buyer_name, b.company_name as buyer_company, u_buy.phone as buyer_phone, u_buy.email as buyer_email,
              u_art.name as artisan_name, a.business_name as artisan_business, a.location as artisan_location
       FROM inquiries i
       JOIN products p ON i.product_id = p.id
       JOIN buyers b ON i.buyer_id = b.id
       JOIN users u_buy ON b.user_id = u_buy.id
       JOIN artisans a ON i.artisan_id = a.id
       JOIN users u_art ON a.user_id = u_art.id
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
      productId: r.product_id,
      productTitle: r.product_title,
      productRetailPrice: parseFloat(r.product_retail_price),
      productImage: r.product_image,
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
      targetPrice: parseFloat(r.target_price),
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      message: r.message,
      deliveryLocation: r.delivery_location,
      status: r.status,
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
 * PUT /api/inquiries/:id/status - Update Inquiry Status & Optional Counter Price (Artisan only)
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
      const artisanId = await resolveArtisanId(req);
      if (inquiry.artisan_id !== artisanId) {
        res.status(403).json({ success: false, message: "Unauthorized. Only the product artisan can respond to this inquiry." });
        return;
      }
    }

    // Map status string safely
    let targetStatus: 'NEW' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'CANCELLED' = 'NEW';
    const statusUpper = (status || '').toString().toUpperCase();

    if (['ACCEPTED', 'CONFIRMED', 'COMPLETED'].includes(statusUpper)) {
      targetStatus = 'ACCEPTED';
    } else if (['DECLINED', 'REJECTED', 'DECLINE'].includes(statusUpper)) {
      targetStatus = 'DECLINED';
    } else if (['COUNTERED', 'QUOTE', 'QUOTED'].includes(statusUpper)) {
      targetStatus = 'COUNTERED';
    } else if (['CANCELLED', 'CANCEL'].includes(statusUpper)) {
      targetStatus = 'CANCELLED';
    } else {
      res.status(400).json({ success: false, message: `Invalid inquiry status '${status}'. Allowed: ACCEPTED, DECLINED, COUNTERED, CANCELLED.` });
      return;
    }

    const finalCounterPrice = counterPrice !== undefined ? parseFloat(counterPrice) : quotedPrice !== undefined ? parseFloat(quotedPrice) : null;

    await db.execute(
      `UPDATE inquiries SET status = ?, counter_price = ?, updated_at = NOW() WHERE id = ?`,
      [targetStatus, finalCounterPrice, id]
    );

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
