import Rating from '../models/Rating.js';
import pool from '../config/database.js';

// Validation helpers
const validateRating = (rating) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      valid: false,
      message: 'Đánh giá phải từ 1 đến 5 sao'
    };
  }
  return { valid: true };
};

// Tạo đánh giá mới
export const createRating = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;
    const buyer_id = req.user.userId; // ✅ Thay id → userId

    // Validation
    if (!product_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID và rating là bắt buộc'
      });
    }

    const ratingValidation = validateRating(rating);
    if (!ratingValidation.valid) {
      return res.status(400).json({
        success: false,
        message: ratingValidation.message
      });
    }

    // Kiểm tra người dùng tồn tại (không cần check user_type)
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [buyer_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Allow multiple ratings per user - no duplicate check needed
    console.log('✅ [ratingController] Multiple ratings allowed - Product:', product_id, 'Buyer:', buyer_id);

    // Kiểm tra verified purchase (nếu có order_id)
    let isVerifiedPurchase = false;
    if (order_id) {
      const orderCheck = await pool.query(
        `SELECT id FROM orders 
         WHERE id = $1 AND buyer_id = $2 AND status IN ('delivered', 'completed')`,
        [order_id, buyer_id]
      );
      isVerifiedPurchase = orderCheck.rows.length > 0;
    }

    // Tạo rating
    const newRating = await Rating.create({
      product_id,
      buyer_id,
      order_id: order_id || null,
      rating,
      comment: comment || null,
      is_verified_purchase: isVerifiedPurchase
    });

    return res.status(201).json({
      success: true,
      message: 'Đánh giá đã được tạo thành công',
      data: newRating
    });
  } catch (error) {
    console.error('❌ Error in createRating:', error);
    
    
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy danh sách đánh giá của sản phẩm
export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0, sort = 'newest' } = req.query;

    // Kiểm tra sản phẩm tồn tại
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Lấy đánh giá
    const ratings = await Rating.getByProductId(
      productId,
      parseInt(limit),
      parseInt(offset)
    );

    // Lấy thống kê
    const stats = await Rating.getRatingStats(productId);

    return res.status(200).json({
      success: true,
      data: {
        ratings,
        stats,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: parseInt(stats.total_ratings)
        }
      }
    });
  } catch (error) {
    console.error('Error in getProductRatings:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy thống kê đánh giá của sản phẩm
export const getRatingStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm tồn tại
    const productCheck = await pool.query(
      'SELECT average_rating, rating_count FROM products WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    const stats = await Rating.getRatingStats(productId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getRatingStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Cập nhật đánh giá
export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Kiểm tra rating tồn tại
    const ratingCheck = await pool.query(
      'SELECT buyer_id, product_id FROM product_ratings WHERE id = $1',
      [ratingId]
    );

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đánh giá không tồn tại'
      });
    }

    // Kiểm tra quyền (chỉ chủ sở hữu rating mới được cập nhật)
    if (ratingCheck.rows[0].buyer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đánh giá này'
      });
    }

    // Validation
    if (rating) {
      const ratingValidation = validateRating(rating);
      if (!ratingValidation.valid) {
        return res.status(400).json({
          success: false,
          message: ratingValidation.message
        });
      }
    }

    // Cập nhật
    const updatedRating = await Rating.update(ratingId, { rating, comment });

    return res.status(200).json({
      success: true,
      message: 'Đánh giá đã được cập nhật',
      data: updatedRating
    });
  } catch (error) {
    console.error('Error in updateRating:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Xóa đánh giá
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.userId;

    // Kiểm tra rating tồn tại
    const ratingCheck = await pool.query(
      'SELECT buyer_id FROM product_ratings WHERE id = $1',
      [ratingId]
    );

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đánh giá không tồn tại'
      });
    }

    // Kiểm tra quyền
    if (ratingCheck.rows[0].buyer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này'
      });
    }

    // Xóa
    await Rating.delete(ratingId);

    return res.status(200).json({
      success: true,
      message: 'Đánh giá đã được xóa'
    });
  } catch (error) {
    console.error('Error in deleteRating:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Đánh dấu đánh giá hữu ích
export const markRatingHelpful = async (req, res) => {
  try {
    const { ratingId } = req.params;

    // Kiểm tra rating tồn tại
    const ratingCheck = await pool.query(
      'SELECT id FROM product_ratings WHERE id = $1',
      [ratingId]
    );

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đánh giá không tồn tại'
      });
    }

    // Đánh dấu hữu ích
    const updatedRating = await Rating.markHelpful(ratingId);

    return res.status(200).json({
      success: true,
      message: 'Cảm ơn bạn',
      data: updatedRating
    });
  } catch (error) {
    console.error('Error in markRatingHelpful:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy rating của người dùng cho sản phẩm
export const getUserProductRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Cần đăng nhập'
      });
    }

    const rating = await Rating.getUserProductRating(productId, userId);

    return res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Error in getUserProductRating:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
