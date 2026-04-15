import db from '../config/database.js';

export default class PackageItem {
  /**
   * Thêm sản phẩm vào gói
   * @param {number} packageId
   * @param {number} productId
   * @param {number} quantity
   * @returns {Promise<Object>}
   */
  static async addItem(packageId, productId, quantity) {
    const query = `
      INSERT INTO package_items (package_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (package_id, product_id)
      DO UPDATE SET quantity = $3, created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(query, [packageId, productId, quantity]);
    return result.rows[0];
  }

  /**
   * Lấy tất cả sản phẩm trong gói
   * @param {number} packageId
   * @returns {Promise<Array>}
   */
  static async getItems(packageId) {
    const query = `
      SELECT 
        pi.*,
        p.id as product_id,
        p.name,
        p.current_price,
        p.original_price,
        p.image_url,
        p.product_type
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = $1
      ORDER BY pi.created_at ASC;
    `;

    const result = await db.query(query, [packageId]);
    return result.rows;
  }

  /**
   * Xóa sản phẩm khỏi gói
   * @param {number} packageId
   * @param {number} productId
   * @returns {Promise<boolean>}
   */
  static async removeItem(packageId, productId) {
    const query = `
      DELETE FROM package_items
      WHERE package_id = $1 AND product_id = $2
      RETURNING id;
    `;

    const result = await db.query(query, [packageId, productId]);
    return result.rows.length > 0;
  }

  /**
   * Cập nhật số lượng sản phẩm trong gói
   * @param {number} packageId
   * @param {number} productId
   * @param {number} quantity
   * @returns {Promise<Object|null>}
   */
  static async updateQuantity(packageId, productId, quantity) {
    const query = `
      UPDATE package_items
      SET quantity = $3
      WHERE package_id = $1 AND product_id = $2
      RETURNING *;
    `;

    const result = await db.query(query, [packageId, productId, quantity]);
    return result.rows[0] || null;
  }

  /**
   * Xóa tất cả items của gói (khi gói bị xóa)
   * @param {number} packageId
   * @returns {Promise<number>} Số items bị xóa
   */
  static async deleteByPackage(packageId) {
    const query = `
      DELETE FROM package_items
      WHERE package_id = $1
      RETURNING id;
    `;

    const result = await db.query(query, [packageId]);
    return result.rows.length;
  }

  /**
   * Tính tổng giá trị sản phẩm trong gói (tổng hợp giá gốc)
   * @param {number} packageId
   * @returns {Promise<Object>} { total_original_value, total_current_value, items_count }
   */
  static async calculatePackageValue(packageId) {
    const query = `
      SELECT 
        COUNT(pi.id) as items_count,
        SUM(p.original_price * pi.quantity) as total_original_value,
        SUM(p.current_price * pi.quantity) as total_current_value
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = $1;
    `;

    const result = await db.query(query, [packageId]);
    return result.rows[0];
  }
}
