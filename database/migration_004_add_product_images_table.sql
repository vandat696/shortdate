-- Migration: Add Product Images Table
-- Created: April 1, 2026
-- Purpose: Store multiple images per product (max 4)

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  position INT CHECK (position >= 1 AND position <= 4),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, position)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(product_id, position);

-- Add comment for documentation
COMMENT ON TABLE product_images IS 'Stores up to 4 images per product';
COMMENT ON COLUMN product_images.position IS 'Image position: 1-4 (1 is main image)';
