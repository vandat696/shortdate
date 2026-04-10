import pool from '../config/database.js';

export default class Rating {
  // Tạo đánh giá mới
  static async create(ratingData) {
    const {
      product_id,
      buyer_id,
      order_id,
      rating,
      comment,
      is_verified_purchase = false
    } = ratingData;

    try {
      const query = `
        INSERT INTO product_ratings (
          product_id, buyer_id, order_id, rating, comment, is_verified_purchase
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;

      const result = await pool.query(query, [
        product_id,
        buyer_id,
        order_id,
        rating,
        comment,
        is_verified_purchase
      ]);

      // Cập nhật average_rating và rating_count của sản phẩm
      await this.updateProductRatingStats(product_id);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating rating: ${error.message}`);
    }
  }

  // Lấy tất cả rating của sản phẩm
  static async getByProductId(productId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT 
          pr.id,
          pr.product_id,
          pr.buyer_id,
          pr.order_id,
          pr.rating,
          pr.comment,
          pr.is_verified_purchase,
          pr.helpful_count,
          pr.created_at,
          pr.updated_at,
          u.first_name,
          u.last_name,
          u.avatar_url
        FROM product_ratings pr
        JOIN users u ON pr.buyer_id = u.id
        WHERE pr.product_id = $1
        ORDER BY pr.created_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const result = await pool.query(query, [productId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching ratings: ${error.message}`);
    }
  }

  // Lấy rating count của sản phẩm
  static async getRatingStats(productId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as "5_star",
          COUNT(CASE WHEN rating = 4 THEN 1 END) as "4_star",
          COUNT(CASE WHEN rating = 3 THEN 1 END) as "3_star",
          COUNT(CASE WHEN rating = 2 THEN 1 END) as "2_star",
          COUNT(CASE WHEN rating = 1 THEN 1 END) as "1_star"
        FROM product_ratings
        WHERE product_id = $1;
      `;

      const result = await pool.query(query, [productId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching rating stats: ${error.message}`);
    }
  }

  // Cập nhật average_rating và rating_count của sản phẩm
  static async updateProductRatingStats(productId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as rating_count,
          ROUND(AVG(rating)::numeric, 2) as average_rating
        FROM product_ratings
        WHERE product_id = $1;
      `;

      const statsResult = await pool.query(statsQuery, [productId]);
      const { rating_count, average_rating } = statsResult.rows[0];
      
      console.log('💾 [Rating.updateProductRatingStats] Stats - rating_count:', rating_count, 'average_rating:', average_rating, 'Type:', typeof average_rating);

      // Convert average_rating to float to avoid type issues
      const avgRatingFloat = average_rating ? parseFloat(average_rating) : 0;
      
      console.log('💾 [Rating.updateProductRatingStats] Converted average_rating:', avgRatingFloat, 'Type:', typeof avgRatingFloat);

      const updateQuery = `
        UPDATE products
        SET average_rating = COALESCE($1::decimal(3,2), 0),
            rating_count = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
      `;

      const result = await pool.query(updateQuery, [avgRatingFloat, parseInt(rating_count), productId]);
      console.log('💾 [Rating.updateProductRatingStats] Update result:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('💾 [Rating.updateProductRatingStats] Error:', error);
      throw new Error(`Error updating rating stats: ${error.message}`);
    }
  }

  // Cập nhật đánh giá
  static async update(ratingId, updateData) {
    const { rating, comment } = updateData;

    try {
      const query = `
        UPDATE product_ratings
        SET rating = COALESCE($1, rating),
            comment = COALESCE($2, comment),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
      `;

      const result = await pool.query(query, [rating, comment, ratingId]);
      
      if (result.rows.length > 0) {
        // Cập nhật stats của sản phẩm
        await this.updateProductRatingStats(result.rows[0].product_id);
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating rating: ${error.message}`);
    }
  }

  // Xóa đánh giá
  static async delete(ratingId) {
    try {
      const query = `
        SELECT product_id FROM product_ratings WHERE id = $1;
      `;
      const ratingResult = await pool.query(query, [ratingId]);

      if (ratingResult.rows.length === 0) {
        throw new Error('Rating not found');
      }

      const productId = ratingResult.rows[0].product_id;

      const deleteQuery = `
        DELETE FROM product_ratings WHERE id = $1 RETURNING *;
      `;

      const result = await pool.query(deleteQuery, [ratingId]);

      // Cập nhật stats của sản phẩm
      await this.updateProductRatingStats(productId);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting rating: ${error.message}`);
    }
  }

  // Lấy rating của người dùng cho sản phẩm
  static async getUserProductRating(productId, buyerId) {
    try {
      const query = `
        SELECT * FROM product_ratings
        WHERE product_id = $1 AND buyer_id = $2;
      `;

      console.log('💾 [Rating.getUserProductRating] Query - Product:', productId, 'Buyer:', buyerId);
      const result = await pool.query(query, [productId, buyerId]);
      console.log('💾 [Rating.getUserProductRating] Result:', result.rows);
      return result.rows[0] || null;
    } catch (error) {
      console.error('💾 [Rating.getUserProductRating] Error:', error);
      throw new Error(`Error fetching user rating: ${error.message}`);
    }
  }

  // Tăng helpful_count
  static async markHelpful(ratingId) {
    try {
      const query = `
        UPDATE product_ratings
        SET helpful_count = helpful_count + 1
        WHERE id = $1
        RETURNING *;
      `;

      const result = await pool.query(query, [ratingId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking rating helpful: ${error.message}`);
    }
  }
}
