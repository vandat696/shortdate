import { supabase } from '../config/supabase.js';
import db from '../config/database.js';

class AvatarUploadController {
  /**
   * POST /api/auth/avatar/upload
   * Upload user avatar
   * File: multipart/form-data with field name "avatar"
   */
  static async uploadAvatar(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Check if file uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn ảnh' });
      }

      const file = req.file;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Ảnh không được vượt quá 5MB' });
      }

      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP' });
      }

      // Generate unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `user-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file.buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.mimetype
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Lỗi upload ảnh', details: error.message });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user avatar_url in database
      const updateResult = await db.query(
        `UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, avatar_url`,
        [publicUrl, userId]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy user' });
      }

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatar_url: publicUrl,
        user: updateResult.rows[0]
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ error: 'Upload failed', message: error.message });
    }
  }

  /**
   * DELETE /api/auth/avatar
   * Delete user avatar
   */
  static async deleteAvatar(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
      }

      // Get current user
      const userResult = await db.query(
        `SELECT avatar_url FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy user' });
      }

      const user = userResult.rows[0];

      // Delete from Supabase if exists
      if (user.avatar_url) {
        // Extract file path from URL
        const filePath = user.avatar_url.split('/avatars/')[1];
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${filePath}`]);
        }
      }

      // Clear avatar_url in database
      await db.query(
        `UPDATE users SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId]
      );

      res.status(200).json({
        message: 'Avatar deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      res.status(500).json({ error: 'Delete failed', message: error.message });
    }
  }
}

export default AvatarUploadController;
