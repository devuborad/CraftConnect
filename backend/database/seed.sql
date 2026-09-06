USE craftconnect;

-- Seed Categories
INSERT INTO categories (id, name, slug, description, image, status) VALUES
('cat-1', 'Textiles', 'textiles', 'Handwoven sarees, shawls, fabrics, and traditional garments', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 'active'),
('cat-2', 'Pottery', 'pottery', 'Terracotta cookware, decorative vases, and clay art', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 'active'),
('cat-3', 'Woodcraft', 'woodcraft', 'Hand-carved wooden sculptures, utility items, and toys', 'https://images.unsplash.com/photo-1605885064319-15e5b3c507c8?auto=format&fit=crop&q=80&w=800', 'active'),
('cat-4', 'Jewellery', 'jewellery', 'Traditional silver, beaded, and terracotta ornaments', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', 'active'),
('cat-5', 'Handicrafts', 'handicrafts', 'Ethnic crafts, puppets, brasswork, and tribal artifacts', 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800', 'active'),
('cat-6', 'Art', 'art', 'Mithila, Warli, Madhubani, and Tanjore paintings', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800', 'active'),
('cat-7', 'Home Decor', 'home-decor', 'Embroidered cushions, wall hangings, and brass lanterns', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800', 'active');

-- Seed Users (Bcrypt hashes: $2b$10$XGfhZtQrg43seEuuphMqc.SznKmL.5tD74GsuIgTjuXTe1AJNF7Ny for 492320Devu$, $2b$10$pgRib.WUAWt1A5C3bWHhYe.VJauhoVHDe0pMXYsPZwIm9XOfD4WCy for password123)
INSERT INTO users (id, name, email, phone, password_hash, role, language, status) VALUES
('usr-devu-admin', 'Devu Borad (Admin)', 'devborad22@gmail.com', '+919876543210', '$2b$10$XGfhZtQrg43seEuuphMqc.SznKmL.5tD74GsuIgTjuXTe1AJNF7Ny', 'admin', 'en', 'active'),
('usr-prit-artisan', 'Prit Jasani (Artisan)', 'pritjasani007@gmail.com', '+919876500007', '$2b$10$pgRib.WUAWt1A5C3bWHhYe.VJauhoVHDe0pMXYsPZwIm9XOfD4WCy', 'artisan', 'gu', 'active'),
('usr-patel-buyer', 'Patel DD (Buyer)', 'pateldd2222@gmail.com', '+919876522222', '$2b$10$pgRib.WUAWt1A5C3bWHhYe.VJauhoVHDe0pMXYsPZwIm9XOfD4WCy', 'buyer', 'en', 'active'),
('usr-admin-dax', 'Dax Koladiya (Admin)', 'ticketfordax@gmail.com', '8141702217', '$2b$10$pgRib.WUAWt1A5C3bWHhYe.VJauhoVHDe0pMXYsPZwIm9XOfD4WCy', 'admin', 'en', 'active'),
('user-artisan-1', 'Meena Ben Vankar', 'meena@craftconnect.in', '9825012345', '$2b$10$pgRib.WUAWt1A5C3bWHhYe.VJauhoVHDe0pMXYsPZwIm9XOfD4WCy', 'artisan', 'gu', 'active');

-- Seed Artisans Profiles
INSERT INTO artisans (id, user_id, business_name, location, state, craft_type, experience_years, bio, profile_image, is_verified) VALUES
('art-prit', 'usr-prit-artisan', 'Prit Jasani Craft Heritage Studio', 'Gujarat', 'Gujarat', 'Handloom, Pottery & Handicrafts', 10, 'Master rural artisan crafting handwoven textiles, pottery dishes, and traditional Indian handicrafts.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', TRUE),
('art-devu', 'usr-devu-admin', 'Devu Crafts Studio', 'Surat', 'Gujarat', 'Handloom & Traditional Art', 5, 'Master Artisan and Platform Creator.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', TRUE),
('art-1', 'user-artisan-1', 'Kutch Weavers Heritage', 'Bhuj', 'Gujarat', 'Handloom & Patola', 18, 'Master weaver specializing in authentic double ikkat Patola sarees and organic cotton drapes from Kutch, Gujarat.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', TRUE);

-- Seed Buyers Profiles
INSERT INTO buyers (id, user_id, company_name, location, buyer_type) VALUES
('buy-patel', 'usr-patel-buyer', 'Patel DD Heritage Collections', 'Gujarat', 'business');

-- Seed Products
INSERT INTO products (id, artisan_id, category_id, name, name_gujarati, name_hindi, description_en, description_hi, description_gu, material, craft_type, origin, original_image_url, enhanced_image_url, price, stock_quantity, status, views_count) VALUES
('prod-prit-1', 'art-prit', 'cat-1', 'Authentic Handwoven Patola Cotton Saree', 'હાથથી વણેલી પટોળા કોટન સાડી', 'हाथ से बुनी पटोला कॉटन साड़ी', 'Exquisite handwoven Patola saree featuring traditional geometric motifs woven with natural dyes by master weavers.', 'प्राकृतिक रंगों से बनी प्रामाणिक हाथ से बुनी पटोला साड़ी।', 'ઓરિજિનલ પટોળા કોટન સાડી.', 'Pure Organic Cotton', 'Handloom Double Ikkat', 'Patan, Gujarat', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 4499.00, 12, 'published', 285),
('prod-prit-2', 'art-prit', 'cat-2', 'Handcrafted Terracotta Clay Water Jug (Matka)', 'હાથથી બનાવેલો માટીનો કૂજો', 'हाथ से बना मिट्टी का मटका', 'Eco-friendly natural red clay water vessel with hand-carved ethnic motifs. Keeps water naturally cool and fresh.', 'प्राकृतिक रूप से पानी को ठंडा रखने वाला पर्यावरण के अनुकूल मिट्टी का घड़ा।', 'પાણીને કુદરતી રીતે ઠંડુ રાખવા માટે ઓર્ગેનિક લાલ માટીમાંથી બનાવેલો માટલું.', 'Red Clay Terracotta', 'Wheel Throwing & Carving', 'Kutch, Gujarat', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 899.00, 30, 'published', 210),
('prod-prit-3', 'art-prit', 'cat-2', 'Hand-Painted Blue Pottery Decorative Plates Set', 'હાથથી ચીતરેલ બ્લુ પોટ્રી પ્લેટ સેટ', 'हाथ से चित्रित ब्लू पॉटरी प्लेट सेट', 'Hand-painted ceramic blue pottery plate set featuring Persian floral art motifs.', 'पारंपरिक फूलों के डिज़ाइन से सजी हुई सुंदर ब्लू पॉटरी प्लेट सेट।', 'પરંપરાગત ફૂલોની ડિઝાઈન સાથે બનેલી સુંદર બ્લુ પોટ્રી પ્લેટ સેટ.', 'Ceramic & Quartz Glaze', 'Jaipur Blue Pottery', 'Rajasthan, India', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 1499.00, 20, 'published', 450);

-- Seed Product Costs
INSERT INTO product_costs (id, product_id, raw_material_cost, labour_cost, packaging_cost, other_cost, total_cost) VALUES
('cost-p1', 'prod-prit-1', 1200.00, 1500.00, 150.00, 100.00, 2950.00),
('cost-p2', 'prod-prit-2', 150.00, 300.00, 80.00, 40.00, 570.00);

-- Seed Pricing Analysis
INSERT INTO pricing_analysis (id, product_id, market_min, market_max, recommended_price, confidence, reasoning, data_source) VALUES
('pa-p1', 'prod-prit-1', 3800.00, 5200.00, 4499.00, 88, 'Calculated based on double ikkat weaving technique and regional market benchmarks.', 'CraftConnect AI Market Estimator');

-- Seed Bulk Inquiries
INSERT INTO inquiries (id, buyer_id, artisan_id, product_id, quantity, target_price, message, delivery_location, status, counter_price) VALUES
('inq-p1', 'buy-patel', 'art-prit', 'prod-prit-1', 25, 4200.00, 'We would like to place a bulk order for 25 Patola sarees for our store collection.', 'Ahmedabad, Gujarat', 'NEW', NULL);
