import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

async function getOrCreateCart(buyerId: string): Promise<string> {
  const [rows]: any = await db.execute(`SELECT id FROM carts WHERE buyer_id = ?`, [buyerId]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const cartId = cryptoRandomUUID();
  await db.execute(`INSERT INTO carts (id, buyer_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`, [cartId, buyerId]);
  return cartId;
}

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let buyerId: string = req.user?.buyerId || '';
    if (!buyerId) {
      const [bRows]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user?.id || '']);
      buyerId = bRows[0]?.id || 'buy-2';
    }

    const cartId = await getOrCreateCart(buyerId);

    const [items]: any = await db.execute(
      `SELECT ci.id as item_id, ci.quantity, ci.unit_price,
              p.*, a.business_name as artisan_name, a.location as artisan_location
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN artisans a ON p.artisan_id = a.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    const formattedItems = items.map((r: any) => ({
      id: r.item_id,
      quantity: r.quantity,
      unitPrice: parseFloat(r.unit_price),
      product: {
        id: r.id,
        title: r.name,
        artisanId: r.artisan_id,
        artisanName: r.artisan_name,
        artisanLocation: r.artisan_location,
        price: parseFloat(r.price),
        originalImage: r.original_image_url,
        enhancedImage: r.enhanced_image_url,
        stock: r.stock_quantity,
      },
    }));

    res.json({ success: true, data: { cartId, items: formattedItems } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID required' });
      return;
    }

    let buyerId: string = req.user?.buyerId || '';
    if (!buyerId) {
      const [bRows]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user?.id || '']);
      buyerId = bRows[0]?.id || 'buy-2';
    }

    const [pRows]: any = await db.execute(`SELECT price, stock_quantity FROM products WHERE id = ?`, [productId]);
    if (!pRows || pRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const currentPrice = parseFloat(pRows[0].price);
    const cartId = await getOrCreateCart(buyerId);

    // Check if item already in cart
    const [existing]: any = await db.execute(`SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cartId, productId]);

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      await db.execute(`UPDATE cart_items SET quantity = ?, unit_price = ?, updated_at = NOW() WHERE id = ?`, [newQty, currentPrice, existing[0].id]);
    } else {
      const itemId = cryptoRandomUUID();
      await db.execute(
        `INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [itemId, cartId, productId, quantity, currentPrice]
      );
    }

    res.json({ success: true, message: 'Item added to cart' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await db.execute(`DELETE FROM cart_items WHERE id = ?`, [id]);
    } else {
      await db.execute(`UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`, [quantity, id]);
    }

    res.json({ success: true, message: 'Cart updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM cart_items WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let buyerId: string = req.user?.buyerId || '';
    if (!buyerId) {
      const [bRows]: any = await db.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user?.id || '']);
      buyerId = bRows[0]?.id || 'buy-2';
    }
    const cartId = await getOrCreateCart(buyerId);
    await db.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

    res.json({ success: true, message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
