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

      // Lấy cart items - bao gồm cả products và pricing packages
      const cartResult = await db.query(
        `SELECT 
          c.id as cart_id, 
          c.product_id, 
          c.package_id,
          c.quantity, 
          c.added_at,
          c.item_type,
          p.name as product_name, 
          p.current_price as product_price, 
          p.stock_quantity as product_stock,
          p.expiry_date as product_expiry,
          p.image_url as product_image,
          pp.package_name,
          pp.package_price,
          pp.stock_quantity as package_stock,
          pp.expiry_date as package_expiry,
          pp.display_image as package_image
         FROM carts c
         LEFT JOIN products p ON c.product_id = p.id
         LEFT JOIN pricing_packages pp ON c.package_id = pp.id
         WHERE c.user_id = $1
         ORDER BY c.added_at DESC`,
        [userId]
      );

      console.log('[getCart] Raw query results:', cartResult.rows);

      if (cartResult.rows.length === 0) {
        return res.json({ cartId: null, items: [] });
      }

      // Transform data
      const items = cartResult.rows.map(row => {
        if (row.item_type === 'package') {
          // Item là Pricing Package
          return {
            product_id: row.package_id,
            package_id: row.package_id,
            quantity: row.quantity,
            unit_price: Number(row.package_price) || 0,
            subtotal: Number(row.quantity) * Number(row.package_price) || 0,
            item_type: 'package',
            product: {
              id: row.package_id,
              name: row.package_name,
              currentPrice: Number(row.package_price) || 0,
              stockQuantity: row.package_stock,
              expiryDate: row.package_expiry,
              images: row.package_image ? [row.package_image] : []
            }
          };
        } else {
          // Item là Product thông thường
          return {
            product_id: row.product_id,
            quantity: row.quantity,
            unit_price: Number(row.product_price) || 0,
            subtotal: Number(row.quantity) * Number(row.product_price) || 0,
            item_type: 'product',
            product: {
              id: row.product_id,
              name: row.product_name,
              currentPrice: Number(row.product_price) || 0,
              stockQuantity: row.product_stock,
              expiryDate: row.product_expiry,
              images: row.product_image ? [row.product_image] : []
            }
          };
        }
      });

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
   * Body: { items: [{product_id, quantity, unit_price, itemType}, ...] }
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

        const itemType = guestItem.itemType || 'product';

        if (itemType === 'package') {
          // Merge Pricing Package
          const packageResult = await db.query(
            `SELECT stock_quantity FROM pricing_packages WHERE id = $1`,
            [guestItem.product_id]
          );

          if (packageResult.rows.length === 0) {
            console.log('[mergeCart] Package', guestItem.product_id, 'not found, skipping');
            continue;
          }

          // Package luôn là 1 item
          const requestedQty = 1;

          if (requestedQty > packageResult.rows[0].stock_quantity) {
            console.log('[mergeCart] Insufficient stock for package', guestItem.product_id);
            continue;
          }

          // Check if already exists
          const existsCheck = await db.query(
            `SELECT id FROM carts WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'`,
            [userId, guestItem.product_id]
          );

          if (existsCheck.rows.length > 0) {
            // Update existing
            await db.query(
              `UPDATE carts SET quantity = 1 WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'`,
              [userId, guestItem.product_id]
            );
          } else {
            // Insert new
            await db.query(
              `INSERT INTO carts (user_id, package_id, quantity, item_type, added_at)
               VALUES ($1, $2, $3, 'package', NOW())`,
              [userId, guestItem.product_id, requestedQty]
            );
          }

          console.log('[mergeCart] Merged package', guestItem.product_id, 'qty: 1');
        } else {
          // Merge Product thông thường
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

          // Check if already exists
          const existsCheck = await db.query(
            `SELECT id, quantity FROM carts WHERE user_id = $1 AND product_id = $2 AND item_type = 'product'`,
            [userId, guestItem.product_id]
          );

          if (existsCheck.rows.length > 0) {
            // Update existing - add quantity
            const newQty = existsCheck.rows[0].quantity + requestedQty;
            await db.query(
              `UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND item_type = 'product'`,
              [newQty, userId, guestItem.product_id]
            );
          } else {
            // Insert new
            await db.query(
              `INSERT INTO carts (user_id, product_id, quantity, item_type, added_at)
               VALUES ($1, $2, $3, 'product', NOW())`,
              [userId, guestItem.product_id, requestedQty]
            );
          }

          console.log('[mergeCart] Merged product', guestItem.product_id, 'qty:', requestedQty);
        }
      }

      // Fetch updated cart (reuse getCart logic)
      const cartResult = await db.query(
        `SELECT 
          c.id as cart_id, 
          c.product_id, 
          c.package_id,
          c.quantity, 
          c.added_at,
          c.item_type,
          p.name as product_name, 
          p.current_price as product_price, 
          p.stock_quantity as product_stock,
          p.expiry_date as product_expiry,
          p.image_url as product_image,
          pp.package_name,
          pp.package_price,
          pp.stock_quantity as package_stock,
          pp.expiry_date as package_expiry,
          pp.display_image as package_image
         FROM carts c
         LEFT JOIN products p ON c.product_id = p.id
         LEFT JOIN pricing_packages pp ON c.package_id = pp.id
         WHERE c.user_id = $1
         ORDER BY c.added_at DESC`,
        [userId]
      );

      const items = cartResult.rows.map(row => {
        if (row.item_type === 'package') {
          return {
            product_id: row.package_id,
            package_id: row.package_id,
            quantity: row.quantity,
            unit_price: row.package_price,
            subtotal: row.quantity * row.package_price,
            item_type: 'package',
            product: {
              id: row.package_id,
              name: row.package_name,
              currentPrice: row.package_price,
              stockQuantity: row.package_stock,
              expiryDate: row.package_expiry,
              images: row.package_image ? [row.package_image] : []
            }
          };
        } else {
          return {
            product_id: row.product_id,
            quantity: row.quantity,
            unit_price: row.product_price,
            subtotal: row.quantity * row.product_price,
            item_type: 'product',
            product: {
              id: row.product_id,
              name: row.product_name,
              currentPrice: row.product_price,
              stockQuantity: row.product_stock,
              expiryDate: row.product_expiry,
              images: row.product_image ? [row.product_image] : []
            }
          };
        }
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      return res.json({
        success: true,
        itemsCount: items.length,
        items,
        totalAmount,
        message: 'Đã merge giỏ hàng thành công'
      });
    } catch (error) {
      console.error('Error merging cart:', error);
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

      // Kiểm tra xem product_id có phải là pricing package không
      const packageResult = await db.query(
        `SELECT id, package_name, package_price, stock_quantity 
         FROM pricing_packages WHERE id = $1 AND is_active = true`,
        [product_id]
      );

      const isPricingPackage = packageResult.rows.length > 0;

      if (isPricingPackage) {
        // Xử lý Pricing Package - luôn là 1 item
        const pkg = packageResult.rows[0];
        const itemQuantity = 1; // Gói luôn tính là 1 sản phẩm

        // Validate tồn kho
        if (pkg.stock_quantity < itemQuantity) {
          return res.status(409).json({
            error: 'Tồn kho không đủ',
            maxAvailable: pkg.stock_quantity,
            requested: itemQuantity
          });
        }

        if (!userId) {
          // Chưa đăng nhập: lưu vào localStorage
          return res.json({
            message: 'Vui lòng đăng nhập để lưu giỏ hàng',
            item: {
              product_id,
              quantity: itemQuantity,
              unit_price: pkg.package_price,
              itemType: 'package'
            },
            requiresAuth: true
          });
        }

        // Thêm hoặc cập nhật cart item
        const existsCheck = await db.query(
          `SELECT id FROM carts WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'`,
          [userId, product_id]
        );

        if (existsCheck.rows.length > 0) {
          // Package đã tồn tại, set quantity = 1
          await db.query(
            `UPDATE carts SET quantity = 1 WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'`,
            [userId, product_id]
          );
        } else {
          // Insert mới
          await db.query(
            `INSERT INTO carts (user_id, package_id, quantity, item_type, added_at)
             VALUES ($1, $2, $3, 'package', NOW())`,
            [userId, product_id, itemQuantity]
          );
        }

        // Lấy tổng items trong cart
        const countResult = await db.query(
          `SELECT COUNT(*) as count FROM carts WHERE user_id = $1`,
          [userId]
        );

        return res.json({
          success: true,
          itemsCount: parseInt(countResult.rows[0].count),
          message: 'Đã thêm gói giá vào giỏ hàng'
        });
      }

      // Xử lý Product thông thường
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
            unit_price: product.current_price,
            itemType: 'product'
          },
          requiresAuth: true
        });
      }

      // Thêm hoặc cập nhật cart item
      const existsCheck = await db.query(
        `SELECT id, quantity FROM carts WHERE user_id = $1 AND product_id = $2 AND item_type = 'product'`,
        [userId, product_id]
      );

      let newQuantity = quantity;
      if (existsCheck.rows.length > 0) {
        // Product đã tồn tại, cộng thêm quantity
        newQuantity = existsCheck.rows[0].quantity + quantity;
        await db.query(
          `UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND item_type = 'product'`,
          [newQuantity, userId, product_id]
        );
      } else {
        // Insert mới
        await db.query(
          `INSERT INTO carts (user_id, product_id, quantity, item_type, added_at)
           VALUES ($1, $2, $3, 'product', NOW())`,
          [userId, product_id, quantity]
        );
      }

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
   * Xóa sản phẩm hoặc gói giá khỏi giỏ hàng
   */
  static async removeFromCart(req, res) {
    try {
      const { product_id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Kiểm tra xem có phải package không
      const packageCheck = await db.query(
        `SELECT package_id FROM carts WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'`,
        [userId, product_id]
      );

      let deleteResult;
      if (packageCheck.rows.length > 0) {
        // Xóa gói giá
        deleteResult = await db.query(
          `DELETE FROM carts WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'`,
          [userId, product_id]
        );
      } else {
        // Xóa sản phẩm thông thường
        deleteResult = await db.query(
          `DELETE FROM carts WHERE user_id = $1 AND product_id = $2 AND item_type = 'product'`,
          [userId, product_id]
        );
      }

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
   * Lưu ý: Gói giá luôn có quantity = 1
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

      // Kiểm tra xem có phải package không
      const packageCheck = await db.query(
        `SELECT package_id, package_price FROM carts c
         LEFT JOIN pricing_packages pp ON c.package_id = pp.id
         WHERE c.user_id = $1 AND c.package_id = $2 AND c.item_type = 'package'`,
        [userId, product_id]
      );

      if (packageCheck.rows.length > 0) {
        // Gói giá luôn là quantity 1, không cho phép thay đổi
        const pkg = packageCheck.rows[0];
        return res.json({
          success: true,
          message: 'Gói giá luôn là 1 sản phẩm',
          item: {
            product_id,
            quantity: 1,
            unit_price: pkg.package_price,
            subtotal: 1 * pkg.package_price
          }
        });
      }

      // Xử lý Product thông thường
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
        `UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND item_type = 'product'
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
