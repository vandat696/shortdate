import pool from '../config/database.js';

export default class Category {
  // Lấy tất cả categories
  static async findAll() {
    const query = `
      SELECT * FROM categories 
      WHERE is_active = TRUE 
      ORDER BY display_order ASC, name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Lấy category theo ID
  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Tạo category mới (admin)
  static async create(categoryData) {
    const { name, description = '', icon = '', display_order = 0 } = categoryData;

    const query = `
      INSERT INTO categories (name, description, icon, display_order, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING *
    `;

    const values = [name, description, icon, display_order];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Cập nhật category (admin)
  static async update(id, categoryData) {
    const { name, description, icon, display_order, is_active } = categoryData;

    const query = `
      UPDATE categories
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          icon = COALESCE($3, icon),
          display_order = COALESCE($4, display_order),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [name, description, icon, display_order, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Xóa category (soft delete)
  static async delete(id) {
    const query = `
      UPDATE categories
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy categories của một sản phẩm
  static async getProductCategories(productId) {
    const query = `
      SELECT c.* FROM categories c
      JOIN product_categories pc ON c.id = pc.category_id
      WHERE pc.product_id = $1
      ORDER BY c.display_order ASC
    `;

    const result = await pool.query(query, [productId]);
    return result.rows;
  }

  // Thêm category cho sản phẩm
  static async addProductCategory(productId, categoryId) {
    const query = `
      INSERT INTO product_categories (product_id, category_id)
      VALUES ($1, $2)
      ON CONFLICT (product_id, category_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [productId, categoryId]);
    return result.rows[0];
  }

  // Xóa category khỏi sản phẩm
  static async removeProductCategory(productId, categoryId) {
    const query = `
      DELETE FROM product_categories
      WHERE product_id = $1 AND category_id = $2
    `;

    await pool.query(query, [productId, categoryId]);
    return true;
  }

  // Cập nhật categories cho sản phẩm (thay thế tất cả)
  static async updateProductCategories(productId, categoryIds) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Nếu không có categoryIds, xóa tất cả
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        await client.query(
          'DELETE FROM product_categories WHERE product_id = $1',
          [productId]
        );
        await client.query('COMMIT');
        return true;
      }

      // Validate tất cả categoryIds có tồn tại không
      const validationQuery = `
        SELECT COUNT(*) as valid_count FROM categories 
        WHERE id = ANY($1) AND is_active = TRUE
      `;
      const validationResult = await client.query(validationQuery, [categoryIds]);
      const validCount = parseInt(validationResult.rows[0].valid_count);

      if (validCount !== categoryIds.length) {
        throw new Error(
          `Có ${categoryIds.length - validCount} categoryIds không hợp lệ hoặc không active. ` +
          `Valid categories: ${validCount}, Requested: ${categoryIds.length}`
        );
      }

      // Xóa tất cả categories cũ của sản phẩm
      await client.query(
        'DELETE FROM product_categories WHERE product_id = $1',
        [productId]
      );

      // Thêm categories mới
      for (const categoryId of categoryIds) {
        await client.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [productId, categoryId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Lấy sản phẩm theo category
  static async getProductsByCategory(categoryId, limit = 20, offset = 0) {
    const query = `
      SELECT p.* FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id = $1 AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [categoryId, limit, offset]);
    return result.rows;
  }
}
