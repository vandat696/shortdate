import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate mã đơn hàng duy nhất
 * Format: SH-YYYYMMDD-XXXXX
 */
async function generateOrderCode() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `SH-${dateStr}-${randomPart}`;

  // Verify uniqueness
  const checkResult = await db.query(
    'SELECT COUNT(*) as count FROM orders WHERE order_code = $1',
    [code]
  );

  if (checkResult.rows[0].count > 0) {
    return generateOrderCode(); // Retry if duplicate
  }

  return code;
}

class OrderController {
  /**
   * POST /orders
   * Tạo đơn hàng mới từ các sản phẩm được chọn
   * Body: { addressId, deliveryMethodId, paymentMethod, items: [{ productId, quantity }] }
   */
  static async createOrder(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      const { addressId, deliveryMethodId, paymentMethod, items } = req.body;

      if (!addressId || !deliveryMethodId || !paymentMethod) {
        return res.status(400).json({
          error: 'Thiếu thông tin bắt buộc',
          required: ['addressId', 'deliveryMethodId', 'paymentMethod']
        });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({
          error: 'Vui lòng chọn ít nhất 1 sản phẩm'
        });
      }

      // Validate and fetch address
      const addressResult = await db.query(
        'SELECT * FROM delivery_addresses WHERE id = $1 AND user_id = $2 AND is_active = TRUE',
        [addressId, userId]
      );

      if (addressResult.rows.length === 0) {
        return res.status(404).json({ error: 'Địa chỉ không tồn tại' });
      }

      const address = addressResult.rows[0];

      // Validate and fetch delivery method
      const methodResult = await db.query(
        'SELECT * FROM delivery_methods WHERE id = $1 AND is_active = TRUE',
        [deliveryMethodId]
      );

      if (methodResult.rows.length === 0) {
        return res.status(404).json({ error: 'Phương thức giao hàng không tồn tại' });
      }

      const deliveryMethod = methodResult.rows[0];

      // Validate payment method
      const validPaymentMethods = ['momo', 'zalopay', 'vnpay', 'atm', 'visa', 'cod'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          error: 'Phương thức thanh toán không hợp lệ',
          valid: validPaymentMethods
        });
      }

      // Lấy thông tin sản phẩm từ database
      const productIds = items.map(item => item.productId);
      const productsResult = await db.query(
        `SELECT id, current_price, stock_quantity, supplier_id, product_type, name
         FROM products
         WHERE id = ANY($1)`,
        [productIds]
      );

      const productsMap = new Map();
      productsResult.rows.forEach(row => {
        productsMap.set(row.id, row);
      });

      // Verify các sản phẩm vẫn tồn tại và validate tồn kho
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = productsMap.get(item.productId);
        
        if (!product) {
          return res.status(404).json({
            error: 'Sản phẩm không tồn tại',
            productId: item.productId
          });
        }

        // Validate tồn kho
        if (item.quantity > product.stock_quantity) {
          return res.status(409).json({
            error: 'Tồn kho không đủ',
            product: product.name,
            requested: item.quantity,
            available: product.stock_quantity
          });
        }

        // Build order item
        const itemSubtotal = Number(product.current_price) * Number(item.quantity);
        orderItems.push({
          product_id: product.id,
          supplier_id: product.supplier_id,
          quantity: item.quantity,
          unit_price: Number(product.current_price),
          subtotal: itemSubtotal,
          product_type: product.product_type
        });

        subtotal += itemSubtotal;
      }

      // Calculate shipping fee from delivery method
      const shippingFee = Number(deliveryMethod.base_price);

      // Create order
      const totalAmount = Number(subtotal) + Number(shippingFee);
      
      // Get first product's supplier_id (assume same supplier for now)
      const supplierId = orderItems[0].supplier_id;

      // Format address for storage
      const deliveryAddressText = `${address.full_name}, ${address.phone_number}, ${address.street_address}${address.ward ? ', ' + address.ward : ''}, ${address.district}, ${address.city}`;

      const orderResult = await db.query(
        `INSERT INTO orders (
          buyer_id, supplier_id, total_amount, final_amount,
          status, payment_method, payment_status, delivery_address,
          delivery_address_id, delivery_method_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, created_at`,
        [
          userId,
          supplierId,
          totalAmount,
          totalAmount,
          'confirmed',
          paymentMethod,
          'pending',
          deliveryAddressText,
          addressId,
          deliveryMethodId
        ]
      );

      const order = orderResult.rows[0];
      const orderId = order.id;

      // Insert order items
      for (const item of orderItems) {
        await db.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal]
        );

        // TRỪ tồn kho ngay lập tức
        await db.query(
          `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Xóa các sản phẩm đã chọn khỏi giỏ hàng
      await db.query(
        `DELETE FROM carts WHERE user_id = $1 AND product_id = ANY($2)`,
        [userId, productIds]
      );

      // Generate order code
      const orderCode = await generateOrderCode();
      await db.query(
        `UPDATE orders SET order_code = $1 WHERE id = $2`,
        [orderCode, orderId]
      );

      return res.status(201).json({
        success: true,
        order: {
          id: orderId,
          orderCode,
          buyerId: userId,
          itemsCount: orderItems.length,
          subtotal,
          shippingFee,
          totalAmount,
          paymentMethod,
          deliveryMethod: deliveryMethod.name,
          deliveryAddress: address.label,
          status: 'confirmed',
          createdAt: order.created_at
        },
        message: 'Đơn hàng đã được tạo thành công'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Lỗi khi tạo đơn hàng' });
    }
  }

  /**
   * GET /orders/:orderId
   * Lấy chi tiết đơn hàng
   */
  static async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;

      // Lấy thông tin order
      const orderResult = await db.query(
        `SELECT * FROM orders WHERE id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
      }

      const order = orderResult.rows[0];

      // Verify ownership (buyer hoặc admin)
      if (userId && userId !== order.buyer_id && req.user?.userType !== 'admin') {
        return res.status(403).json({ error: 'Bạn không có quyền xem đơn hàng này' });
      }

      // Lấy user info (buyer name, email)
      const buyerResult = await db.query(
        `SELECT id, email, first_name, last_name FROM users WHERE id = $1`,
        [order.buyer_id]
      );
      const buyer = buyerResult.rows[0];

      // Lấy order items
      const itemsResult = await db.query(
        `SELECT oi.*, p.name, p.image_url FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [orderId]
      );

      const items = itemsResult.rows.map(item => ({
        productId: item.product_id,
        productName: item.name,
        productImage: item.image_url,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: Number(item.total_price) || 0
      }));

      // Tính subtotal từ items
      const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      const shippingFee = Number(order.total_amount) - Number(subtotal);

      return res.json({
        success: true,
        order: {
          id: order.id,
          buyerName: `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() || buyer.email,
          buyerEmail: buyer.email,
          status: order.status,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          deliveryAddress: order.delivery_address,
          subtotal,
          shippingFee,
          totalAmount: order.total_amount,
          finalAmount: order.final_amount,
          createdAt: order.created_at,
          updatedAt: order.updated_at
        },
        items,
        itemsCount: items.length
      });
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Lỗi khi lấy đơn hàng', details: error.message });
    }
  }

  /**
   * GET /orders
   * Lấy danh sách đơn hàng của người dùng
   * Query: status, limit, offset
   */
  static async getMyOrders(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      const { status, limit = 20, offset = 0 } = req.query;

      let query = 'SELECT id, order_code, status, total_amount, created_at FROM orders WHERE buyer_id = $1';
      let params = [userId];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit);
      params.push(offset);

      const result = await db.query(query, params);

      return res.json({
        orders: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn hàng' });
    }
  }

  /**
   * POST /orders/:orderId/cancel
   * Hủy đơn hàng
   */
  static async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;

      // Lấy order
      const orderResult = await db.query(
        `SELECT id, buyer_id, status FROM orders WHERE id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
      }

      const order = orderResult.rows[0];

      // Verify ownership
      if (userId !== order.buyer_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bạn không có quyền hủy đơn hàng này' });
      }

      // Validate status - chỉ có thể hủy nếu status là 'confirmed' hoặc 'pending'
      if (!['confirmed', 'pending'].includes(order.status)) {
        return res.status(400).json({
          error: 'Chỉ có thể hủy đơn hàng ở trạng thái confirmed hoặc pending',
          currentStatus: order.status
        });
      }

      // Lấy order items để trả lại tồn kho
      const itemsResult = await db.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
        [orderId]
      );

      // Trả lại tồn kho
      for (const item of itemsResult.rows) {
        await db.query(
          `UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      await db.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
        ['cancelled', orderId]
      );

      return res.json({
        success: true,
        message: 'Đơn hàng đã được hủy',
        orderId,
        newStatus: 'cancelled'
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: 'Lỗi khi hủy đơn hàng' });
    }
  }
}

export default OrderController;
