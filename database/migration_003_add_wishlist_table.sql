-- Migration: Add Wishlist Table
-- Created: April 1, 2026
-- Purpose: Store user's favorite products for wishlist/save functionality

CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Add comment for documentation
COMMENT ON TABLE wishlists IS 'Stores products saved/favorited by users for wishlist functionality';
COMMENT ON COLUMN wishlists.user_id IS 'Reference to user who added the product';
COMMENT ON COLUMN wishlists.product_id IS 'Reference to product in wishlist';
COMMENT ON COLUMN wishlists.added_at IS 'Timestamp when product was added to wishlist';
