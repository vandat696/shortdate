-- Check if categories table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'categories';

-- Drop old category column from products if exists
ALTER TABLE products DROP COLUMN IF EXISTS category;

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_categories junction table if not exists
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Clear old categories if any
DELETE FROM categories WHERE is_active = TRUE;

-- Insert default categories
INSERT INTO categories (name, description, icon, display_order, is_active) VALUES
('Thực phẩm khô', 'Bánh, mỳ, gia vị, ngũ cốc', '🌾', 1, TRUE),
('Đồ uống', 'Nước, trà, cà phê', '🥤', 2, TRUE),
('Rau quả tươi', 'Rau, quả tươi', '🥬', 3, TRUE),
('Thịt và cá', 'Thịt, cá, hải sản', '🥩', 4, TRUE),
('Sữa và sản phẩm từ sữa', 'Sữa, pho mát, sữa chua', '🧀', 5, TRUE),
('Trứng', 'Trứng gà, vịt', '🥚', 6, TRUE),
('Đông lạnh', 'Sản phẩm đông lạnh', '🍜', 7, TRUE),
('Gia vị và nước sốt', 'Gia vị, nước chấm, sốt', '🧂', 8, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Link existing products with categories (optional - nếu có products)
-- Mỗi product cũ sẽ được link vào category "Rau quả tươi" (id=3) làm mặc định
DELETE FROM product_categories;
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE c.name = 'Rau quả tươi' AND p.is_active = TRUE
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Verify categories were inserted
SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order;

-- Verify product_categories linking
SELECT COUNT(*) as linked_count FROM product_categories;
