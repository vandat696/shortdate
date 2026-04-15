import db from '../config/database.js';

export default class PricingTier {
  /**
   * Tạo tier giá mới cho sản phẩm
   * @param {Object} tierData
   * @returns {Promise<Object>} Tier vừa tạo
   */
  static async create(tierData) {
    const {
      product_id,
      min_quantity,
      max_quantity = null,
      tier_price,
      discount_percentage = 0,
      description
    } = tierData;

    const query = `
      INSERT INTO pricing_tiers (
        product_id, min_quantity, max_quantity, tier_price,
        discount_percentage, description, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *;
    `;

    const result = await db.query(query, [
      product_id,
      min_quantity,
      max_quantity,
      tier_price,
      discount_percentage,
      description
    ]);

    return result.rows[0];
  }

  /**
   * Lấy tất cả tiers của một sản phẩm (sắp xếp theo min_quantity)
   * @param {number} product_id
   * @returns {Promise<Array>}
   */
  static async findByProduct(product_id) {
    const query = `
      SELECT *
      FROM pricing_tiers
      WHERE product_id = $1 AND is_active = true
      ORDER BY min_quantity ASC;
    `;

    const result = await db.query(query, [product_id]);
    return result.rows;
  }

  /**
   * Lấy tier phù hợp với số lượng mua
   * @param {number} product_id
   * @param {number} quantity - Số lượng người mua
   * @returns {Promise<Object|null>}
   */
  static async getTierByQuantity(product_id, quantity) {
    const query = `
      SELECT *
      FROM pricing_tiers
      WHERE product_id = $1
        AND is_active = true
        AND min_quantity <= $2
        AND (max_quantity IS NULL OR max_quantity >= $2)
      ORDER BY min_quantity DESC
      LIMIT 1;
    `;

    const result = await db.query(query, [product_id, quantity]);
    return result.rows[0] || null;
  }

  /**
   * Lấy tier theo ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const query = `
      SELECT * FROM pricing_tiers
      WHERE id = $1 AND is_active = true;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Cập nhật tier giá
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async update(id, updates) {
    const {
      min_quantity,
      max_quantity,
      tier_price,
      discount_percentage,
      description,
      is_active
    } = updates;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (min_quantity !== undefined) {
      fields.push(`min_quantity = $${paramCount++}`);
      values.push(min_quantity);
    }
    if (max_quantity !== undefined) {
      fields.push(`max_quantity = $${paramCount++}`);
      values.push(max_quantity);
    }
    if (tier_price !== undefined) {
      fields.push(`tier_price = $${paramCount++}`);
      values.push(tier_price);
    }
    if (discount_percentage !== undefined) {
      fields.push(`discount_percentage = $${paramCount++}`);
      values.push(discount_percentage);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) {
      // Only updated_at, skip update
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE pricing_tiers
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Xóa tier giá (soft delete)
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const query = `
      UPDATE pricing_tiers
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id;
    `;

    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Kiểm tra xem tier này của supplier nào (qua product)
   * @param {number} tierId
   * @param {number} supplierId
   * @returns {Promise<boolean>}
   */
  static async isOwnedBySupplier(tierId, supplierId) {
    const query = `
      SELECT pt.id
      FROM pricing_tiers pt
      JOIN products p ON pt.product_id = p.id
      WHERE pt.id = $1 AND p.supplier_id = $2;
    `;

    const result = await db.query(query, [tierId, supplierId]);
    return result.rows.length > 0;
  }

  /**
   * Lấy giá gợi ý dựa trên tier (hữu ích cho auto-pricing)
   * @param {number} product_id
   * @param {number} quantity
   * @returns {Promise<Object>} { tier_price, discount_percentage, savings }
   */
  static async calculatePrice(product_id, quantity) {
    const tier = await this.getTierByQuantity(product_id, quantity);
    
    if (!tier) {
      return null;
    }

    return {
      tier_price: tier.tier_price,
      discount_percentage: tier.discount_percentage,
      description: tier.description
    };
  }

  /**
   * Xóa tất cả tiers của sản phẩm (khi sản phẩm bị xóa)
   * @param {number} product_id
   * @returns {Promise<number>} Số tiers bị xóa
   */
  static async deleteByProduct(product_id) {
    const query = `
      UPDATE pricing_tiers
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      RETURNING id;
    `;

    const result = await db.query(query, [product_id]);
    return result.rows.length;
  }
}
