import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  try {
    const { items, shippingDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order items are required.' });
      return;
    }

    if (!shippingDetails || !shippingDetails.name || !shippingDetails.address) {
      res.status(400).json({ success: false, message: 'Valid shipping details are required.' });
      return;
    }

    let buyerId = req.user?.buyerId;
    if (!buyerId) {
      const [bRows]: any = await connection.execute(`SELECT id FROM buyers WHERE user_id = ?`, [req.user?.id || '']);
      buyerId = bRows[0]?.id || 'buy-2';
    }

    await connection.beginTransaction();

    let totalAmount = 0;
    const validatedItems: Array<{ productId: string; artisanId: string; quantity: number; unitPrice: number; subtotal: number }> = [];

    // Verify stock & server-side prices (prevent price tampering)
    for (const item of items) {
      const [prodRows]: any = await connection.execute(`SELECT id, price, stock_quantity, artisan_id FROM products WHERE id = ? FOR UPDATE`, [item.productId]);

      if (!prodRows || prodRows.length === 0) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const prod = prodRows[0];
      const qty = parseInt(item.quantity, 10) || 1;

      if (prod.stock_quantity < qty) {
        throw new Error(`Insufficient stock for product. Available: ${prod.stock_quantity}`);
      }

      const unitPrice = parseFloat(prod.price);
      const subtotal = unitPrice * qty;
      totalAmount += subtotal;

      validatedItems.push({
        productId: prod.id,
        artisanId: prod.artisan_id,
        quantity: qty,
        unitPrice,
        subtotal,
      });

      // Deduct stock safely
      await connection.execute(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`, [qty, prod.id]);
    }

    const orderId = cryptoRandomUUID();

    // Insert Order
    await connection.execute(
      `INSERT INTO orders (id, buyer_id, total_amount, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, created_at, updated_at)
       VALUES (?, ?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderId,
        buyerId,
        totalAmount,
        shippingDetails.name,
        shippingDetails.phone || '+919876543210',
        shippingDetails.address,
        shippingDetails.city || 'Bengaluru',
        shippingDetails.state || 'Karnataka',
        shippingDetails.pincode || '560001',
      ]
    );

    // Insert Order Items
    for (const vi of validatedItems) {
      const orderItemId = cryptoRandomUUID();
      await connection.execute(
        `INSERT INTO order_items (id, order_id, product_id, artisan_id, quantity, unit_price, subtotal, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [orderItemId, orderId, vi.productId, vi.artisanId, vi.quantity, vi.unitPrice, vi.subtotal]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      data: {
        orderId,
        totalAmount,
        status: 'confirmed',
      },
    });
  } catch (err: any) {
    await connection.rollback();
    console.error('createOrder error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to place order.' });
  } finally {
    connection.release();
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let sql = `
      SELECT o.*, u.name as buyer_name
      FROM orders o
      JOIN buyers b ON o.buyer_id = b.id
      JOIN users u ON b.user_id = u.id
    `;
    const params: any[] = [];

    if (userRole === 'buyer') {
      sql += ` WHERE b.user_id = ? OR o.buyer_id = ?`;
      params.push(userId, req.user?.buyerId || '');
    }

    sql += ` ORDER BY o.created_at DESC`;

    const [rows]: any = await db.execute(sql, params);

    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};
