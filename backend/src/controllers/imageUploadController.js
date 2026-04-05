import { supabase } from '../config/supabase.js';
import db from '../config/database.js';

class ImageUploadController {
  /**
   * POST /api/products/:productId/upload-images
   * Upload up to 4 images for a product
   * Files: multipart/form-data with field name "images"
   */
  static async uploadProductImages(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Verify product exists and belongs to user
      const productResult = await db.query(
        `SELECT id, supplier_id FROM products WHERE id = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }

      const product = productResult.rows[0];

      // Check authorization
      if (product.supplier_id !== userId) {
        return res.status(403).json({ error: 'Không có quyền cập nhật sản phẩm này' });
      }

      // Check if files uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Vui lòng chọn ít nhất 1 ảnh' });
      }

      // Validate max 4 files
      if (req.files.length > 4) {
        return res.status(400).json({ error: 'Tối đa 4 ảnh cho mỗi sản phẩm' });
      }

      // Get existing images count
      const existingResult = await db.query(
        `SELECT COUNT(*) as count FROM product_images WHERE product_id = $1`,
        [productId]
      );

      const existingCount = parseInt(existingResult.rows[0].count);

      // Check if adding new images exceeds limit
      if (existingCount + req.files.length > 4) {
        return res.status(400).json({
          error: `Sản phẩm đã có ${existingCount} ảnh, chỉ có thể thêm ${4 - existingCount} ảnh nữa`
        });
      }

      const uploadedImages = [];
      let nextPosition = existingCount + 1;

      // Save each file to Supabase
      for (const file of req.files) {
        try {
          // Generate unique filename
          const fileExt = file.originalname.split('.').pop();
          const fileName = `product-${productId}-${nextPosition}-${Date.now()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('products')
            .upload(filePath, file.buffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.mimetype
            });

          if (error) {
            console.error('Supabase upload error:', error);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          // Save to database with Supabase URL
          const imageResult = await db.query(
            `INSERT INTO product_images (product_id, image_url, position)
             VALUES ($1, $2, $3)
             RETURNING id, image_url, position`,
            [productId, publicUrl, nextPosition]
          );

          uploadedImages.push(imageResult.rows[0]);
          nextPosition++;
        } catch (error) {
          console.error('Error saving image:', error);
          continue;
        }
      }

      // Update main product image if first upload
      if (existingCount === 0 && uploadedImages.length > 0) {
        await db.query(
          `UPDATE products SET image_url = $1 WHERE id = $2`,
          [uploadedImages[0].image_url, productId]
        );
      }

      return res.json({
        success: true,
        message: `Đã tải lên ${uploadedImages.length} ảnh`,
        images: uploadedImages
      });
    } catch (error) {
      console.error('[uploadProductImages] Error:', error);
      res.status(500).json({
        error: 'Lỗi khi tải ảnh',
        details: error.message
      });
    }
  }

  /**
   * GET /api/products/:productId/images
   * Get all images for a product
   */
  static async getProductImages(req, res) {
    try {
      const { productId } = req.params;

      const result = await db.query(
        `SELECT id, product_id, image_url, position, uploaded_at
         FROM product_images
         WHERE product_id = $1
         ORDER BY position ASC`,
        [productId]
      );

      return res.json({
        success: true,
        images: result.rows
      });
    } catch (error) {
      console.error('[getProductImages] Error:', error);
      res.status(500).json({ error: 'Lỗi khi lấy ảnh', details: error.message });
    }
  }

  /**
   * DELETE /api/products/:productId/images/:imageId
   * Delete a specific image
   */
  static async deleteProductImage(req, res) {
    try {
      const { productId, imageId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Verify product belongs to user
      const productResult = await db.query(
        `SELECT supplier_id FROM products WHERE id = $1`,
        [productId]
      );

      if (productResult.rows.length === 0 || productResult.rows[0].supplier_id !== userId) {
        return res.status(403).json({ error: 'Không có quyền xóa ảnh này' });
      }

      // Get image info
      const imageResult = await db.query(
        `SELECT image_url, position FROM product_images WHERE id = $1 AND product_id = $2`,
        [imageId, productId]
      );

      if (imageResult.rows.length === 0) {
        return res.status(404).json({ error: 'Ảnh không tồn tại' });
      }

      const image = imageResult.rows[0];

      // Delete file from Supabase Storage
      try {
        // Extract file path from URL
        const filePath = image.image_url.split('/products/')[1];
        if (filePath) {
          await supabase.storage
            .from('products')
            .remove([`products/${filePath}`]);
        }
      } catch (error) {
        console.error('Error deleting file from Supabase:', error);
      }

      // Delete from database
      await db.query(
        `DELETE FROM product_images WHERE id = $1`,
        [imageId]
      );

      // Shift positions
      await db.query(
        `UPDATE product_images 
         SET position = position - 1
         WHERE product_id = $1 AND position > $2`,
        [productId, image.position]
      );

      return res.json({
        success: true,
        message: 'Đã xóa ảnh'
      });
    } catch (error) {
      console.error('[deleteProductImage] Error:', error);
      res.status(500).json({ error: 'Lỗi khi xóa ảnh', details: error.message });
    }
  }
}

export default ImageUploadController;
