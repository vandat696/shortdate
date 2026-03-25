-- Add missing columns to supplier_details
ALTER TABLE supplier_details ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE supplier_details ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE supplier_details ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500);

-- Add avatar_url to users (nếu chưa có)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
