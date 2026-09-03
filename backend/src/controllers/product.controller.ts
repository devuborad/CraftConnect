import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { PricingService } from '../services/pricing.service.js';

/**
 * Helper to resolve artisan profile ID from authenticated user
 */
async function resolveArtisanId(req: AuthRequest): Promise<string> {
  const userId = req.user?.id;
  if (!userId) throw new Error('Authentication required.');

  if (req.user?.artisanId) return req.user.artisanId;

  const [rows]: any = await db.execute(`SELECT id FROM artisans WHERE user_id = ?`, [userId]);
  if (rows && rows.length > 0) {
    return rows[0].id;
  }

  // Create artisan profile for user if it doesn't exist yet
  const newArtisanId = cryptoRandomUUID();
  const userName = req.user?.name || 'Master Artisan';
  await db.execute(
    `INSERT INTO artisans (id, user_id, business_name, location, state, craft_type, experience_years, is_verified, created_at, updated_at)
     VALUES (?, ?, ?, 'Gujarat, India', 'Gujarat', 'Handloom & Handicrafts', 3, TRUE, NOW(), NOW())`,
    [newArtisanId, userId, `${userName} Craft Studio`]
  );
  return newArtisanId;
}

/**
 * Helper to resolve category ID by name or slug
 */
async function resolveCategoryId(categoryName?: string): Promise<string> {
  const nameToMatch = categoryName || 'Textiles';
  const [catRows]: any = await db.execute(
    `SELECT id FROM categories WHERE LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?) LIMIT 1`,
    [nameToMatch, nameToMatch]
  );
  if (catRows && catRows.length > 0) {
    return catRows[0].id;
  }

  const [allCats]: any = await db.execute(`SELECT id FROM categories LIMIT 1`);
  if (allCats && allCats.length > 0) {
    return allCats[0].id;
  }

  const newCatId = cryptoRandomUUID();
  await db.execute(
    `INSERT INTO categories (id, name, slug, description, status, created_at, updated_at) VALUES (?, ?, ?, 'Handmade artisan crafts', 'active', NOW(), NOW())`,
    [newCatId, nameToMatch, nameToMatch.toLowerCase().replace(/\s+/g, '-')]
  );
  return newCatId;
}

/**
 * Public Marketplace Listing (defaults to published products)
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      material,
      craftType,
      status = 'published',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    let whereClause = `WHERE 1=1`;
    const queryParams: any[] = [];

    if (status) {
      whereClause += ` AND p.status = ?`;
      queryParams.push(status);
    }

    if (search) {
      whereClause += ` AND (p.name LIKE ? OR p.description_en LIKE ? OR p.material LIKE ? OR a.business_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      whereClause += ` AND (c.name = ? OR c.slug = ?)`;
      queryParams.push(category, category);
    }

    if (location) {
      whereClause += ` AND a.location LIKE ?`;
      queryParams.push(`%${location}%`);
    }

    if (material) {
      whereClause += ` AND p.material LIKE ?`;
      queryParams.push(`%${material}%`);
    }

    if (craftType) {
      whereClause += ` AND p.craft_type LIKE ?`;
      queryParams.push(`%${craftType}%`);
    }

    if (minPrice) {
      whereClause += ` AND p.price >= ?`;
      queryParams.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      whereClause += ` AND p.price <= ?`;
      queryParams.push(parseFloat(maxPrice as string));
    }

    const countSql = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN artisans a ON p.artisan_id = a.id ${whereClause}`;
    const [countRows]: any = await db.execute(countSql, queryParams);
    const total = countRows[0]?.total || 0;

    const fetchSql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             a.business_name,
             u.name as owner_name,
             CASE 
               WHEN a.business_name IS NOT NULL AND a.business_name != '' AND u.name IS NOT NULL AND u.name != '' AND a.business_name != u.name
                 THEN CONCAT(u.name, ' • ', a.business_name)
               WHEN a.business_name IS NOT NULL AND a.business_name != ''
                 THEN a.business_name
               ELSE COALESCE(u.name, 'Master Artisan')
             END as artisan_name,
             a.location as artisan_location, a.profile_image as artisan_avatar,
             pc.raw_material_cost, pc.labour_cost, pc.packaging_cost, pc.other_cost, pc.total_cost as production_cost,
             pa.recommended_price, pa.market_min, pa.market_max, pa.confidence as pricing_confidence
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN artisans a ON p.artisan_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN product_costs pc ON p.id = pc.product_id
      LEFT JOIN pricing_analysis pa ON p.id = pa.product_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows]: any = await db.execute(fetchSql, [...queryParams, String(limitNum), String(offset)]);

    const products = rows.map((r: any) => ({
      id: r.id,
      title: r.name,
      name: r.name,
      titleGujarati: r.name_gujarati,
      titleHindi: r.name_hindi,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      businessName: r.business_name || undefined,
      ownerName: r.owner_name || undefined,
      artisanAvatar: r.artisan_avatar,
      artisanLocation: r.artisan_location,
      category: r.category_name,
      material: r.material,
      craftType: r.craft_type,
      origin: r.origin,
      price: parseFloat(r.price),
      originalImage: r.original_image_url,
      enhancedImage: r.enhanced_image_url,
      descriptionEn: r.description_en,
      descriptionHi: r.description_hi,
      descriptionGu: r.description_gu,
      status: r.status,
      views: r.views_count,
      stock: r.stock_quantity,
      productionCost: r.production_cost ? parseFloat(r.production_cost) : undefined,
      recommendedPrice: r.recommended_price ? parseFloat(r.recommended_price) : undefined,
      marketRange: r.market_min ? { min: parseFloat(r.market_min), max: parseFloat(r.market_max) } : undefined,
      pricingConfidence: r.pricing_confidence || undefined,
      createdAt: r.created_at,
    }));

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
};

/**
 * Get products belonging to the authenticated artisan (drafts, published, archived)
 */
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const artisanId = await resolveArtisanId(req);
    const { status } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name,
             a.business_name,
             u.name as owner_name,
             CASE 
               WHEN a.business_name IS NOT NULL AND a.business_name != '' AND u.name IS NOT NULL AND u.name != '' AND a.business_name != u.name
                 THEN CONCAT(u.name, ' • ', a.business_name)
               WHEN a.business_name IS NOT NULL AND a.business_name != ''
                 THEN a.business_name
               ELSE COALESCE(u.name, 'Master Artisan')
             END as artisan_name,
             a.location as artisan_location, a.profile_image as artisan_avatar,
             pc.total_cost as production_cost,
             pa.recommended_price, pa.market_min, pa.market_max
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN artisans a ON p.artisan_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN product_costs pc ON p.id = pc.product_id
      LEFT JOIN pricing_analysis pa ON p.id = pa.product_id
      WHERE p.artisan_id = ?
    `;

    const queryParams: any[] = [artisanId];
    if (status) {
      sql += ` AND p.status = ?`;
      queryParams.push(status);
    }

    sql += ` ORDER BY p.updated_at DESC`;

    const [rows]: any = await db.execute(sql, queryParams);

    const products = rows.map((r: any) => ({
      id: r.id,
      title: r.name,
      name: r.name,
      titleGujarati: r.name_gujarati,
      titleHindi: r.name_hindi,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      businessName: r.business_name || undefined,
      ownerName: r.owner_name || undefined,
      artisanAvatar: r.artisan_avatar,
      artisanLocation: r.artisan_location,
      category: r.category_name,
      material: r.material,
      craftType: r.craft_type,
      origin: r.origin,
      price: parseFloat(r.price),
      originalImage: r.original_image_url,
      enhancedImage: r.enhanced_image_url,
      descriptionEn: r.description_en,
      descriptionHi: r.description_hi,
      descriptionGu: r.description_gu,
      status: r.status,
      views: r.views_count,
      stock: r.stock_quantity,
      productionCost: r.production_cost ? parseFloat(r.production_cost) : undefined,
      recommendedPrice: r.recommended_price ? parseFloat(r.recommended_price) : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({
      success: true,
      data: products,
    });
  } catch (err: any) {
    console.error('getMyProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve artisan products' });
  }
};

/**
 * Product detail view
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT p.*, c.name as category_name, 
              a.business_name,
              u.name as owner_name,
              CASE 
                WHEN a.business_name IS NOT NULL AND a.business_name != '' AND u.name IS NOT NULL AND u.name != '' AND a.business_name != u.name
                  THEN CONCAT(u.name, ' • ', a.business_name)
                WHEN a.business_name IS NOT NULL AND a.business_name != ''
                  THEN a.business_name
                ELSE COALESCE(u.name, 'Master Artisan')
              END as artisan_name,
              a.location as artisan_location, a.profile_image as artisan_avatar, a.bio as artisan_story, a.experience_years,
              pc.raw_material_cost, pc.labour_cost, pc.packaging_cost, pc.other_cost, pc.total_cost as production_cost,
              pa.recommended_price, pa.market_min, pa.market_max, pa.confidence as pricing_confidence, pa.reasoning as pricing_reasoning
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN artisans a ON p.artisan_id = a.id
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN product_costs pc ON p.id = pc.product_id
       LEFT JOIN pricing_analysis pa ON p.id = pa.product_id
       WHERE p.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const r = rows[0];
    const product = {
      id: r.id,
      title: r.name,
      name: r.name,
      titleGujarati: r.name_gujarati,
      titleHindi: r.name_hindi,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      artisanAvatar: r.artisan_avatar,
      artisanLocation: r.artisan_location,
      artisanStory: r.artisan_story,
      experienceYears: r.experience_years,
      category: r.category_name,
      material: r.material,
      craftType: r.craft_type,
      origin: r.origin,
      price: parseFloat(r.price),
      originalImage: r.original_image_url,
      enhancedImage: r.enhanced_image_url,
      descriptionEn: r.description_en,
      descriptionHi: r.description_hi,
      descriptionGu: r.description_gu,
      status: r.status,
      views: r.views_count,
      stock: r.stock_quantity,
      productionCost: r.production_cost ? parseFloat(r.production_cost) : undefined,
      recommendedPrice: r.recommended_price ? parseFloat(r.recommended_price) : undefined,
      marketRange: r.market_min ? { min: parseFloat(r.market_min), max: parseFloat(r.market_max) } : undefined,
      pricingConfidence: r.pricing_confidence || undefined,
      pricingReasoning: r.pricing_reasoning || undefined,
      createdAt: r.created_at,
    };

    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

/**
 * Create product helper
 */
async function processProductCreation(req: AuthRequest, targetStatus: 'draft' | 'published') {
  const {
    name,
    title,
    nameGujarati,
    titleGujarati,
    nameHindi,
    titleHindi,
    categoryName,
    category,
    material = 'Organic Fabric',
    craftType = 'Handmade',
    origin = 'Gujarat, India',
    originalImageUrl,
    originalImage,
    imageUrl,
    enhancedImageUrl,
    enhancedImage,
    price,
    stockQuantity,
    stock,
    quantity,
    descriptionEn,
    description,
    descriptionHi,
    descriptionGu,
    costs,
  } = req.body;

  const productName = name || title;
  const prodDescription = descriptionEn || description || productName;
  const mainImage = originalImageUrl || originalImage || imageUrl;
  const prodPrice = price !== undefined ? Number(price) : 0;
  const prodStock = stockQuantity !== undefined ? Number(stockQuantity) : stock !== undefined ? Number(stock) : quantity !== undefined ? Number(quantity) : 1;
  const catName = categoryName || category || 'Textiles';

  if (prodPrice < 0) {
    const err: any = new Error('Price cannot be negative.');
    err.statusCode = 400;
    throw err;
  }

  if (prodStock < 0) {
    const err: any = new Error('Stock quantity cannot be negative.');
    err.statusCode = 400;
    throw err;
  }

  // If creating published product directly, validate required fields
  if (targetStatus === 'published') {
    if (!productName || productName.trim() === '') {
      const err: any = new Error('Product cannot be published because product name is missing.');
      err.statusCode = 400;
      throw err;
    }
    if (!prodDescription || prodDescription.trim() === '') {
      const err: any = new Error('Product cannot be published because description is missing.');
      err.statusCode = 400;
      throw err;
    }
    if (!mainImage || mainImage.trim() === '') {
      const err: any = new Error('Product cannot be published because product image is missing.');
      err.statusCode = 400;
      throw err;
    }
    if (prodPrice <= 0) {
      const err: any = new Error('Product cannot be published because price must be greater than 0.');
      err.statusCode = 400;
      throw err;
    }
  }

  const artisanId = await resolveArtisanId(req);
  const categoryId = await resolveCategoryId(catName);
  const productId = cryptoRandomUUID();

  await db.execute(
    `INSERT INTO products (id, artisan_id, category_id, name, name_gujarati, name_hindi, description_en, description_hi, description_gu, material, craft_type, origin, original_image_url, enhanced_image_url, price, stock_quantity, status, views_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
    [
      productId,
      artisanId,
      categoryId,
      productName || 'Draft Product',
      nameGujarati || titleGujarati || null,
      nameHindi || titleHindi || null,
      prodDescription,
      descriptionHi || null,
      descriptionGu || null,
      material,
      craftType,
      origin,
      mainImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      enhancedImageUrl || enhancedImage || mainImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      prodPrice,
      prodStock,
      targetStatus,
    ]
  );

  if (costs) {
    const costId = cryptoRandomUUID();
    const totalCost = PricingService.calculateTotalCost(costs);
    await db.execute(
      `INSERT INTO product_costs (id, product_id, raw_material_cost, labour_cost, packaging_cost, other_cost, total_cost, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [costId, productId, costs.rawMaterialCost || costs.rawMaterial || 0, costs.labourCost || costs.labor || 0, costs.packagingCost || costs.packaging || 0, costs.otherCost || costs.other || 0, totalCost]
    );

    const pricingRec = PricingService.generatePriceRecommendation(costs, craftType, catName);
    const paId = cryptoRandomUUID();
    await db.execute(
      `INSERT INTO pricing_analysis (id, product_id, market_min, market_max, recommended_price, confidence, reasoning, data_source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [paId, productId, pricingRec.marketRange.min, pricingRec.marketRange.max, pricingRec.recommendedPrice, pricingRec.confidence, pricingRec.reasoning, pricingRec.dataSource]
    );
  }

  return { id: productId, name: productName, price: prodPrice, status: targetStatus };
}

/**
 * Create & publish product (or set status specified in body)
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestedStatus = req.body?.status === 'draft' ? 'draft' : 'published';
    const data = await processProductCreation(req, requestedStatus);

    res.status(201).json({
      success: true,
      message: requestedStatus === 'draft' ? 'Product draft saved successfully.' : 'Product created and published successfully.',
      data,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err.message || 'Failed to create product.' });
  }
};

/**
 * Save product as draft
 */
export const saveProductDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await processProductCreation(req, 'draft');

    res.status(201).json({
      success: true,
      message: 'Product saved as draft successfully.',
      data,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err.message || 'Failed to save product draft.' });
  }
};

/**
 * Update product details with ownership verification
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, title, price, stockQuantity, stock, material, craftType, descriptionEn, description, status } = req.body;

    const [prodRows]: any = await db.execute(`SELECT * FROM products WHERE id = ?`, [id]);
    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const product = prodRows[0];

    // Ownership check
    if (req.user?.role !== 'admin') {
      const artisanId = await resolveArtisanId(req);
      if (product.artisan_id !== artisanId) {
        res.status(403).json({ success: false, message: "Unauthorized. You cannot edit another artisan's product." });
        return;
      }
    }

    const newPrice = price !== undefined ? Number(price) : undefined;
    const newStock = stockQuantity !== undefined ? Number(stockQuantity) : stock !== undefined ? Number(stock) : undefined;

    if (newPrice !== undefined && newPrice < 0) {
      res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      return;
    }

    if (newStock !== undefined && newStock < 0) {
      res.status(400).json({ success: false, message: 'Stock quantity cannot be negative.' });
      return;
    }

    await db.execute(
      `UPDATE products 
       SET name = COALESCE(?, name), price = COALESCE(?, price), stock_quantity = COALESCE(?, stock_quantity),
           material = COALESCE(?, material), craft_type = COALESCE(?, craft_type), description_en = COALESCE(?, description_en),
           status = COALESCE(?, status), updated_at = NOW()
       WHERE id = ?`,
      [
        name || title || null,
        newPrice !== undefined ? newPrice : null,
        newStock !== undefined ? newStock : null,
        material || null,
        craftType || null,
        descriptionEn || description || null,
        status || null,
        id,
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update product' });
  }
};

/**
 * Publish product with validation
 */
export const publishProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [prodRows]: any = await db.execute(`SELECT * FROM products WHERE id = ?`, [id]);

    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const product = prodRows[0];

    // Ownership check
    if (req.user?.role !== 'admin') {
      const artisanId = await resolveArtisanId(req);
      if (product.artisan_id !== artisanId) {
        res.status(403).json({ success: false, message: "Unauthorized. You cannot publish another artisan's product." });
        return;
      }
    }

    // Publish Validation
    if (!product.name || product.name.trim() === '') {
      res.status(400).json({ success: false, message: 'Product cannot be published because product name is missing.' });
      return;
    }

    if (!product.description_en || product.description_en.trim() === '') {
      res.status(400).json({ success: false, message: 'Product cannot be published because description is missing.' });
      return;
    }

    if (!product.price || Number(product.price) <= 0) {
      res.status(400).json({ success: false, message: 'Product cannot be published because price must be greater than 0.' });
      return;
    }

    if (!product.original_image_url || product.original_image_url.trim() === '') {
      res.status(400).json({ success: false, message: 'Product cannot be published because product image is missing.' });
      return;
    }

    await db.execute(`UPDATE products SET status = 'published', updated_at = NOW() WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'Product published live successfully',
      data: { id, status: 'published' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to publish product' });
  }
};

/**
 * Archive product
 */
export const archiveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [prodRows]: any = await db.execute(`SELECT * FROM products WHERE id = ?`, [id]);

    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const product = prodRows[0];

    // Ownership check
    if (req.user?.role !== 'admin') {
      const artisanId = await resolveArtisanId(req);
      if (product.artisan_id !== artisanId) {
        res.status(403).json({ success: false, message: "Unauthorized. You cannot archive another artisan's product." });
        return;
      }
    }

    await db.execute(`UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'Product archived successfully',
      data: { id, status: 'archived' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to archive product' });
  }
};

/**
 * Delete product with ownership verification
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [prodRows]: any = await db.execute(`SELECT artisan_id FROM products WHERE id = ?`, [id]);
    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.user?.role !== 'admin') {
      const artisanId = await resolveArtisanId(req);
      if (prodRows[0].artisan_id !== artisanId) {
        res.status(403).json({ success: false, message: 'Unauthorized to delete this product' });
        return;
      }
    }

    await db.execute(`DELETE FROM products WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

/**
 * Increment product view count
 */
export const incrementProductView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute(`UPDATE products SET views_count = views_count + 1 WHERE id = ?`, [id]);
    res.json({ success: true, message: 'View count incremented' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to increment views' });
  }
};

export const getProductAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = `WHERE 1=1`;
    const queryParams: any[] = [];

    if (userRole === 'artisan') {
      whereClause += ` AND (a.user_id = ? OR p.artisan_id = ?)`;
      queryParams.push(userId, req.user?.artisanId || '');
    }

    const sql = `
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN p.status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(COALESCE(p.stock_quantity, 1)) as total_stock_units,
        SUM(COALESCE(p.stock_quantity, 1) * p.price) as total_inventory_value,
        AVG(p.price) as avg_product_price,
        SUM(p.views_count) as total_views,
        SUM(CASE WHEN p.enhanced_image_url IS NOT NULL AND p.enhanced_image_url != '' THEN 1 ELSE 0 END) as ai_enhanced_count
      FROM products p
      LEFT JOIN artisans a ON p.artisan_id = a.id
      ${whereClause}
    `;

    const [rows]: any = await db.execute(sql, queryParams);
    const data = rows[0] || {};

    res.json({
      success: true,
      data: {
        totalProducts: parseInt(data.total_products || 0, 10),
        publishedCount: parseInt(data.published_count || 0, 10),
        pendingCount: parseInt(data.pending_count || 0, 10),
        draftCount: parseInt(data.draft_count || 0, 10),
        totalStockUnits: parseInt(data.total_stock_units || 0, 10),
        totalInventoryValue: parseFloat(data.total_inventory_value || 0),
        avgProductPrice: parseFloat(data.avg_product_price || 0),
        totalViews: parseInt(data.total_views || 0, 10),
        aiEnhancedCount: parseInt(data.ai_enhanced_count || 0, 10)
      }
    });
  } catch (err: any) {
    console.error('getProductAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product analytics' });
  }
};
