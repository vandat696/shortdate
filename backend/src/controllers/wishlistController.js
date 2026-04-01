import db from '../config/database.js';

class WishlistController {
  /**
   * GET /wishlist
   * Lấy danh sách sản phẩm wishlist của user
   */
  static async getWishlist(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      const result = await db.query(
        `SELECT w.id, w.product_id, w.added_at,
                p.id, p.name, p.description, p.category, p.current_price, 
                p.original_price, p.stock_quantity, p.expiry_date, p.image_url
         FROM wishlists w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = $1
         ORDER BY w.added_at DESC`,
        [userId]
      );

      const items = result.rows.map(row => ({
        id: row.id,
        product_id: row.product_id,
        added_at: row.added_at,
        product: {
          id: row.product_id,
          name: row.name,
          description: row.description,
          category: row.category,
          current_price: row.current_price,
          original_price: row.original_price,
          stock_quantity: row.stock_quantity,
          expiry_date: row.expiry_date,
          image_url: row.image_url
        }
      }));

      return res.json({
        success: true,
        items,
        count: items.length
      });
    } catch (error) {
      console.error('[getWishlist] Error:', error);
      res.status(500).json({ error: 'Lỗi khi lấy wishlist', details: error.message });
    }
  }

  /**
   * POST /products/:productId/wishlist
   * Thêm sản phẩm vào wishlist
   */
  static async addToWishlist(req, res) {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Kiểm tra sản phẩm tồn tại
      const productResult = await db.query(
        `SELECT id, name FROM products WHERE id = $1 AND is_active = true`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];

      // Thêm vào wishlist (bỏ qua nếu đã tồn tại)
      const result = await db.query(
        `INSERT INTO wishlists (user_id, product_id, added_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id, product_id) DO NOTHING
         RETURNING id, added_at`,
        [userId, productId]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          message: 'Sản phẩm đã được lưu trong wishlist',
          isNew: false
        });
      }

      return res.json({
        success: true,
        message: `Đã thêm "${product.name}" vào wishlist`,
        wishlistItem: {
          id: result.rows[0].id,
          product_id: productId,
          added_at: result.rows[0].added_at
        },
        isNew: true
      });
    } catch (error) {
      console.error('[addToWishlist] Error:', error);
      res.status(500).json({ error: 'Lỗi khi thêm vào wishlist', details: error.message });
    }
  }

  /**
   * DELETE /products/:productId/wishlist
   * Xóa sản phẩm khỏi wishlist
   */
  static async removeFromWishlist(req, res) {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      const result = await db.query(
        `DELETE FROM wishlists 
         WHERE user_id = $1 AND product_id = $2
         RETURNING product_id`,
        [userId, productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không trong wishlist' });
      }

      return res.json({
        success: true,
        message: 'Đã xóa khỏi wishlist',
        product_id: productId
      });
    } catch (error) {
      console.error('[removeFromWishlist] Error:', error);
      res.status(500).json({ error: 'Lỗi khi xóa khỏi wishlist', details: error.message });
    }
  }

  /**
   * GET /products/:productId/wishlist/check
   * Kiểm tra sản phẩm có trong wishlist không
   */
  static async checkWishlist(req, res) {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;

      if (!userId) {
        return res.json({ inWishlist: false });
      }

      const result = await db.query(
        `SELECT id FROM wishlists 
         WHERE user_id = $1 AND product_id = $2
         LIMIT 1`,
        [userId, productId]
      );

      return res.json({
        inWishlist: result.rows.length > 0,
        wishlistId: result.rows.length > 0 ? result.rows[0].id : null
      });
    } catch (error) {
      console.error('[checkWishlist] Error:', error);
      res.status(500).json({ error: 'Lỗi khi kiểm tra wishlist', details: error.message });
    }
  }
}

export default WishlistController;
