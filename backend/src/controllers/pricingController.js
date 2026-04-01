import db from '../config/database.js';
import PricingHistory from '../models/PricingHistory.js';
import { runPricingEngine } from '../modules/pricing/engine.js';

class PricingController {
  /**
   * GET /pricing/:productId/current
   * Lấy giá hiện tại và risk score của sản phẩm
   */
  static async getCurrentPrice(req, res) {
    try {
      const { productId } = req.params;

      const productResult = await db.query(
        `SELECT id, current_price, original_price, min_floor_price, auto_pricing_enabled,
                product_type, stock_quantity, expiry_date, created_at
         FROM products WHERE id = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];
      const pricingResult = runPricingEngine(product);

      return res.json({
        productId: product.id,
        currentPrice: product.current_price,
        originalPrice: product.original_price,
        floorPrice: product.min_floor_price,
        autoPricingEnabled: product.auto_pricing_enabled,
        pricingResult: pricingResult ? {
          riskScore: Math.round(pricingResult.riskScore),
          discount: Math.round(pricingResult.discount),
          suggestedPrice: pricingResult.newPrice,
          willChange: pricingResult.changed
        } : null
      });
    } catch (error) {
      console.error('Error getting current price:', error);
      res.status(500).json({ error: 'Lỗi khi lấy giá' });
    }
  }

  /**
   * GET /pricing/:productId/history
   * Lấy lịch sử thay đổi giá của sản phẩm
   */
  static async getPriceHistory(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 50 } = req.query;

      const history = await PricingHistory.getHistory(productId, parseInt(limit));

      return res.json({
        productId,
        history,
        count: history.length
      });
    } catch (error) {
      console.error('Error getting price history:', error);
      res.status(500).json({ error: 'Lỗi khi lấy lịch sử giá' });
    }
  }

  /**
   * GET /pricing/:productId/with-history
   * Lấy giá hiện tại kèm toàn bộ lịch sử giá
   */
  static async getHistoryWithCurrent(req, res) {
    try {
      const { productId } = req.params;

      const result = await PricingHistory.getHistoryWithCurrent(productId);

      if (!result) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      return res.json({
        productId,
        currentPrice: result.current_price,
        originalPrice: result.original_price,
        floorPrice: result.floor_price,
        history: result.history
      });
    } catch (error) {
      console.error('Error getting price with history:', error);
      res.status(500).json({ error: 'Lỗi khi lấy thông tin giá' });
    }
  }

  /**
   * POST /pricing/:productId/apply-engine
   * Chạy Auto-Pricing Engine ngay lập tức cho một sản phẩm (test)
   */
  static async applyPricingEngine(req, res) {
    try {
      const { productId } = req.params;

      // Lấy sản phẩm từ database
      const productResult = await db.query(
        `SELECT id, current_price, original_price, min_floor_price, auto_pricing_enabled,
                product_type, stock_quantity, expiry_date, created_at
         FROM products WHERE id = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];

      // Chạy pricing engine
      const pricingResult = runPricingEngine(product);

      if (!pricingResult) {
        return res.status(400).json({ 
          error: 'Auto-Pricing Engine không được bật cho sản phẩm này' 
        });
      }

      // Nếu giá thay đổi, cập nhật database
      if (pricingResult.changed) {
        // Thêm vào lịch sử giá
        await PricingHistory.addHistory(
          productId,
          pricingResult.oldPrice,
          pricingResult.newPrice,
          pricingResult.reason
        );

        // Cập nhật giá hiện tại
        await db.query(
          'UPDATE products SET current_price = $1 WHERE id = $2',
          [pricingResult.newPrice, productId]
        );
      }

      return res.json({
        success: true,
        productId,
        oldPrice: pricingResult.oldPrice,
        newPrice: pricingResult.newPrice,
        changed: pricingResult.changed,
        riskScore: Math.round(pricingResult.riskScore),
        discount: Math.round(pricingResult.discount),
        reason: pricingResult.reason
      });
    } catch (error) {
      console.error('Error applying pricing engine:', error);
      res.status(500).json({ error: 'Lỗi khi chạy pricing engine' });
    }
  }

  /**
   * PUT /pricing/:productId/config
   * Cấu hình Auto-Pricing Engine cho sản phẩm
   */
  static async updatePricingConfig(req, res) {
    try {
      const { productId } = req.params;
      const { 
        autoPricingEnabled, 
        floorPrice,
        minDiscountPercent = 0,
        maxDiscountPercent = 80 
      } = req.body;

      // Verify ownership hoặc admin
      const productResult = await db.query(
        `SELECT p.id, p.supplier_id FROM products p WHERE p.id = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];

      // Validate ownership
      if (req.user.userId !== product.supplier_id) {
        return res.status(403).json({ error: 'Bạn không có quyền cấu hình sản phẩm này' });
      }

      // Cập nhật cấu hình
      const updateResult = await db.query(
        `UPDATE products 
         SET auto_pricing_enabled = COALESCE($1, auto_pricing_enabled),
             min_floor_price = COALESCE($2, min_floor_price)
         WHERE id = $3
         RETURNING *`,
        [
          autoPricingEnabled !== undefined ? autoPricingEnabled : null,
          floorPrice !== undefined ? floorPrice : null,
          productId
        ]
      );

      const updatedProduct = updateResult.rows[0];

      return res.json({
        success: true,
        productId: updatedProduct.id,
        autoPricingEnabled: updatedProduct.auto_pricing_enabled,
        floorPrice: updatedProduct.min_floor_price,
        message: 'Cấu hình Auto-Pricing được cập nhật thành công'
      });
    } catch (error) {
      console.error('Error updating pricing config:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật cấu hình' });
    }
  }

  /**
   * POST /pricing/run-all-engines
   * ADMIN ONLY: Chạy Auto-Pricing Engine cho tất cả sản phẩm
   * Thường chạy định kỳ bằng cron job
   */
  static async runAllPricingEngines(req, res) {
    try {
      // Verify admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Chỉ admin mới có quyền' });
      }

      // Lấy tất cả sản phẩm có auto_pricing_enabled = true
      const productsResult = await db.query(
        `SELECT id, current_price, original_price, min_floor_price, auto_pricing_enabled,
                product_type, stock_quantity, expiry_date, created_at
         FROM products WHERE auto_pricing_enabled = true AND is_active = true`
      );

      const products = productsResult.rows;
      let updated = 0;
      let unchanged = 0;
      const errors = [];

      // Chạy pricing engine cho mỗi sản phẩm
      for (const product of products) {
        try {
          const pricingResult = runPricingEngine(product);

          if (pricingResult && pricingResult.changed) {
            // Thêm vào lịch sử giá
            await PricingHistory.addHistory(
              product.id,
              pricingResult.oldPrice,
              pricingResult.newPrice,
              pricingResult.reason
            );

            // Cập nhật giá
            await db.query(
              'UPDATE products SET current_price = $1 WHERE id = $2',
              [pricingResult.newPrice, product.id]
            );

            updated++;
          } else {
            unchanged++;
          }
        } catch (productError) {
          errors.push({
            productId: product.id,
            error: productError.message
          });
        }
      }

      return res.json({
        success: true,
        message: `Đã chạy Auto-Pricing Engine cho ${products.length} sản phẩm`,
        updated,
        unchanged,
        errors,
        errorCount: errors.length
      });
    } catch (error) {
      console.error('Error running all pricing engines:', error);
      res.status(500).json({ error: 'Lỗi khi chạy pricing engines' });
    }
  }
}

export default PricingController;
