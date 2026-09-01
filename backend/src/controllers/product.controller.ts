import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { cryptoRandomUUID } from '../utils/uuid.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { PricingService } from '../services/pricing.service.js';

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

    // Public users only see published products, unless specified or filtered
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

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN artisans a ON p.artisan_id = a.id ${whereClause}`;
    const [countRows]: any = await db.execute(countSql, queryParams);
    const total = countRows[0]?.total || 0;

    // Fetch query
    const fetchSql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             a.business_name as artisan_name, a.location as artisan_location, a.profile_image as artisan_avatar,
             pc.raw_material_cost, pc.labour_cost, pc.packaging_cost, pc.other_cost, pc.total_cost as production_cost,
             pa.recommended_price, pa.market_min, pa.market_max, pa.confidence as pricing_confidence
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN artisans a ON p.artisan_id = a.id
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
      titleGujarati: r.name_gujarati,
      titleHindi: r.name_hindi,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
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

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      `SELECT p.*, c.name as category_name, 
              a.business_name as artisan_name, a.location as artisan_location, a.profile_image as artisan_avatar, a.bio as artisan_story, a.experience_years,
              pc.raw_material_cost, pc.labour_cost, pc.packaging_cost, pc.other_cost, pc.total_cost as production_cost,
              pa.recommended_price, pa.market_min, pa.market_max, pa.confidence as pricing_confidence, pa.reasoning as pricing_reasoning
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN artisans a ON p.artisan_id = a.id
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

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      nameGujarati,
      nameHindi,
      categoryName = 'Textiles',
      material = 'Organic Cotton',
      craftType = 'Handwoven',
      origin = 'Gujarat',
      originalImageUrl,
      enhancedImageUrl,
      price,
      stockQuantity = 1,
      descriptionEn,
      descriptionHi,
      descriptionGu,
      costs,
    } = req.body;

    if (!name || !price || !originalImageUrl) {
      res.status(400).json({ success: false, message: 'Name, price, and original image URL are required.' });
      return;
    }

    // Resolve artisan ID
    let artisanId = req.user?.artisanId;
    if (!artisanId) {
      const [artisanRows]: any = await db.execute(`SELECT id FROM artisans WHERE user_id = ?`, [req.user?.id || '']);
      if (artisanRows.length > 0) {
        artisanId = artisanRows[0].id;
      } else {
        // Fallback default artisan for testing
        const [defaultRows]: any = await db.execute(`SELECT id FROM artisans LIMIT 1`);
        artisanId = defaultRows[0]?.id || 'art-1';
      }
    }

    // Resolve Category ID
    const [catRows]: any = await db.execute(`SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1`, [categoryName, categoryName.toLowerCase()]);
    const categoryId = catRows[0]?.id || 'cat-1';

    const productId = cryptoRandomUUID();

    // Insert Product
    await db.execute(
      `INSERT INTO products (id, artisan_id, category_id, name, name_gujarati, name_hindi, description_en, description_hi, description_gu, material, craft_type, origin, original_image_url, enhanced_image_url, price, stock_quantity, status, views_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, NOW(), NOW())`,
      [
        productId,
        artisanId,
        categoryId,
        name,
        nameGujarati || null,
        nameHindi || null,
        descriptionEn || name,
        descriptionHi || null,
        descriptionGu || null,
        material,
        craftType,
        origin,
        originalImageUrl,
        enhancedImageUrl || originalImageUrl,
        parseFloat(price),
        parseInt(stockQuantity, 10) || 1,
      ]
    );

    // Insert Costs if provided
    if (costs) {
      const costId = cryptoRandomUUID();
      const totalCost = PricingService.calculateTotalCost(costs);
      await db.execute(
        `INSERT INTO product_costs (id, product_id, raw_material_cost, labour_cost, packaging_cost, other_cost, total_cost, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [costId, productId, costs.rawMaterialCost || 0, costs.labourCost || 0, costs.packagingCost || 0, costs.otherCost || 0, totalCost]
      );

      // Generate & insert AI pricing analysis
      const pricingRec = PricingService.generatePriceRecommendation(costs, craftType, categoryName);
      const paId = cryptoRandomUUID();
      await db.execute(
        `INSERT INTO pricing_analysis (id, product_id, market_min, market_max, recommended_price, confidence, reasoning, data_source, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [paId, productId, pricingRec.marketRange.min, pricingRec.marketRange.max, pricingRec.recommendedPrice, pricingRec.confidence, pricingRec.reasoning, pricingRec.dataSource]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Product created and published successfully.',
      data: { id: productId, name, price },
    });
  } catch (err: any) {
    console.error('createProduct error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, stockQuantity, material, craftType, descriptionEn, status } = req.body;

    // Verify ownership or admin role
    const [prodRows]: any = await db.execute(`SELECT artisan_id FROM products WHERE id = ?`, [id]);
    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.user?.role !== 'admin' && prodRows[0].artisan_id !== req.user?.artisanId) {
      res.status(403).json({ success: false, message: 'Unauthorized to edit this product' });
      return;
    }

    await db.execute(
      `UPDATE products 
       SET name = COALESCE(?, name), price = COALESCE(?, price), stock_quantity = COALESCE(?, stock_quantity),
           material = COALESCE(?, material), craft_type = COALESCE(?, craft_type), description_en = COALESCE(?, description_en),
           status = COALESCE(?, status), updated_at = NOW()
       WHERE id = ?`,
      [name, price, stockQuantity, material, craftType, descriptionEn, status, id]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [prodRows]: any = await db.execute(`SELECT artisan_id FROM products WHERE id = ?`, [id]);
    if (!prodRows || prodRows.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.user?.role !== 'admin' && prodRows[0].artisan_id !== req.user?.artisanId) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this product' });
      return;
    }

    await db.execute(`DELETE FROM products WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const incrementProductView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute(`UPDATE products SET views_count = views_count + 1 WHERE id = ?`, [id]);
    res.json({ success: true, message: 'View count incremented' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to increment views' });
  }
};
