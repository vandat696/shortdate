-- Migration: Update Pricing Packages with expiry_date and stock_quantity
-- Purpose: Track package expiry and available stock
-- Created: 2026-04-14

-- ============================================================
-- ADD NEW COLUMNS TO PRICING PACKAGES TABLE
-- ============================================================

ALTER TABLE pricing_packages
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0;

-- ============================================================
-- ADD COMMENT FOR NEW COLUMNS
-- ============================================================

COMMENT ON COLUMN pricing_packages.expiry_date IS 'Expiration date of the entire package offer';
COMMENT ON COLUMN pricing_packages.stock_quantity IS 'Available stock for this package';

-- ============================================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pricing_packages_expiry_date ON pricing_packages(expiry_date);
CREATE INDEX IF NOT EXISTS idx_pricing_packages_stock_quantity ON pricing_packages(stock_quantity);
