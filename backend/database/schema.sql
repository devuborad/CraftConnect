-- CraftConnect AI Database Schema for MySQL
CREATE DATABASE IF NOT EXISTS craftconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE craftconnect;

-- Disable Foreign Key Checks during setup
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS ai_activity;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS pricing_analysis;
DROP TABLE IF EXISTS product_costs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS buyers;
DROP TABLE IF EXISTS artisans;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('artisan', 'buyer', 'admin') NOT NULL DEFAULT 'artisan',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artisans Profile Table
CREATE TABLE artisans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Gujarat',
  craft_type VARCHAR(100) NOT NULL,
  experience_years INT NOT NULL DEFAULT 1,
  bio TEXT,
  profile_image LONGTEXT,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Buyers Profile Table
CREATE TABLE buyers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  location VARCHAR(255),
  buyer_type ENUM('individual', 'business') NOT NULL DEFAULT 'individual',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(500),
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  artisan_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_gujarati VARCHAR(255),
  name_hindi VARCHAR(255),
  description_en TEXT NOT NULL,
  description_hi TEXT,
  description_gu TEXT,
  material VARCHAR(100) NOT NULL,
  craft_type VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  original_image_url VARCHAR(500) NOT NULL,
  enhanced_image_url VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 1,
  status ENUM('draft', 'pending', 'approved', 'rejected', 'published', 'archived') NOT NULL DEFAULT 'published',
  views_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Product Costs Table (Add Product Wizard)
CREATE TABLE product_costs (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL UNIQUE,
  raw_material_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  labour_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  packaging_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  other_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Pricing Analysis Table (AI Pricing Assistant)
CREATE TABLE pricing_analysis (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  market_min DECIMAL(10, 2) NOT NULL,
  market_max DECIMAL(10, 2) NOT NULL,
  recommended_price DECIMAL(10, 2) NOT NULL,
  confidence INT NOT NULL DEFAULT 85,
  reasoning TEXT,
  data_source VARCHAR(255) DEFAULT 'CraftConnect AI Market Estimator',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Inquiries & Orders Table (B2B Bulk Wholesale & B2C Direct Purchases)
CREATE TABLE inquiries (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('BULK_INQUIRY', 'DIRECT_ORDER') NOT NULL DEFAULT 'BULK_INQUIRY',
  buyer_id VARCHAR(36) NULL,
  artisan_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NULL,
  payment_method VARCHAR(100) DEFAULT 'Direct Invoice',
  buyer_name VARCHAR(255) NULL,
  buyer_company VARCHAR(255) NULL,
  buyer_phone VARCHAR(50) NULL,
  buyer_email VARCHAR(255) NULL,
  message TEXT,
  delivery_location VARCHAR(255) NOT NULL,
  status ENUM('NEW', 'ACCEPTED', 'COUNTERED', 'DECLINED', 'DISPATCHED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
  counter_price DECIMAL(10, 2),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE SET NULL,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Carts Table (B2C Flow)
CREATE TABLE carts (
  id VARCHAR(36) PRIMARY KEY,
  buyer_id VARCHAR(36) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
);

-- Cart Items Table
CREATE TABLE cart_items (
  id VARCHAR(36) PRIMARY KEY,
  cart_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table (B2C Buy Now Flow)
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  buyer_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'confirmed',
  shipping_name VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(50) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_pincode VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  artisan_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE
);

-- AI Activity Table (Admin Analytics)
CREATE TABLE ai_activity (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  feature ENUM('image_enhancement', 'catalogue', 'pricing', 'chat', 'speech') NOT NULL,
  status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  processing_time_ms INT NOT NULL DEFAULT 1200,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Platform Content Table
CREATE TABLE content (
  id VARCHAR(36) PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content_json JSON,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Platform Settings Table
CREATE TABLE settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
