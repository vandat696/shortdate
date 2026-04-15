-- Migration: Add Pricing Package Support to Cart
-- Purpose: Allow carts to store both products and pricing packages
-- Created: 2026-04-15

-- ============================================================
-- ADD COLUMNS TO CARTS TABLE
-- ============================================================

ALTER TABLE carts
ADD COLUMN IF NOT EXISTS package_id INT REFERENCES pricing_packages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) DEFAULT 'product' CHECK (item_type IN ('product', 'package'));

-- ============================================================
-- UPDATE EXISTING CONSTRAINTS
-- ============================================================

-- Make product_id nullable since package items won't have it
ALTER TABLE carts
ALTER COLUMN product_id DROP NOT NULL;

-- ============================================================
-- UPDATE UNIQUE CONSTRAINT - Drop old and create new ones
-- ============================================================

-- Drop old unique constraint if exists
ALTER TABLE carts
DROP CONSTRAINT IF EXISTS carts_user_id_product_id_key;

-- Create separate unique constraints for products and packages
-- For products: user_id + product_id must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_product 
ON carts(user_id, product_id) WHERE item_type = 'product' AND product_id IS NOT NULL;

-- For packages: user_id + package_id must be unique  
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_package 
ON carts(user_id, package_id) WHERE item_type = 'package' AND package_id IS NOT NULL;

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_carts_package_id ON carts(package_id);
CREATE INDEX IF NOT EXISTS idx_carts_item_type ON carts(item_type);

-- ============================================================
-- ADD COMMENTS
-- ============================================================

COMMENT ON COLUMN carts.package_id IS 'ID of pricing package (null if this is a product item)';
COMMENT ON COLUMN carts.item_type IS 'Type of cart item: product or package';
