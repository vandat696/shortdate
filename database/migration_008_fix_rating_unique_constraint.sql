-- Allow multiple ratings per user
-- Remove unique constraint to allow users to rate multiple times

-- Drop existing unique constraint if it exists
ALTER TABLE product_ratings DROP CONSTRAINT IF EXISTS product_ratings_product_id_buyer_id_key;
ALTER TABLE product_ratings DROP CONSTRAINT IF EXISTS uq_product_ratings_per_user;

-- Add index for performance (without unique constraint)
CREATE INDEX IF NOT EXISTS idx_product_ratings_user_product ON product_ratings(product_id, buyer_id);
