import pool from '../config/database.js';

export default class Product {
  // Tạo sản phẩm mới
  static async create(productData) {
    const {
      supplier_id,
      name,
      description,
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
        supplier_id, name, description, product_type,
        original_price, current_price, min_floor_price,
        stock_quantity, min_stock_threshold, expiry_date,
        image_url, auto_pricing_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      supplier_id,
      name,
      description,
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

  // Lấy sản phẩm theo ID (với categories)
  static async findById(id) {
    const query = `
      SELECT 
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as thumbnail_url,
        sd.company_name as supplier_name,
        sd.latitude as supplier_latitude,
        sd.longitude as supplier_longitude,
        COALESCE(json_agg(
          json_build_object('id', c.id, 'name', c.name, 'icon', c.icon, 'description', c.description)
        ) FILTER (WHERE c.id IS NOT NULL), '[]'::json) as categories
      FROM products p
      LEFT JOIN supplier_details sd ON p.supplier_id = sd.user_id
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id AND c.is_active = true
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, sd.id
    `;
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
    let query = `
      SELECT 
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as thumbnail_url,
        sd.company_name as supplier_name,
        sd.latitude as supplier_latitude,
        sd.longitude as supplier_longitude,
        COALESCE(json_agg(
          json_build_object('id', c.id, 'name', c.name, 'icon', c.icon, 'display_order', c.display_order)
        ) FILTER (WHERE c.id IS NOT NULL), '[]'::json) as categories
      FROM products p
      LEFT JOIN supplier_details sd ON p.supplier_id = sd.user_id
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id AND c.is_active = true
      WHERE p.is_active = true
    `;
    const params = [];

    // Filter theo loại sản phẩm
    if (filters.product_type) {
      params.push(filters.product_type);
      query += ` AND p.product_type = $${params.length}`;
    }

    // Filter theo danh mục (category name)
    if (filters.category) {
      params.push(filters.category);
      query += ` AND c.name = $${params.length}`;
    }

    // Filter theo khoảng giá
    if (filters.min_price) {
      params.push(filters.min_price);
      query += ` AND p.current_price >= $${params.length}`;
    }

    if (filters.max_price) {
      params.push(filters.max_price);
      query += ` AND p.current_price <= $${params.length}`;
    }

    // Filter theo ngày hết hạn
    if (filters.min_days_left) {
      params.push(filters.min_days_left);
      query += ` AND (p.expiry_date - CURRENT_DATE) >= $${params.length}`;
    }

    if (filters.max_days_left) {
      params.push(filters.max_days_left);
      query += ` AND (p.expiry_date - CURRENT_DATE) <= $${params.length}`;
    }

    // Filter theo discount
    if (filters.min_discount) {
      params.push(filters.min_discount);
      query += ` AND p.discount_percentage >= $${params.length}`;
    }

    // GROUP BY để tránh duplicate khi join với categories
    query += ` GROUP BY p.id, sd.id`;

    // Sắp xếp
    const sort = filters.sort || 'p.created_at';
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
      'name', 'description', 'product_type',
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

  // Lấy tất cả categories (từ bảng categories)
  static async getCategories() {
    const query = `
      SELECT id, name, description, icon, display_order 
      FROM categories 
      WHERE is_active = true 
      ORDER BY display_order ASC, name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Lấy categories của một product
  static async getProductCategories(product_id) {
    const query = `
      SELECT c.id, c.name, c.description, c.icon
      FROM categories c
      JOIN product_categories pc ON c.id = pc.category_id
      WHERE pc.product_id = $1 AND c.is_active = true
      ORDER BY c.name ASC
    `;
    const result = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Thêm category cho product
  static async addProductCategory(product_id, category_id) {
    const query = `
      INSERT INTO product_categories (product_id, category_id)
      VALUES ($1, $2)
      ON CONFLICT (product_id, category_id) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [product_id, category_id]);
    return result.rows[0] || null;
  }

  // Xóa category từ product
  static async removeProductCategory(product_id, category_id) {
    const query = `
      DELETE FROM product_categories
      WHERE product_id = $1 AND category_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [product_id, category_id]);
    return result.rows[0] || null;
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
