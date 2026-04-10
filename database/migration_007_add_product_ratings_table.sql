-- Active: 1774807879403@@127.0.0.1@5432@shortdate
-- Product Ratings Table
CREATE TABLE IF NOT EXISTS product_ratings (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, buyer_id)
);

-- Index để tối ưu hiệu suất
CREATE INDEX idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX idx_product_ratings_buyer_id ON product_ratings(buyer_id);
CREATE INDEX idx_product_ratings_created_at ON product_ratings(created_at);

-- Cập nhật Products table để lưu average rating và rating count
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;
