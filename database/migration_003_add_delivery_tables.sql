-- Migration: Add Delivery Addresses and Delivery Methods Tables
-- Created: 2026-04-01

-- Delivery Methods Table
CREATE TABLE IF NOT EXISTS delivery_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  estimated_hours INT,
  base_price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Addresses Table
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  street_address TEXT NOT NULL,
  ward VARCHAR(100),
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, label)
);

-- Add delivery_address_id and delivery_method_id columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_address_id INT REFERENCES delivery_addresses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS delivery_method_id INT REFERENCES delivery_methods(id) ON DELETE SET NULL;

-- Insert default delivery methods
INSERT INTO delivery_methods (name, description, estimated_hours, base_price) VALUES
  ('Giao hàng cùng ngày', 'Giao hàng trong 2-4 giờ', 3, 15000),
  ('Giao hàng tiêu chuẩn', 'Giao hàng trong 1-2 ngày', 24, 0)
ON CONFLICT (name) DO NOTHING;
