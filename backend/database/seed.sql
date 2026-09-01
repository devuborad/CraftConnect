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

-- Seed Users (Passwords hashed using bcrypt for "password123": $2a$10$7R44Yt.mK3o/eY5bZg4.2.Qz1m3Lh0X2r/gG5u4mK3o/eY5bZg4.2)
INSERT INTO users (id, name, email, phone, password_hash, role, language, status) VALUES
('usr-admin', 'CraftConnect Admin', 'admin@craftconnect.ai', '+919876543210', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'admin', 'en', 'active'),
('usr-artisan-1', 'Meena Ben Weaver', 'meena@craftconnect.ai', '+919876500001', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'artisan', 'gu', 'active'),
('usr-artisan-2', 'Ramesh Prajapati', 'ramesh@craftconnect.ai', '+919876500002', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'artisan', 'hi', 'active'),
('usr-artisan-3', 'Devji Bhai Suthar', 'devji@craftconnect.ai', '+919876500003', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'artisan', 'gu', 'active'),
('usr-artisan-4', 'Sita Devi Art', 'sitadevi@craftconnect.ai', '+919876500004', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'artisan', 'hi', 'active'),
('usr-buyer-1', 'Rajesh Patel (ABC Boutique)', 'rajesh@boutique.in', '+919876599991', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'buyer', 'en', 'active'),
('usr-buyer-2', 'Aarav Sharma', 'aarav@gmail.com', '+919876599992', '$2a$10$R7j0D54/s8p8rR9pXyqJ1u7QvX8Kj.3R1n6f5g4h3j2k1l0m9n8o7', 'buyer', 'en', 'active');

-- Seed Artisans Profiles
INSERT INTO artisans (id, user_id, business_name, location, state, craft_type, experience_years, bio, profile_image, is_verified) VALUES
('art-1', 'usr-artisan-1', 'Patan Patola Handloom', 'Patan', 'Gujarat', 'Handwoven Textiles & Patola', 18, 'Master weaver specializing in authentic double ikkat Patola sarees and organic cotton drapes from Patan, Gujarat.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', TRUE),
('art-2', 'usr-artisan-2', 'Clay & Earth Pottery', 'Kutch', 'Gujarat', 'Terracotta & Clay Craft', 14, 'Preserving 3 generations of Kutch pottery traditions, creating natural cooling water vessels and clay cookware.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', TRUE),
('art-3', 'usr-artisan-3', 'Suthar Wood Carvings', 'Jodhpur', 'Rajasthan', 'Rosewood & Teak Woodcraft', 22, 'Crafting intricate wooden figures, royal elephants, and traditional block print stamps from Rajasthan.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', TRUE),
('art-4', 'usr-artisan-4', 'Mithila Kala Studio', 'Madhubani', 'Bihar', 'Madhubani Painting', 12, 'Traditional Madhubani artist creating natural pigment paintings depicting Indian mythology and rural life.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300', TRUE);

-- Seed Buyers Profiles
INSERT INTO buyers (id, user_id, company_name, location, buyer_type) VALUES
('buy-1', 'usr-buyer-1', 'Heritage Crafts Boutique Pvt Ltd', 'Mumbai', 'business'),
('buy-2', 'usr-buyer-2', 'Aarav Personal Collection', 'Bengaluru', 'individual');

-- Seed Products
INSERT INTO products (id, artisan_id, category_id, name, name_gujarati, name_hindi, description_en, description_hi, description_gu, material, craft_type, origin, original_image_url, enhanced_image_url, price, stock_quantity, status, views_count) VALUES
('prod-1', 'art-1', 'cat-1', 'Authentic Handwoven Patola Cotton Saree', 'હાથથી વણેલી પટોળા કોટન સાડી', 'हाथ से बुनी पटोला कॉटन साड़ी', 'Exquisite handwoven Patola saree featuring traditional geometric motifs woven with natural dyes by master weavers in Patan.', 'पाटन के कारीगरों द्वारा प्राकृतिक रंगों से बनी प्रामाणिक हाथ से बुनी पटोला साड़ी।', 'પાટણના ક કારીગરો દ્વારા કુદરતી રંગોથી બનાવેલી હાથથી વણેલી ઓરિજિનલ પટોળા સાડી.', 'Pure Organic Cotton', 'Handloom Double Ikkat', 'Patan, Gujarat', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 4499.00, 8, 'published', 245),
('prod-2', 'art-2', 'cat-2', 'Handcrafted Terracotta Clay Water Jug (Matka)', 'હાથથી બનાવેલો માટીનો કૂજો', 'हाथ से बना मिट्टी का मटका', 'Eco-friendly natural red clay water vessel with hand-carved ethnic motifs. Keeps water naturally cool and fresh.', 'प्राकृतिक रूप से पानी को ठंडा रखने वाला पर्यावरण के अनुकूल मिट्टी का घड़ा।', 'પાણીને કુદરતી રીતે ઠંડુ રાખવા માટે ઓર્ગેનિક લાલ માટીમાંથી બનાવેલો સુરાહી કૂજો.', 'Red Clay Terracotta', 'Wheel Throwing & Carving', 'Kutch, Gujarat', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800', 899.00, 25, 'published', 180),
('prod-3', 'art-3', 'cat-3', 'Hand-Carved Wooden Royal Elephant Figurine', 'હાથથી કોતરેલી લાકડાની હાથીની મૂર્તિ', 'हाथ से तराशी गई लकड़ी की हाथी की मूर्ति', 'Hand-carved solid teak wood elephant figurine decorated with traditional Jodhpur brass inlay and vibrant lacquer paint.', 'जोधपुर पीतल इनले और पारंपरिक रंगों से सजाया गया हाथ से तराशा ठोस शीशम लकड़ी का हाथी।', 'જોધપુર બ્રાસ ઇનલે કામ અને પરંપરાગત લાકડા કોતરણી સાથે હાથથી બનેલો શાહી હાથી.', 'Teak Wood & Brass', 'Wood Carving & Brass Inlay', 'Jodhpur, Rajasthan', 'https://images.unsplash.com/photo-1605885064319-15e5b3c507c8?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1605885064319-15e5b3c507c8?auto=format&fit=crop&q=80&w=800', 1799.00, 12, 'published', 320),
('prod-4', 'art-4', 'cat-6', 'Handmade Madhubani Folk Art Canvas Painting', 'મધુબની લોકકળા કેનવાસ પેઇન્ટિંગ', 'हस्तनिर्मित मधुबनी लोक कला पेंटिंग', 'Authentic handmade Madhubani folk painting created using bamboo brushes and organic plant pigments on handmade paper.', 'प्राकृतिक रंगों और बांस के ब्रश से हाथ से बनाई गई मूल मधुबनी लोक चित्रकारी।', 'કુદરતી રંગો વડે વાંસની પીંછીથી બનાવેલું મધુબની ચિત્ર.', 'Handmade Paper & Eco Dyes', 'Madhubani Painting', 'Madhubani, Bihar', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800', 2499.00, 5, 'published', 150);

-- Seed Product Costs
INSERT INTO product_costs (id, product_id, raw_material_cost, labour_cost, packaging_cost, other_cost, total_cost) VALUES
('cost-1', 'prod-1', 1200.00, 1500.00, 150.00, 100.00, 2950.00),
('cost-2', 'prod-2', 150.00, 300.00, 80.00, 40.00, 570.00),
('cost-3', 'prod-3', 450.00, 600.00, 100.00, 50.00, 1200.00),
('cost-4', 'prod-4', 300.00, 1000.00, 120.00, 80.00, 1500.00);

-- Seed Pricing Analysis
INSERT INTO pricing_analysis (id, product_id, market_min, market_max, recommended_price, confidence, reasoning, data_source) VALUES
('pa-1', 'prod-1', 3800.00, 5200.00, 4499.00, 88, 'Calculated based on double ikkat weaving technique, 18 years artisan experience, and regional Patola market benchmarks.', 'CraftConnect AI Market Estimator'),
('pa-2', 'prod-2', 750.00, 1100.00, 899.00, 82, 'Calculated based on natural clay material costs, hand-carved detail, and eco-friendly cookware demand.', 'CraftConnect AI Market Estimator');

-- Seed Bulk Inquiries
INSERT INTO inquiries (id, buyer_id, artisan_id, product_id, quantity, target_price, message, delivery_location, status, counter_price) VALUES
('inq-1', 'buy-1', 'art-1', 'prod-1', 50, 3900.00, 'We would like to order 50 units for our festival collection in Mumbai. Please confirm delivery timeline.', 'Mumbai, Maharashtra', 'NEW', NULL),
('inq-2', 'buy-1', 'art-2', 'prod-2', 100, 750.00, 'Need 100 units of terracotta jugs for corporate eco-gifts.', 'Ahmedabad, Gujarat', 'ACCEPTED', NULL);

-- Seed Carts & Cart Items
INSERT INTO carts (id, buyer_id) VALUES
('cart-1', 'buy-2');

INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price) VALUES
('ci-1', 'cart-1', 'prod-2', 2, 899.00),
('ci-2', 'cart-1', 'prod-3', 1, 1799.00);

-- Seed Orders & Order Items
INSERT INTO orders (id, buyer_id, total_amount, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode) VALUES
('ord-1', 'buy-2', 3597.00, 'confirmed', 'Aarav Sharma', '+919876599992', 'Flat 402, Green Glen Layout, Bellandur', 'Bengaluru', 'Karnataka', '560103');

INSERT INTO order_items (id, order_id, product_id, artisan_id, quantity, unit_price, subtotal) VALUES
('oi-1', 'ord-1', 'prod-2', 'art-2', 2, 899.00, 1798.00),
('oi-2', 'ord-1', 'prod-3', 'art-3', 1, 1799.00, 1799.00);

-- Seed AI Activity
INSERT INTO ai_activity (id, user_id, feature, status, processing_time_ms, created_at) VALUES
('aia-1', 'usr-artisan-1', 'image_enhancement', 'success', 1450, NOW()),
('aia-2', 'usr-artisan-1', 'speech', 'success', 980, NOW()),
('aia-3', 'usr-artisan-1', 'catalogue', 'success', 1800, NOW()),
('aia-4', 'usr-artisan-1', 'pricing', 'success', 1100, NOW()),
('aia-5', 'usr-artisan-2', 'chat', 'success', 650, NOW());

-- Seed Settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('platform_name', 'CraftConnect AI', 'Name of the application'),
('commission_rate', '0.05', 'Platform service fee (5%)'),
('ai_enabled', 'true', 'Enable AI studio and cataloguing services');
