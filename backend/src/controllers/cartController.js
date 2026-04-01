import db from '../config/database.js';

class CartController {
  /**
   * GET /cart
   * Lấy giỏ hàng của người dùng hiện tại
   */
  static async getCart(req, res) {
    try {
      const userId = req.user?.userId;
      
      console.log('[getCart] User:', req.user);
      console.log('[getCart] UserId:', userId);

      if (!userId) {
        // Nếu chưa đăng nhập: trả về empty cart
        console.log('[getCart] No userId, returning empty cart');
        return res.json({ cartId: null, items: [] });
      }

      // Lấy cart items với thông tin sản phẩm
      const cartResult = await db.query(
        `SELECT c.id as cart_id, c.product_id, c.quantity, c.added_at,
                p.name, p.current_price, p.stock_quantity, p.expiry_date, p.image_url
         FROM carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.added_at DESC`,
        [userId]
      );

      console.log('[getCart] Raw query results:', cartResult.rows);

      if (cartResult.rows.length === 0) {
        return res.json({ cartId: null, items: [] });
      }

      // Transform data
      const items = cartResult.rows.map(row => ({
        product_id: row.product_id,
        quantity: row.quantity,
        unit_price: Number(row.current_price) || 0,
        subtotal: Number(row.quantity) * Number(row.current_price) || 0,
        product: {
          id: row.product_id,
          name: row.name,
          currentPrice: Number(row.current_price) || 0,
          stockQuantity: row.stock_quantity,
          expiryDate: row.expiry_date,
          images: row.image_url ? [row.image_url] : []
        }
      }));

      console.log('[getCart] Transformed items:', items);

      // Tính tổng tiền
      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      return res.json({
        cartId: cartResult.rows[0].cart_id,
        items,
        totalAmount
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ error: 'Lỗi khi lấy giỏ hàng' });
    }
  }

  /**
   * POST /cart/merge
   * Merge guest cart vào user cart khi đăng nhập
   * Body: { items: [{product_id, quantity, unit_price}, ...] }
   */
  static async mergeCart(req, res) {
    try {
      const userId = req.user?.userId;
      const { items: guestItems } = req.body;

      if (!userId || !Array.isArray(guestItems)) {
        return res.status(400).json({
          error: 'Invalid request',
          required: ['userId', 'items array']
        });
      }

      console.log('[mergeCart] Merging', guestItems.length, 'guest items for user', userId);

      // Merge logic: Thêm từng item từ guest cart
      for (const guestItem of guestItems) {
        if (!guestItem.product_id || guestItem.quantity < 1) continue;

        // Kiểm tra tồn kho
        const productResult = await db.query(
          `SELECT stock_quantity FROM products WHERE id = $1`,
          [guestItem.product_id]
        );

        if (productResult.rows.length === 0) {
          console.log('[mergeCart] Product', guestItem.product_id, 'not found, skipping');
          continue;
        }

        const product = productResult.rows[0];
        const requestedQty = guestItem.quantity;

        if (requestedQty > product.stock_quantity) {
          console.log('[mergeCart] Insufficient stock for product', guestItem.product_id);
          continue;
        }

        // Thêm vào cart (hoặc cối gộp nếu đã có)
        await db.query(
          `INSERT INTO carts (user_id, product_id, quantity, added_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (user_id, product_id) DO UPDATE
           SET quantity = carts.quantity + EXCLUDED.quantity`,
          [userId, guestItem.product_id, requestedQty]
        );

        console.log('[mergeCart] Merged product', guestItem.product_id, 'qty:', requestedQty);
      }

      // Fetch updated cart
      const cartResult = await db.query(
        `SELECT c.id as cart_id, c.product_id, c.quantity, c.added_at,
                p.name, p.current_price, p.stock_quantity, p.expiry_date, p.image_url
         FROM carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.added_at DESC`,
        [userId]
      );

      const items = cartResult.rows.map(row => ({
        product_id: row.product_id,
        quantity: row.quantity,
        unit_price: row.current_price,
        subtotal: row.quantity * row.current_price,
        product: {
          id: row.product_id,
          name: row.name,
          currentPrice: row.current_price,
          stockQuantity: row.stock_quantity,
          expiryDate: row.expiry_date,
          images: row.image_url ? [row.image_url] : []
        }
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      return res.json({
        success: true,
        message: `Merged ${guestItems.length} items successfully`,
        cartId: cartResult.rows.length > 0 ? cartResult.rows[0].cart_id : null,
        items,
        totalAmount
      });
    } catch (error) {
      console.error('[mergeCart] Error:', error);
      res.status(500).json({ error: 'Lỗi khi merge giỏ hàng', details: error.message });
    }
  }

  /**
   * POST /cart/items
   * Thêm sản phẩm vào giỏ hàng
   * Body: { product_id, quantity }
   */
  static async addToCart(req, res) {
    try {
      const { product_id, quantity } = req.body;
      const userId = req.user?.userId;

      console.log('[addToCart] Request body:', { product_id, quantity });
      console.log('[addToCart] User:', req.user);
      console.log('[addToCart] UserId:', userId);

      // Validate số lượng
      if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'Số lượng phải là số nguyên dương' });
      }

      // Lấy thông tin sản phẩm
      const productResult = await db.query(
        `SELECT id, current_price, stock_quantity FROM products WHERE id = $1`,
        [product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];

      // Validate tồn kho
      if (quantity > product.stock_quantity) {
        return res.status(409).json({
          error: 'Tồn kho không đủ',
          maxAvailable: product.stock_quantity,
          requested: quantity
        });
      }

      if (!userId) {
        // Nếu chưa đăng nhập: trả về thông tin để app lưu localStorage
        return res.json({
          message: 'Vui lòng đăng nhập để lưu giỏ hàng',
          item: {
            product_id,
            quantity,
            unit_price: product.current_price
          },
          requiresAuth: true
        });
      }

      // Thêm hoặc cập nhật cart item
      const cartResult = await db.query(
        `INSERT INTO carts (user_id, product_id, quantity, added_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, product_id) DO UPDATE
         SET quantity = carts.quantity + EXCLUDED.quantity
         RETURNING quantity`,
        [userId, product_id, quantity]
      );

      const newQuantity = cartResult.rows[0].quantity;

      // Validate lại tồn kho sau khi thêm
      if (newQuantity > product.stock_quantity) {
        return res.status(409).json({
          error: 'Tồn kho không đủ sau khi thêm',
          maxAvailable: product.stock_quantity,
          inCart: newQuantity - quantity,
          requested: quantity
        });
      }

      // Lấy tổng items trong cart
      const countResult = await db.query(
        `SELECT COUNT(*) as count FROM carts WHERE user_id = $1`,
        [userId]
      );

      return res.json({
        success: true,
        itemsCount: parseInt(countResult.rows[0].count),
        message: 'Đã thêm vào giỏ hàng'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Lỗi khi thêm vào giỏ hàng', details: error.message });
    }
  }

  /**
   * DELETE /cart/items/:product_id
   * Xóa sản phẩm khỏi giỏ hàng
   */
  static async removeFromCart(req, res) {
    try {
      const { product_id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Xóa item từ cart
      const deleteResult = await db.query(
        `DELETE FROM carts WHERE user_id = $1 AND product_id = $2`,
        [userId, product_id]
      );

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng' });
      }

      // Lấy tổng items còn lại
      const countResult = await db.query(
        `SELECT COUNT(*) as count FROM carts WHERE user_id = $1`,
        [userId]
      );

      return res.json({
        success: true,
        message: 'Đã xóa khỏi giỏ hàng',
        itemsCount: parseInt(countResult.rows[0].count)
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Lỗi khi xóa khỏi giỏ hàng', details: error.message });
    }
  }

  /**
   * PATCH /cart/items/:product_id
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * Body: { quantity }
   */
  static async updateCartItem(req, res) {
    try {
      const { product_id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      if (quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'Số lượng phải là số nguyên dương' });
      }

      // Lấy thông tin sản phẩm
      const productResult = await db.query(
        `SELECT stock_quantity, current_price FROM products WHERE id = $1`,
        [product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];

      if (quantity > product.stock_quantity) {
        return res.status(409).json({
          error: 'Tồn kho không đủ',
          maxAvailable: product.stock_quantity
        });
      }

      // Cập nhật số lượng trong giỏ
      const updateResult = await db.query(
        `UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3
         RETURNING quantity`,
        [quantity, userId, product_id]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng' });
      }

      return res.json({
        success: true,
        message: 'Đã cập nhật giỏ hàng',
        item: {
          product_id,
          quantity,
          unit_price: product.current_price,
          subtotal: quantity * product.current_price
        }
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật giỏ hàng', details: error.message });
    }
  }

  /**
   * DELETE /cart/clear
   * Xóa tất cả item khỏi giỏ hàng
   */
  static async clearCart(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      await db.query(
        `DELETE FROM carts WHERE user_id = $1`,
        [userId]
      );

      return res.json({
        success: true,
        message: 'Đã xóa tất cả khỏi giỏ hàng'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: 'Lỗi khi xóa giỏ hàng', details: error.message });
    }
  }
}

export default CartController;
