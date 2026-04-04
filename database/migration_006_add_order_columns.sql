-- Migration 006: Add missing columns to orders table
-- Adds order_code, delivery_address_id, and delivery_method_id

BEGIN;

-- Add order_code column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_code VARCHAR(50) UNIQUE;

-- Add delivery_address_id column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address_id INT REFERENCES delivery_addresses(id);

-- Add delivery_method_id column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_method_id INT REFERENCES delivery_methods(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

COMMIT;
