import db from '../config/database.js';

class PricingHistory {
  // Thêm bản ghi lịch sử giá
  static async addHistory(productId, oldPrice, newPrice, reason) {
    try {
      const result = await db.query(
        `INSERT INTO price_history (product_id, old_price, new_price, change_reason, changed_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [productId, oldPrice, newPrice, reason]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error adding price history:', error);
      throw error;
    }
  }

  // Lấy lịch sử giá của sản phẩm
  static async getHistory(productId, limit = 50) {
    try {
      const result = await db.query(
        `SELECT * FROM price_history 
         WHERE product_id = $1 
         ORDER BY changed_at DESC 
         LIMIT $2`,
        [productId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  }

  // Lấy giá hiện tại và tất cả lịch sử của sản phẩm
  static async getHistoryWithCurrent(productId) {
    try {
      const result = await db.query(
        `SELECT 
          p.id, p.current_price, p.original_price, p.min_floor_price,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', ph.id,
                'old_price', ph.old_price,
                'new_price', ph.new_price,
                'reason', ph.change_reason,
                'changed_at', ph.changed_at
              )
            ) FROM price_history ph WHERE ph.product_id = $1),
            '[]'::json
          ) as history
         FROM products p
         WHERE p.id = $1`,
        [productId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting price with history:', error);
      throw error;
    }
  }
}

export default PricingHistory;
