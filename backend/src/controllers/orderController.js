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
   * Tạo đơn hàng mới từ các sản phẩm và/hoặc gói giá được chọn
   * Body: { addressId, deliveryMethodId, paymentMethod, items: [{ productId, packageId, quantity, itemType }] }
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

      const orderItems = [];
      let subtotal = 0;
      let supplierId = null;

      // Process each item (could be product or package)
      for (const item of items) {
        const itemType = item.itemType || 'product';

        if (itemType === 'package') {
          // Process pricing package
          const packageResult = await db.query(
            `SELECT id, package_name, package_price, stock_quantity, supplier_id
             FROM pricing_packages WHERE id = $1 AND is_active = true`,
            [item.packageId]
          );

          if (packageResult.rows.length === 0) {
            return res.status(404).json({
              error: 'Gói giá không tồn tại',
              packageId: item.packageId
            });
          }

          const pkg = packageResult.rows[0];

          // Package quantity luôn là 1
          const itemQuantity = 1;
          
          if (itemQuantity > pkg.stock_quantity) {
            return res.status(409).json({
              error: 'Tồn kho gói giá không đủ',
              package: pkg.package_name,
              available: pkg.stock_quantity
            });
          }

          const itemSubtotal = Number(pkg.package_price);
          orderItems.push({
            package_id: pkg.id,
            package_name: pkg.package_name,
            supplier_id: pkg.supplier_id,
            quantity: itemQuantity,
            unit_price: Number(pkg.package_price),
            subtotal: itemSubtotal,
            item_type: 'package'
          });

          subtotal += itemSubtotal;
          supplierId = pkg.supplier_id;
        } else {
          // Process regular product
          const productResult = await db.query(
            `SELECT id, current_price, stock_quantity, supplier_id, product_type, name
             FROM products WHERE id = $1`,
            [item.productId]
          );

          if (productResult.rows.length === 0) {
            return res.status(404).json({
              error: 'Sản phẩm không tồn tại',
              productId: item.productId
            });
          }

          const product = productResult.rows[0];

          // Validate stock
          if (item.quantity > product.stock_quantity) {
            return res.status(409).json({
              error: 'Tồn kho không đủ',
              product: product.name,
              requested: item.quantity,
              available: product.stock_quantity
            });
          }

          const itemSubtotal = Number(product.current_price) * Number(item.quantity);
          orderItems.push({
            product_id: product.id,
            product_name: product.name,
            supplier_id: product.supplier_id,
            quantity: item.quantity,
            unit_price: Number(product.current_price),
            subtotal: itemSubtotal,
            product_type: product.product_type,
            item_type: 'product'
          });

          subtotal += itemSubtotal;
          supplierId = product.supplier_id;
        }
      }

      // Calculate shipping fee from delivery method
      const shippingFee = Number(deliveryMethod.base_price);

      // Create order
      const totalAmount = Number(subtotal) + Number(shippingFee);

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
        if (item.item_type === 'package') {
          // Insert package order item
          await db.query(
            `INSERT INTO order_items (order_id, package_id, quantity, unit_price, total_price, item_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderId, item.package_id, item.quantity, item.unit_price, item.subtotal, 'package']
          );

          // Deduct package stock
          await db.query(
            `UPDATE pricing_packages SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
            [item.quantity, item.package_id]
          );
        } else {
          // Insert product order item
          await db.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, item_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal, 'product']
          );

          // Deduct product stock
          await db.query(
            `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }

      // Delete selected items from cart
      await db.query(
        `DELETE FROM carts WHERE user_id = $1 AND (
          (product_id = ANY($2) AND item_type = 'product') OR
          (package_id = ANY($3) AND item_type = 'package')
        )`,
        [userId, items.filter(i => i.itemType === 'product').map(i => i.productId), items.filter(i => i.itemType === 'package').map(i => i.packageId)]
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
          items: orderItems.map(item => {
            // Build name with fallback
            let itemName = '';
            if (item.item_type === 'package') {
              itemName = item.package_name || `Gói #${item.package_id}`;
            } else {
              itemName = item.product_name || `Sản phẩm #${item.product_id}`;
            }
            
            return {
              type: item.item_type,
              name: itemName,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.subtotal
            };
          }),
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
      console.error('❌ Error creating order:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      res.status(500).json({ 
        error: 'Lỗi khi tạo đơn hàng',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

      // Lấy order items - bao gồm cả products và pricing packages
      const itemsResult = await db.query(
        `SELECT 
          oi.*, 
          p.name as product_name, 
          p.image_url as product_image,
          pp.package_name, 
          pp.display_image as package_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN pricing_packages pp ON oi.package_id = pp.id
         WHERE oi.order_id = $1`,
        [orderId]
      );

      console.log('🔍 [getOrder] itemsResult.rows:', itemsResult.rows);
      
      const items = itemsResult.rows.map((item, idx) => {
        console.log(`📌 [getOrder] Processing item ${idx}:`, {
          item_type: item.item_type,
          product_id: item.product_id,
          package_id: item.package_id,
          product_name: item.product_name,
          package_name: item.package_name
        });
        
        if (item.item_type === 'package') {
          return {
            packageId: item.package_id,
            packageName: item.package_name,
            packageImage: item.package_image,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: Number(item.total_price) || 0,
            type: 'package'
          };
        } else {
          return {
            productId: item.product_id,
            productName: item.product_name,
            productImage: item.product_image,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: Number(item.total_price) || 0,
            type: 'product'
          };
        }
      });

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
      let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE buyer_id = $1';
      let params = [userId];

      if (status) {
        query += ' AND status = $2';
        countQuery += ' AND status = $2';
        params.push(status);
      }

      // Get total count
      const countResult = await db.query(countQuery, params);
      const total = Number(countResult.rows[0]?.total || 0);

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      const queryParams = [...params, limit, offset];

      const result = await db.query(query, queryParams);

      return res.json({
        orders: result.rows,
        count: result.rows.length,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
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
