-- Drop old category column if it exists (from old schema.sql)
ALTER TABLE products DROP COLUMN IF EXISTS category;

-- Tạo bảng categories nếu chưa tồn tại
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

-- Tạo bảng product_categories (nhiều-nhiều quan hệ) nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, category_id)
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Thêm một số category mặc định nếu chưa có
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
