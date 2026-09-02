import { Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Helper to resolve buyer ID for authenticated user
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
 * POST /api/orders - Create Order from Cart (with MySQL Transaction, Price Security, & Stock Deduction)
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  try {
    const buyerId = await resolveBuyerId(req);
    const { items: requestItems, shippingDetails } = req.body;

    let itemsToProcess: Array<{ productId: string; quantity: number }> = [];

    // Get cart items if items array is not provided
    const [cartRows]: any = await connection.execute(`SELECT id FROM carts WHERE buyer_id = ?`, [buyerId]);
    let cartId = cartRows[0]?.id;

    if (requestItems && Array.isArray(requestItems) && requestItems.length > 0) {
      itemsToProcess = requestItems.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: parseInt(i.quantity, 10) || 1,
      }));
    } else if (cartId) {
      const [ciRows]: any = await connection.execute(`SELECT product_id, quantity FROM cart_items WHERE cart_id = ?`, [cartId]);
      if (ciRows && ciRows.length > 0) {
        itemsToProcess = ciRows.map((r: any) => ({
          productId: r.product_id,
          quantity: r.quantity,
        }));
      }
    }

    if (itemsToProcess.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty. Add products before placing an order.' });
      return;
    }

    const shipName = shippingDetails?.name || req.user?.name || 'Valued Buyer';
    const shipPhone = shippingDetails?.phone || '+91 98200 11223';
    const shipAddr = shippingDetails?.address || 'Direct Artisan Delivery Address';
    const shipCity = shippingDetails?.city || 'Mumbai';
    const shipState = shippingDetails?.state || 'Maharashtra';
    const shipPincode = shippingDetails?.pincode || '400001';

    // Begin MySQL Transaction
    await connection.beginTransaction();

    let subtotalAmount = 0;
    const validatedItems: Array<{ productId: string; artisanId: string; quantity: number; unitPrice: number; subtotal: number }> = [];

    // Verify stock & server-side prices (PRICE SECURITY RULE: ignore client price)
    for (const item of itemsToProcess) {
      const [prodRows]: any = await connection.execute(
        `SELECT id, price, stock_quantity, status, artisan_id FROM products WHERE id = ? FOR UPDATE`,
        [item.productId]
      );

      if (!prodRows || prodRows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found.`);
      }

      const prod = prodRows[0];
      if (prod.status !== 'published') {
        throw new Error(`Product ${prod.name || prod.id} is not published.`);
      }

      const qty = item.quantity;
      if (qty <= 0) {
        throw new Error('Item quantity must be greater than 0.');
      }

      if (prod.stock_quantity < qty) {
        throw new Error(`Insufficient stock for product. Available: ${prod.stock_quantity}, requested: ${qty}.`);
      }

      // Always fetch official DB price
      const dbUnitPrice = parseFloat(prod.price);
      const itemSubtotal = dbUnitPrice * qty;
      subtotalAmount += itemSubtotal;

      validatedItems.push({
        productId: prod.id,
        artisanId: prod.artisan_id,
        quantity: qty,
        unitPrice: dbUnitPrice,
        subtotal: itemSubtotal,
      });

      // Reduce stock
      await connection.execute(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`, [qty, prod.id]);
    }

    const shippingFee = subtotalAmount > 3000 ? 0 : 250;
    const grandTotal = subtotalAmount + shippingFee;
    const orderId = cryptoRandomUUID();

    // Create Order
    await connection.execute(
      `INSERT INTO orders (id, buyer_id, total_amount, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, created_at, updated_at)
       VALUES (?, ?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [orderId, buyerId, grandTotal, shipName, shipPhone, shipAddr, shipCity, shipState, shipPincode]
    );

    // Create Order Items (snapshot historical price)
    for (const vi of validatedItems) {
      const orderItemId = cryptoRandomUUID();
      await connection.execute(
        `INSERT INTO order_items (id, order_id, product_id, artisan_id, quantity, unit_price, subtotal, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [orderItemId, orderId, vi.productId, vi.artisanId, vi.quantity, vi.unitPrice, vi.subtotal]
      );
    }

    // Clear cart if cart exists
    if (cartId) {
      await connection.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
    }

    // Commit Transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      data: {
        orderId,
        status: 'confirmed',
        subtotal: subtotalAmount,
        shipping: shippingFee,
        total: grandTotal,
        totalAmount: grandTotal,
      },
    });
  } catch (err: any) {
    await connection.rollback();
    console.error('createOrder error:', err.message || err);
    res.status(400).json({ success: false, message: err.message || 'Failed to place order.' });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/orders/buy-now - Direct single product purchase with transaction & DB price enforcement
 */
export const buyNowOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  try {
    const buyerId = await resolveBuyerId(req);
    const { productId, quantity = 1, shippingDetails } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required for Buy Now.' });
      return;
    }

    const qty = parseInt(quantity, 10) || 1;
    if (qty <= 0) {
      res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
      return;
    }

    const shipName = shippingDetails?.name || req.user?.name || 'Direct Buyer';
    const shipPhone = shippingDetails?.phone || '+91 98200 11223';
    const shipAddr = shippingDetails?.address || 'Direct Artisan Delivery Address';
    const shipCity = shippingDetails?.city || 'Mumbai';
    const shipState = shippingDetails?.state || 'Maharashtra';
    const shipPincode = shippingDetails?.pincode || '400001';

    await connection.beginTransaction();

    // Lock product & get database price
    const [prodRows]: any = await connection.execute(
      `SELECT id, name, price, stock_quantity, status, artisan_id FROM products WHERE id = ? FOR UPDATE`,
      [productId]
    );

    if (!prodRows || prodRows.length === 0) {
      throw new Error('Product not found.');
    }

    const prod = prodRows[0];
    if (prod.status !== 'published') {
      throw new Error('Product is not published or available for purchase.');
    }

    if (prod.stock_quantity < qty) {
      throw new Error(`Insufficient stock for product. Available: ${prod.stock_quantity}.`);
    }

    // Always fetch official DB price
    const dbUnitPrice = parseFloat(prod.price);
    const subtotal = dbUnitPrice * qty;
    const shippingFee = subtotal > 3000 ? 0 : 250;
    const grandTotal = subtotal + shippingFee;

    const orderId = cryptoRandomUUID();

    await connection.execute(
      `INSERT INTO orders (id, buyer_id, total_amount, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, created_at, updated_at)
       VALUES (?, ?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [orderId, buyerId, grandTotal, shipName, shipPhone, shipAddr, shipCity, shipState, shipPincode]
    );

    const orderItemId = cryptoRandomUUID();
    await connection.execute(
      `INSERT INTO order_items (id, order_id, product_id, artisan_id, quantity, unit_price, subtotal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [orderItemId, orderId, prod.id, prod.artisan_id, qty, dbUnitPrice, subtotal]
    );

    // Deduct stock
    await connection.execute(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`, [qty, prod.id]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Buy Now order placed successfully!',
      data: {
        orderId,
        status: 'confirmed',
        subtotal,
        shipping: shippingFee,
        total: grandTotal,
        totalAmount: grandTotal,
      },
    });
  } catch (err: any) {
    await connection.rollback();
    console.error('buyNowOrder error:', err.message || err);
    res.status(400).json({ success: false, message: err.message || 'Failed to complete Buy Now purchase.' });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/orders - Get orders belonging to authenticated buyer
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = await resolveBuyerId(req);
    const userRole = req.user?.role;

    let sql = `
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
    `;
    const params: any[] = [];

    if (userRole !== 'admin') {
      sql += ` WHERE o.buyer_id = ?`;
      params.push(buyerId);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const [orders]: any = await db.execute(sql, params);

    const formattedOrders = orders.map((o: any) => ({
      id: o.id,
      orderId: o.id,
      buyerId: o.buyer_id,
      totalAmount: parseFloat(o.total_amount),
      status: o.status,
      shippingName: o.shipping_name,
      shippingCity: o.shipping_city,
      itemsCount: o.items_count,
      createdAt: o.created_at,
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (err: any) {
    console.error('getOrders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * GET /api/orders/:id - Get order details with security check (Ownership verification)
 */
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const buyerId = await resolveBuyerId(req);

    const [orderRows]: any = await db.execute(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!orderRows || orderRows.length === 0) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const order = orderRows[0];

    // Security Check: Buyer can only view their own orders
    if (req.user?.role !== 'admin' && order.buyer_id !== buyerId) {
      res.status(403).json({ success: false, message: "Unauthorized. You cannot view another buyer's order." });
      return;
    }

    // Fetch order items with historical snapshot prices & product details
    const [items]: any = await db.execute(
      `SELECT oi.*, p.name as product_name, p.original_image_url, p.enhanced_image_url,
              a.business_name as artisan_name, a.location as artisan_location
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN artisans a ON oi.artisan_id = a.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const formattedItems = items.map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      artisanId: i.artisan_id,
      artisanName: i.artisan_name,
      quantity: i.quantity,
      unitPrice: parseFloat(i.unit_price),
      subtotal: parseFloat(i.subtotal),
      image: i.enhanced_image_url || i.original_image_url,
    }));

    res.json({
      success: true,
      data: {
        id: order.id,
        orderId: order.id,
        buyerId: order.buyer_id,
        totalAmount: parseFloat(order.total_amount),
        status: order.status,
        shippingDetails: {
          name: order.shipping_name,
          phone: order.shipping_phone,
          address: order.shipping_address,
          city: order.shipping_city,
          state: order.shipping_state,
          pincode: order.shipping_pincode,
        },
        items: formattedItems,
        createdAt: order.created_at,
      },
    });
  } catch (err: any) {
    console.error('getOrderById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};
