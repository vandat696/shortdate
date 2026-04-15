-- Migration: Add Pricing Packages (Bundles) & Pricing Tiers
-- Purpose: Support bundled offers (multiple products at fixed price) and tiered pricing (quantity-based discounts)
-- Created: 2026-04-14

-- ============================================================
-- 1. PRICING PACKAGES TABLE (Bundled Offers)
-- ============================================================
-- Represents pre-defined packages like "Túi Mini", "Túi Tiêu chuẩn", etc.
-- Each package has a fixed price regardless of individual item prices

CREATE TABLE IF NOT EXISTS pricing_packages (
  id SERIAL PRIMARY KEY,
  supplier_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  description TEXT,
  package_price DECIMAL(10, 2) NOT NULL,
  display_image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(supplier_id, package_name)
);

-- ============================================================
-- 2. PACKAGE ITEMS TABLE (products inside a package)
-- ============================================================
-- Junction table: tracks which products are in which package and quantity

CREATE TABLE IF NOT EXISTS package_items (
  id SERIAL PRIMARY KEY,
  package_id INT NOT NULL REFERENCES pricing_packages(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(package_id, product_id)
);

-- ============================================================
-- 3. PRICING TIERS TABLE (Quantity-based pricing)
-- ============================================================
-- For a single product: different prices based on purchase quantity
-- Example: 1kg = 50k, 3kg = 120k (not 150k = 50k*3)

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_quantity INT NOT NULL CHECK (min_quantity > 0),
  max_quantity INT CHECK (max_quantity IS NULL OR max_quantity > 0),
  tier_price DECIMAL(10, 2) NOT NULL,
  discount_percentage INT DEFAULT 0,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
  UNIQUE(product_id, min_quantity)
);

-- ============================================================
-- INDEXES (For Performance)
-- ============================================================

-- Pricing Packages indexes
CREATE INDEX IF NOT EXISTS idx_pricing_packages_supplier_id ON pricing_packages(supplier_id);
CREATE INDEX IF NOT EXISTS idx_pricing_packages_is_active ON pricing_packages(is_active);

-- Package Items indexes
CREATE INDEX IF NOT EXISTS idx_package_items_package_id ON package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_package_items_product_id ON package_items(product_id);

-- Pricing Tiers indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_product_id ON pricing_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_is_active ON pricing_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_min_quantity ON pricing_tiers(min_quantity);

-- ============================================================
-- COMMENTS (Documentation)
-- ============================================================

COMMENT ON TABLE pricing_packages IS 'Bundled offers: combinations of products at fixed price (Túi Mini, Túi Tiêu chuẩn, etc.)';
COMMENT ON TABLE package_items IS 'Products and quantities inside each pricing package';
COMMENT ON TABLE pricing_tiers IS 'Quantity-based tiered pricing for individual products (buy more = lower cost per unit)';

COMMENT ON COLUMN pricing_packages.package_price IS 'Total price for entire package regardless of individual item prices';
COMMENT ON COLUMN pricing_tiers.min_quantity IS 'Minimum quantity to qualify for this tier';
COMMENT ON COLUMN pricing_tiers.max_quantity IS 'Maximum quantity for this tier (NULL means unlimited/highest)';
COMMENT ON COLUMN pricing_tiers.tier_price IS 'Price per unit (or total price if buying exactly min_quantity)';
