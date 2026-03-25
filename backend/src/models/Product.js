import pool from '../config/database.js';

export default class Product {
  // Tạo sản phẩm mới
  static async create(productData) {
    const {
      supplier_id,
      name,
      description,
      category,
      product_type, // 'dry_product' hoặc 'fresh_product'
      original_price,
      current_price,
      min_floor_price,
      stock_quantity,
      min_stock_threshold,
      expiry_date,
      image_url,
      auto_pricing_enabled = true
    } = productData;

    const query = `
      INSERT INTO products (
        supplier_id, name, description, category, product_type,
        original_price, current_price, min_floor_price,
        stock_quantity, min_stock_threshold, expiry_date,
        image_url, auto_pricing_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      supplier_id,
      name,
      description,
      category,
      product_type,
      original_price,
      current_price,
      min_floor_price,
      stock_quantity,
      min_stock_threshold,
      expiry_date,
      image_url,
      auto_pricing_enabled
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Lấy sản phẩm theo ID
  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Lấy tất cả sản phẩm của một Supplier
  static async findBySupplier(supplier_id, filters = {}) {
    let query = 'SELECT * FROM products WHERE supplier_id = $1 AND is_active = true';
    const params = [supplier_id];

    // Filter theo trạng thái (sắp hết hạn, tồn kho thấp, v.v.)
    if (filters.expiring_soon) {
      query += ` AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'`;
    }

    if (filters.low_stock) {
      query += ` AND stock_quantity <= min_stock_threshold`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Lấy tất cả sản phẩm (cho Buyer)
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];

    // Filter theo loại sản phẩm
    if (filters.product_type) {
      params.push(filters.product_type);
      query += ` AND product_type = $${params.length}`;
    }

    // Filter theo danh mục
    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    // Filter theo khoảng giá
    if (filters.min_price) {
      params.push(filters.min_price);
      query += ` AND current_price >= $${params.length}`;
    }

    if (filters.max_price) {
      params.push(filters.max_price);
      query += ` AND current_price <= $${params.length}`;
    }

    // Filter theo ngày hết hạn
    if (filters.min_days_left) {
      params.push(filters.min_days_left);
      query += ` AND (expiry_date - CURRENT_DATE) >= $${params.length}`;
    }

    if (filters.max_days_left) {
      params.push(filters.max_days_left);
      query += ` AND (expiry_date - CURRENT_DATE) <= $${params.length}`;
    }

    // Filter theo discount
    if (filters.min_discount) {
      params.push(filters.min_discount);
      query += ` AND discount_percentage >= $${params.length}`;
    }

    // Sắp xếp
    const sort = filters.sort || 'created_at';
    const order = filters.order || 'DESC';
    query += ` ORDER BY ${sort} ${order}`;

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Cập nhật sản phẩm
  static async update(id, updateData) {
    const allowedFields = [
      'name', 'description', 'category', 'product_type',
      'original_price', 'current_price', 'min_floor_price',
      'discount_percentage', 'stock_quantity', 'min_stock_threshold',
      'expiry_date', 'image_url', 'auto_pricing_enabled'
    ];

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE products
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Cập nhật tồn kho
  static async updateInventory(id, quantity_change) {
    const query = `
      UPDATE products
      SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [quantity_change, id]);
    return result.rows[0] || null;
  }

  // Xóa sản phẩm (soft delete)
  static async delete(id) {
    const query = `
      UPDATE products
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Lấy danh mục sản phẩm
  static async getCategories() {
    const query = 'SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category';
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  // Lấy các sản phẩm sắp hết hạn (cho cảnh báo)
  static async getExpiringProducts(supplier_id, days = 7) {
    const query = `
      SELECT * FROM products
      WHERE supplier_id = $1
        AND is_active = true
        AND expiry_date <= CURRENT_DATE + INTERVAL '1 day' * $2
        AND expiry_date > CURRENT_DATE
      ORDER BY expiry_date ASC;
    `;

    const result = await pool.query(query, [supplier_id, days]);
    return result.rows;
  }

  // Lấy sản phẩm tồn kho thấp hơn ngưỡng
  static async getLowStockProducts(supplier_id) {
    const query = `
      SELECT * FROM products
      WHERE supplier_id = $1
        AND is_active = true
        AND min_stock_threshold IS NOT NULL
        AND stock_quantity <= min_stock_threshold
      ORDER BY stock_quantity ASC;
    `;

    const result = await pool.query(query, [supplier_id]);
    return result.rows;
  }
}
