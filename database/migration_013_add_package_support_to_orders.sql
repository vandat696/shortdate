-- Migration: Add Pricing Package Support to Orders
-- Purpose: Allow orders to contain both products and pricing packages
-- Created: 2026-04-15

-- ============================================================
-- ADD COLUMNS TO ORDER_ITEMS TABLE
-- ============================================================

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS package_id INT REFERENCES pricing_packages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) DEFAULT 'product' CHECK (item_type IN ('product', 'package'));

-- Make product_id nullable since package items won't have it
ALTER TABLE order_items
ALTER COLUMN product_id DROP NOT NULL;

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_order_items_package_id ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ============================================================
-- ADD COMMENTS
-- ============================================================

COMMENT ON COLUMN order_items.package_id IS 'ID of pricing package (null if this is a product item)';
COMMENT ON COLUMN order_items.item_type IS 'Type of order item: product or package';
