import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Resolve buyer ID from authenticated user, creating buyer profile if missing
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
 * Get or create cart for buyer
 */
async function getOrCreateCart(buyerId: string): Promise<string> {
  const [rows]: any = await db.execute(`SELECT id FROM carts WHERE buyer_id = ?`, [buyerId]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const cartId = cryptoRandomUUID();
  await db.execute(`INSERT INTO carts (id, buyer_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`, [cartId, buyerId]);
  return cartId;
}

/**
 * GET /api/cart - Fetch current buyer's cart items & server-calculated subtotal/total
 */
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = await resolveBuyerId(req);
    const cartId = await getOrCreateCart(buyerId);

    const [items]: any = await db.execute(
      `SELECT ci.id as item_id, ci.product_id, ci.quantity, ci.unit_price,
              p.name as product_title, p.price as db_price, p.stock_quantity, p.status as product_status,
              p.original_image_url, p.enhanced_image_url, p.craft_type,
              a.business_name as artisan_name, a.location as artisan_location, a.profile_image as artisan_avatar
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN artisans a ON p.artisan_id = a.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    let subtotal = 0;
    const formattedItems = items.map((r: any) => {
      const price = parseFloat(r.db_price);
      const itemSubtotal = price * r.quantity;
      subtotal += itemSubtotal;

      return {
        id: r.item_id,
        productId: r.product_id,
        quantity: r.quantity,
        unitPrice: price,
        subtotal: itemSubtotal,
        product: {
          id: r.product_id,
          title: r.product_title,
          artisanId: r.artisan_id,
          artisanName: r.artisan_name,
          artisanAvatar: r.artisan_avatar,
          artisanLocation: r.artisan_location,
          craftType: r.craft_type,
          price,
          originalImage: r.original_image_url,
          enhancedImage: r.enhanced_image_url || r.original_image_url,
          stock: r.stock_quantity,
          status: r.product_status,
        },
      };
    });

    const shipping = subtotal > 3000 || formattedItems.length === 0 ? 0 : 250;
    const total = subtotal + shipping;

    res.json({
      success: true,
      data: {
        cartId,
        items: formattedItems,
        subtotal,
        shipping,
        total,
      },
    });
  } catch (err: any) {
    console.error('getCart error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

/**
 * POST /api/cart/items - Add item to cart with DB price security & stock check
 */
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    const requestedQty = parseInt(quantity, 10) || 1;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID required' });
      return;
    }

    if (requestedQty <= 0) {
      res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
      return;
    }

    const buyerId = await resolveBuyerId(req);
    const cartId = await getOrCreateCart(buyerId);

    // 1. Fetch product from DB to verify status, stock, and official DB price
    const [pRows]: any = await db.execute(`SELECT price, stock_quantity, status FROM products WHERE id = ?`, [productId]);
    if (!pRows || pRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const product = pRows[0];
    if (product.status !== 'published') {
      res.status(400).json({ success: false, message: 'Product is not available for purchase.' });
      return;
    }

    if (product.stock_quantity < requestedQty) {
      res.status(400).json({ success: false, message: `Requested quantity exceeds available stock (${product.stock_quantity} available).` });
      return;
    }

    // Always use official DB price (Security: NEVER trust client price)
    const dbPrice = parseFloat(product.price);

    // Check if item already in cart
    const [existing]: any = await db.execute(`SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cartId, productId]);

    if (existing.length > 0) {
      const newQty = existing[0].quantity + requestedQty;
      if (product.stock_quantity < newQty) {
        res.status(400).json({ success: false, message: `Total requested quantity exceeds available stock (${product.stock_quantity} available).` });
        return;
      }
      await db.execute(`UPDATE cart_items SET quantity = ?, unit_price = ?, updated_at = NOW() WHERE id = ?`, [newQty, dbPrice, existing[0].id]);
    } else {
      const itemId = cryptoRandomUUID();
      await db.execute(
        `INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [itemId, cartId, productId, requestedQty, dbPrice]
      );
    }

    res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (err: any) {
    console.error('addToCart error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

/**
 * PUT /api/cart/items/:productId - Update cart item quantity
 */
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const requestedQty = parseInt(quantity, 10);

    const buyerId = await resolveBuyerId(req);
    const cartId = await getOrCreateCart(buyerId);

    if (isNaN(requestedQty) || requestedQty <= 0) {
      await db.execute(`DELETE FROM cart_items WHERE cart_id = ? AND (product_id = ? OR id = ?)`, [cartId, productId, productId]);
      res.json({ success: true, message: 'Item removed from cart' });
      return;
    }

    // Check product stock
    const [pRows]: any = await db.execute(`SELECT stock_quantity FROM products WHERE id = ?`, [productId]);
    if (pRows && pRows.length > 0) {
      if (pRows[0].stock_quantity < requestedQty) {
        res.status(400).json({ success: false, message: `Requested quantity exceeds available stock (${pRows[0].stock_quantity} available).` });
        return;
      }
    }

    await db.execute(
      `UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_id = ? AND (product_id = ? OR id = ?)`,
      [requestedQty, cartId, productId, productId]
    );

    res.json({ success: true, message: 'Cart item updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

/**
 * DELETE /api/cart/items/:productId - Remove item from cart
 */
export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const buyerId = await resolveBuyerId(req);
    const cartId = await getOrCreateCart(buyerId);

    await db.execute(`DELETE FROM cart_items WHERE cart_id = ? AND (product_id = ? OR id = ?)`, [cartId, productId, productId]);

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
};

/**
 * DELETE /api/cart - Clear entire cart
 */
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = await resolveBuyerId(req);
    const cartId = await getOrCreateCart(buyerId);

    await db.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
