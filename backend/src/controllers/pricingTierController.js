import PricingTier from '../models/PricingTier.js';
import db from '../config/database.js';

class PricingTierController {
  /**
   * GET /api/pricing-tiers/product/:productId
   * Lấy tất cả tiers của sản phẩm
   */
  static async getProductTiers(req, res) {
    try {
      const { productId } = req.params;

      const tiers = await PricingTier.findByProduct(productId);

      return res.json({
        product_id: productId,
        count: tiers.length,
        tiers
      });
    } catch (error) {
      console.error('Error getting product tiers:', error);
      res.status(500).json({ error: 'Lỗi khi lấy tầng giá' });
    }
  }

  /**
   * POST /api/pricing-tiers
   * Tạo tier giá mới (Supplier only)
   * Body: { product_id, min_quantity, max_quantity, tier_price, discount_percentage, description }
   */
  static async createTier(req, res) {
    try {
      const {
        product_id,
        min_quantity,
        max_quantity,
        tier_price,
        discount_percentage = 0,
        description
      } = req.body;

      // Validate
      if (!product_id || !min_quantity || tier_price === undefined) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      if (min_quantity <= 0 || tier_price <= 0) {
        return res.status(400).json({ error: 'Min quantity và tier price phải lớn hơn 0' });
      }

      if (max_quantity && max_quantity < min_quantity) {
        return res.status(400).json({ error: 'Max quantity phải >= min_quantity' });
      }

      // Kiểm tra product ownersh
      const productCheck = await db.query(
        'SELECT id FROM products WHERE id = $1 AND supplier_id = $2',
        [product_id, req.user.id]
      );

      if (productCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Sản phẩm không tồn tại hoặc bạn không sở hữu' });
      }

      const tier = await PricingTier.create({
        product_id,
        min_quantity,
        max_quantity,
        tier_price,
        discount_percentage,
        description
      });

      return res.status(201).json({
        message: 'Tạo tầng giá thành công',
        tier
      });
    } catch (error) {
      console.error('Error creating tier:', error);
      
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Tầng giá này đã tồn tại cho sản phẩm' });
      }

      res.status(500).json({ error: 'Lỗi khi tạo tầng giá' });
    }
  }

  /**
   * PUT /api/pricing-tiers/:id
   * Cập nhật tier giá (Supplier only)
   */
  static async updateTier(req, res) {
    try {
      const { id } = req.params;
      const {
        min_quantity,
        max_quantity,
        tier_price,
        discount_percentage,
        description,
        is_active
      } = req.body;

      // Kiểm tra ownership
      const isOwned = await PricingTier.isOwnedBySupplier(id, req.user.id);
      if (!isOwned) {
        return res.status(403).json({ error: 'Bạn chỉ có thể cập nhật tầng giá của mình' });
      }

      // Validate
      if (min_quantity !== undefined && min_quantity <= 0) {
        return res.status(400).json({ error: 'Min quantity phải lớn hơn 0' });
      }

      if (tier_price !== undefined && tier_price <= 0) {
        return res.status(400).json({ error: 'Tier price phải lớn hơn 0' });
      }

      if (
        min_quantity !== undefined &&
        max_quantity !== undefined &&
        max_quantity &&
        max_quantity < min_quantity
      ) {
        return res.status(400).json({ error: 'Max quantity phải >= min_quantity' });
      }

      const tier = await PricingTier.update(id, {
        min_quantity,
        max_quantity,
        tier_price,
        discount_percentage,
        description,
        is_active
      });

      return res.json({
        message: 'Cập nhật tầng giá thành công',
        tier
      });
    } catch (error) {
      console.error('Error updating tier:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật tầng giá' });
    }
  }

  /**
   * DELETE /api/pricing-tiers/:id
   * Xóa tier giá (Supplier only)
   */
  static async deleteTier(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra ownership
      const isOwned = await PricingTier.isOwnedBySupplier(id, req.user.id);
      if (!isOwned) {
        return res.status(403).json({ error: 'Bạn chỉ có thể xóa tầng giá của mình' });
      }

      const deleted = await PricingTier.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Tầng giá không tồn tại' });
      }

      return res.json({ message: 'Xóa tầng giá thành công' });
    } catch (error) {
      console.error('Error deleting tier:', error);
      res.status(500).json({ error: 'Lỗi khi xóa tầng giá' });
    }
  }

  /**
   * GET /api/pricing-tiers/product/:productId/quantity/:quantity
   * Lấy tier phù hợp cho số lượng nhất định (For buyers to see price)
   */
  static async getTierByQuantity(req, res) {
    try {
      const { productId, quantity } = req.params;

      const tier = await PricingTier.getTierByQuantity(productId, parseInt(quantity));

      if (!tier) {
        return res.status(404).json({ error: 'Không có tầng giá phù hợp' });
      }

      return res.json({
        product_id: productId,
        quantity: quantity,
        tier
      });
    } catch (error) {
      console.error('Error getting tier by quantity:', error);
      res.status(500).json({ error: 'Lỗi khi lấy tầng giá' });
    }
  }

  /**
   * GET /api/pricing-tiers/product/:productId/price/:quantity
   * Tính giá cho số lượng nhất định (buyer xem giá sẽ được chứng minh)
   */
  static async calculatePrice(req, res) {
    try {
      const { productId, quantity } = req.params;

      // Lấy sản phẩm
      const productResult = await db.query(
        'SELECT id, current_price, original_price FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];
      const qty = parseInt(quantity);

      // Lấy tier nếu có
      const tier = await PricingTier.getTierByQuantity(productId, qty);

      let finalPrice = product.current_price;
      let discount = 0;
      let savings = 0;

      if (tier) {
        finalPrice = tier.tier_price;
        discount = tier.discount_percentage;
        savings = (product.current_price - finalPrice) * qty;
      }

      return res.json({
        product_id: productId,
        quantity: qty,
        price_per_unit: finalPrice,
        total_price: finalPrice * qty,
        original_price_per_unit: product.current_price,
        original_total: product.current_price * qty,
        discount_percentage: discount,
        total_savings: Math.round(savings * 100) / 100,
        tier_applied: tier ? {
          min_quantity: tier.min_quantity,
          max_quantity: tier.max_quantity,
          description: tier.description
        } : null
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      res.status(500).json({ error: 'Lỗi khi tính giá' });
    }
  }
}

export default PricingTierController;
