-- Migration: Add location columns to users and supplier_details tables
-- This migration adds latitude, longitude, and address columns to store user location data

-- Add location columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Add location columns to supplier_details table
ALTER TABLE supplier_details ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE supplier_details ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE supplier_details ADD COLUMN IF NOT EXISTS supplier_address TEXT;

-- Add indexes for location queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_supplier_details_location ON supplier_details(latitude, longitude);

-- Add comment
COMMENT ON COLUMN users.latitude IS 'Latitude of user delivery location (in decimal degrees, -90 to 90)';
COMMENT ON COLUMN users.longitude IS 'Longitude of user delivery location (in decimal degrees, -180 to 180)';
COMMENT ON COLUMN users.address IS 'Full address text corresponding to latitude and longitude';
COMMENT ON COLUMN supplier_details.latitude IS 'Latitude of supplier warehouse location';
COMMENT ON COLUMN supplier_details.longitude IS 'Longitude of supplier warehouse location';
COMMENT ON COLUMN supplier_details.supplier_address IS 'Full address text of supplier location';
