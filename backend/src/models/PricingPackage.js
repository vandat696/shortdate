import db from '../config/database.js';

export default class PricingPackage {
  /**
   * Tạo gói giá mới (Bundle)
   * @param {Object} packageData
   * @returns {Promise<Object>} Package vừa tạo
   */
  static async create(packageData) {
    const {
      supplier_id,
      package_name,
      description,
      package_price,
      expiry_date = null,
      stock_quantity = 0
    } = packageData;

    const query = `
      INSERT INTO pricing_packages (
        supplier_id, package_name, description, package_price,
        display_image, display_order, expiry_date, stock_quantity, is_active
      ) VALUES ($1, $2, $3, $4, NULL, 0, $5, $6, true)
      RETURNING *;
    `;

    const result = await db.query(query, [
      supplier_id,
      package_name,
      description,
      package_price,
      expiry_date,
      stock_quantity
    ]);

    return result.rows[0];
  }

  /**
   * Lấy gói giá theo ID (với chi tiết sản phẩm bên trong)
   * @param {number} id - Package ID
   * @returns {Promise<Object>} Package details with items
   */
  static async findById(id) {
    const query = `
      SELECT 
        pp.*,
        COALESCE(json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'quantity', pi.quantity,
            'current_price', p.current_price,
            'original_price', p.original_price,
            'image_url', p.image_url,
            'stock_quantity', p.stock_quantity,
            'expiry_date', p.expiry_date
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as items
      FROM pricing_packages pp
      LEFT JOIN package_items pi ON pp.id = pi.package_id
      LEFT JOIN products p ON pi.product_id = p.id
      WHERE pp.id = $1 AND pp.is_active = true
      GROUP BY pp.id;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Lấy tất cả gói giá của một Supplier
   * @param {number} supplier_id
   * @param {Object} options - { includeInactive: bool }
   * @returns {Promise<Array>} List of packages
   */
  static async findBySupplier(supplier_id, options = {}) {
    const { includeInactive = false } = options;

    let query = `
      SELECT 
        pp.*,
        COUNT(DISTINCT pi.product_id) as item_count,
        COALESCE(json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'quantity', pi.quantity,
            'current_price', p.current_price
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as items
      FROM pricing_packages pp
      LEFT JOIN package_items pi ON pp.id = pi.package_id
      LEFT JOIN products p ON pi.product_id = p.id
      WHERE pp.supplier_id = $1
    `;

    if (!includeInactive) {
      query += ` AND pp.is_active = true`;
    }

    query += `
      GROUP BY pp.id
      ORDER BY pp.display_order ASC, pp.created_at DESC;
    `;

    const result = await db.query(query, [supplier_id]);
    return result.rows;
  }

  /**
   * Lấy tất cả gói giá active (cho buyer xem)
   * @param {Object} filters - { supplier_id, search }
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const { supplier_id, search } = filters;

    let query = `
      SELECT 
        pp.*,
        sd.company_name as supplier_name,
        COUNT(DISTINCT pi.product_id) as item_count,
        COALESCE(json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'quantity', pi.quantity
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as items
      FROM pricing_packages pp
      LEFT JOIN package_items pi ON pp.id = pi.package_id
      LEFT JOIN products p ON pi.product_id = p.id
      LEFT JOIN supplier_details sd ON pp.supplier_id = sd.user_id
      WHERE pp.is_active = true
    `;

    const params = [];

    if (supplier_id) {
      query += ` AND pp.supplier_id = $${params.length + 1}`;
      params.push(supplier_id);
    }

    if (search) {
      query += ` AND pp.package_name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    query += `
      GROUP BY pp.id, sd.id
      ORDER BY pp.display_order ASC, pp.created_at DESC;
    `;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Cập nhật gói giá
   * @param {number} id - Package ID
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async update(id, updates) {
    const {
      package_name,
      description,
      package_price,
      display_image,
      display_order,
      expiry_date,
      stock_quantity,
      is_active
    } = updates;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (package_name !== undefined) {
      fields.push(`package_name = $${paramCount++}`);
      values.push(package_name);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (package_price !== undefined) {
      fields.push(`package_price = $${paramCount++}`);
      values.push(package_price);
    }
    if (display_image !== undefined) {
      fields.push(`display_image = $${paramCount++}`);
      values.push(display_image);
    }
    if (display_order !== undefined) {
      fields.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }
    if (expiry_date !== undefined) {
      fields.push(`expiry_date = $${paramCount++}`);
      values.push(expiry_date);
    }
    if (stock_quantity !== undefined) {
      fields.push(`stock_quantity = $${paramCount++}`);
      values.push(stock_quantity);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) {
      // Only updated_at, skip update
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE pricing_packages
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Xóa gói giá (soft delete - set is_active to false)
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const query = `
      UPDATE pricing_packages
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id;
    `;

    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Kiểm tra quyền sở hữu gói giá (của supplier nào)
   * @param {number} packageId
   * @param {number} supplierId
   * @returns {Promise<boolean>}
   */
  static async isOwner(packageId, supplierId) {
    const query = `
      SELECT id FROM pricing_packages
      WHERE id = $1 AND supplier_id = $2;
    `;

    const result = await db.query(query, [packageId, supplierId]);
    return result.rows.length > 0;
  }
}
