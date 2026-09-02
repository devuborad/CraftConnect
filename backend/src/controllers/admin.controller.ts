import { Request, Response } from 'express';
import { db } from '../config/db.js';

/**
 * GET /api/admin/overview & /api/admin/dashboard - Aggregated platform statistics
 */
export const getAdminOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [userRows]: any = await db.execute(`SELECT COUNT(*) as count FROM users`);
    const [artisanRows]: any = await db.execute(`SELECT COUNT(*) as count FROM artisans`);
    const [buyerRows]: any = await db.execute(`SELECT COUNT(*) as count FROM buyers`);
    const [productRows]: any = await db.execute(`SELECT COUNT(*) as count FROM products`);
    const [publishedRows]: any = await db.execute(`SELECT COUNT(*) as count FROM products WHERE status = 'published'`);
    const [draftRows]: any = await db.execute(`SELECT COUNT(*) as count FROM products WHERE status = 'draft'`);
    const [orderRows]: any = await db.execute(`SELECT COUNT(*) as count FROM orders`);
    const [inquiryRows]: any = await db.execute(`SELECT COUNT(*) as count FROM inquiries`);
    const [aiRows]: any = await db.execute(`SELECT COUNT(*) as count FROM ai_activity`);

    const users = userRows[0]?.count || 0;
    const artisans = artisanRows[0]?.count || 0;
    const buyers = buyerRows[0]?.count || 0;
    const products = productRows[0]?.count || 0;
    const publishedProducts = publishedRows[0]?.count || 0;
    const draftProducts = draftRows[0]?.count || 0;
    const orders = orderRows[0]?.count || 0;
    const inquiries = inquiryRows[0]?.count || 0;
    const aiRequests = aiRows[0]?.count || 0;

    res.json({
      success: true,
      data: {
        users,
        artisans,
        totalArtisans: artisans,
        buyers,
        totalBuyers: buyers,
        products,
        totalProducts: products,
        publishedProducts,
        draftProducts,
        orders,
        totalOrders: orders,
        inquiries,
        totalInquiries: inquiries,
        aiRequests,
        totalAIRequests: aiRequests,
      },
    });
  } catch (err: any) {
    console.error('getAdminOverview error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch platform overview' });
  }
};

/**
 * GET /api/admin/artisans - Safe artisan management list (excludes password hashes)
 */
export const getAdminArtisans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT a.id, a.user_id, a.business_name, a.location, a.state, a.craft_type, a.experience_years, a.is_verified, a.created_at,
              u.name, u.email, u.phone, u.status as user_status,
              (SELECT COUNT(*) FROM products WHERE artisan_id = a.id) as total_products,
              (SELECT COUNT(*) FROM products WHERE artisan_id = a.id AND status = 'published') as published_products
       FROM artisans a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      businessName: r.business_name,
      email: r.email,
      phone: r.phone,
      location: r.location,
      state: r.state,
      craftType: r.craft_type,
      experienceYears: r.experience_years,
      isVerified: Boolean(r.is_verified),
      status: r.user_status,
      totalProducts: r.total_products,
      publishedProducts: r.published_products,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getAdminArtisans error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch artisans list' });
  }
};

/**
 * GET /api/admin/artisans/:id - Single artisan detail for admin
 */
export const getAdminArtisanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT a.id, a.user_id, a.business_name, a.location, a.state, a.craft_type, a.experience_years, a.bio, a.is_verified, a.created_at,
              u.name, u.email, u.phone, u.status as user_status,
              (SELECT COUNT(*) FROM products WHERE artisan_id = a.id) as total_products,
              (SELECT COUNT(*) FROM products WHERE artisan_id = a.id AND status = 'published') as published_products,
              (SELECT COUNT(*) FROM inquiries WHERE artisan_id = a.id) as inquiry_count
       FROM artisans a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ? OR a.user_id = ?`,
      [id, id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Artisan not found' });
      return;
    }

    const r = rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        name: r.name,
        businessName: r.business_name,
        email: r.email,
        phone: r.phone,
        location: r.location,
        state: r.state,
        craftType: r.craft_type,
        experienceYears: r.experience_years,
        bio: r.bio,
        isVerified: Boolean(r.is_verified),
        status: r.user_status,
        totalProducts: r.total_products,
        publishedProducts: r.published_products,
        inquiryCount: r.inquiry_count,
        createdAt: r.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch artisan details' });
  }
};

/**
 * GET /api/admin/buyers - Safe buyer directory (excludes sensitive passwords)
 */
export const getAdminBuyers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT b.id, b.user_id, b.company_name, b.location, b.buyer_type, b.created_at,
              u.name, u.email, u.phone, u.status as user_status,
              (SELECT COUNT(*) FROM inquiries WHERE buyer_id = b.id) as inquiry_count,
              (SELECT COUNT(*) FROM orders WHERE buyer_id = b.id) as order_count
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      companyName: r.company_name,
      location: r.location,
      buyerType: r.buyer_type,
      status: r.user_status,
      inquiryCount: r.inquiry_count,
      orderCount: r.order_count,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getAdminBuyers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch buyers list' });
  }
};

/**
 * GET /api/admin/products - Product moderation directory
 */
export const getAdminProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT p.*, c.name as category_name, a.business_name as artisan_name, u_art.name as artisan_owner
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN artisans a ON p.artisan_id = a.id
       LEFT JOIN users u_art ON a.user_id = u_art.id
       ORDER BY p.created_at DESC`
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      title: r.name,
      name: r.name,
      titleGujarati: r.name_gujarati,
      titleHindi: r.name_hindi,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name || r.artisan_owner || 'Artisan',
      category: r.category_name,
      craftType: r.craft_type,
      material: r.material,
      price: parseFloat(r.price),
      originalImage: r.original_image_url,
      enhancedImage: r.enhanced_image_url || r.original_image_url,
      status: r.status,
      stock: r.stock_quantity,
      views: r.views_count,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getAdminProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin products list' });
  }
};

/**
 * PATCH & PUT /api/admin/products/:id/status - Product Moderation Status Update
 */
export const moderateProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['published', 'pending', 'approved', 'rejected', 'draft', 'archived'];

    // Map common frontend capitalization aliases
    let targetStatus = (status || '').toString().toLowerCase();
    if (targetStatus === 'published' || targetStatus === 'approved') targetStatus = 'published';
    if (targetStatus === 'rejected') targetStatus = 'rejected';

    if (!allowedStatuses.includes(targetStatus)) {
      res.status(400).json({ success: false, message: `Invalid status '${status}'. Allowed: ${allowedStatuses.join(', ')}` });
      return;
    }

    await db.execute(`UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?`, [targetStatus, id]);

    res.json({
      success: true,
      message: `Product status updated to ${targetStatus} successfully.`,
      data: { id, status: targetStatus },
    });
  } catch (err: any) {
    console.error('moderateProductStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update product status' });
  }
};

/**
 * GET /api/admin/orders - Order analytics & management for admin
 */
export const getAdminOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT o.*, u.name as buyer_name, b.company_name,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
       FROM orders o
       JOIN buyers b ON o.buyer_id = b.id
       JOIN users u ON b.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      orderId: r.id,
      buyerId: r.buyer_id,
      buyerName: r.buyer_name,
      buyerCompany: r.company_name,
      totalAmount: parseFloat(r.total_amount),
      status: r.status,
      shippingCity: r.shipping_city,
      shippingState: r.shipping_state,
      itemsCount: r.items_count,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getAdminOrders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin orders' });
  }
};

/**
 * GET /api/admin/inquiries - Bulk inquiry analytics for admin
 */
export const getAdminInquiries = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT i.*, p.name as product_title, p.price as product_retail_price,
              u_buy.name as buyer_name, b.company_name as buyer_company,
              u_art.name as artisan_name, a.business_name as artisan_business
       FROM inquiries i
       JOIN products p ON i.product_id = p.id
       JOIN buyers b ON i.buyer_id = b.id
       JOIN users u_buy ON b.user_id = u_buy.id
       JOIN artisans a ON i.artisan_id = a.id
       JOIN users u_art ON a.user_id = u_art.id
       ORDER BY i.created_at DESC`
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      productRetailPrice: parseFloat(r.product_retail_price),
      buyerId: r.buyer_id,
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      artisanBusiness: r.artisan_business,
      quantity: r.quantity,
      targetPrice: parseFloat(r.target_price),
      counterPrice: r.counter_price ? parseFloat(r.counter_price) : undefined,
      status: r.status,
      message: r.message,
      createdAt: r.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getAdminInquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin inquiries' });
  }
};

/**
 * GET /api/admin/ai-activity - AI assist request log directory (excludes secrets/keys)
 */
export const getAdminAIActivity = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT ai.*, u.name as user_name, u.role as user_role
       FROM ai_activity ai
       LEFT JOIN users u ON ai.user_id = u.id
       ORDER BY ai.created_at DESC
       LIMIT 100`
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      feature: r.feature,
      type: r.feature,
      status: r.status,
      durationMs: r.processing_time_ms,
      processingTimeMs: r.processing_time_ms,
      userId: r.user_id,
      userName: r.user_name || 'Artisan User',
      userRole: r.user_role || 'artisan',
      createdAt: r.created_at,
      timestamp: r.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getAdminAIActivity error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch AI activity log' });
  }
};

/**
 * GET /api/admin/ai-stats - Real SQL Aggregated AI Usage Statistics
 */
export const getAdminAIStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [aggRows]: any = await db.execute(
      `SELECT COUNT(*) as total_requests,
              SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
              SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_requests,
              AVG(processing_time_ms) as avg_processing_time
       FROM ai_activity`
    );

    const agg = aggRows[0] || {};
    const totalRequests = Number(agg.total_requests || 0);
    const successfulRequests = Number(agg.successful_requests || 0);
    const failedRequests = Number(agg.failed_requests || 0);
    const avgMs = Math.round(Number(agg.avg_processing_time || 0));
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 1000) / 10 : 100;

    const [featureRows]: any = await db.execute(
      `SELECT feature, COUNT(*) as count FROM ai_activity GROUP BY feature`
    );

    const featureBreakdown: Record<string, number> = {};
    for (const r of featureRows) {
      featureBreakdown[r.feature] = Number(r.count);
    }

    res.json({
      success: true,
      data: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate,
        averageProcessingTimeMs: avgMs,
        featureBreakdown,
      },
    });
  } catch (err: any) {
    console.error('getAdminAIStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch AI usage statistics' });
  }
};

/**
 * GET /api/admin/pricing-analytics - Real SQL Analytics on AI Pricing Engine
 */
export const getAdminPricingAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.execute(
      `SELECT COUNT(*) as total_analyses,
              AVG(recommended_price) as avg_recommended_price,
              AVG(market_min) as avg_market_min,
              AVG(market_max) as avg_market_max,
              AVG(confidence) as avg_confidence
       FROM pricing_analysis`
    );

    const r = rows[0] || {};
    res.json({
      success: true,
      data: {
        totalAnalyses: Number(r.total_analyses || 0),
        avgRecommendedPrice: Math.round(Number(r.avg_recommended_price || 0)),
        avgMarketMin: Math.round(Number(r.avg_market_min || 0)),
        avgMarketMax: Math.round(Number(r.avg_market_max || 0)),
        avgConfidence: Math.round(Number(r.avg_confidence || 85)),
      },
    });
  } catch (err: any) {
    console.error('getAdminPricingAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing analytics' });
  }
};

/**
 * GET /api/admin/analytics - Platform Overall Performance Analytics
 */
export const getPlatformAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [revRows]: any = await db.execute(`SELECT SUM(total_amount) as total_revenue FROM orders WHERE status = 'confirmed' OR status = 'delivered'`);
    const [inqVolRows]: any = await db.execute(`SELECT SUM(quantity * target_price) as total_volume FROM inquiries`);

    const totalRevenue = Number(revRows[0]?.total_revenue || 0);
    const totalInquiryVolume = Number(inqVolRows[0]?.total_volume || 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalInquiryVolume,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch platform analytics' });
  }
};
