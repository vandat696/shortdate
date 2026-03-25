import pool from '../config/database.js';

class User {
  // Lấy user theo email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Lấy user theo ID
  static async findById(id) {
    const query = 'SELECT id, email, phone, user_type, first_name, last_name, is_verified, is_active, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Tạo user mới
  static async create(email, passwordHash, userType = 'buyer', phone = null) {
    const query = `
      INSERT INTO users (email, phone, password_hash, user_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, user_type, created_at
    `;
    const result = await pool.query(query, [email, phone, passwordHash, userType]);
    return result.rows[0];
  }

  // Cập nhật mật khẩu
  static async updatePassword(id, passwordHash) {
    const query = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id';
    const result = await pool.query(query, [passwordHash, id]);
    return result.rows[0];
  }

  // Xác minh email
  static async verifyEmail(id) {
    const query = 'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Ghi lại lần login sai
  static async incrementFailedLogin(id) {
    const query = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1
      WHERE id = $1 
      RETURNING failed_login_attempts
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Khóa tài khoản tạm thời
  static async lockAccount(id, minutes = 15) {
    const lockUntil = new Date(Date.now() + minutes * 60000);
    const query = `
      UPDATE users 
      SET locked_until = $1, failed_login_attempts = 0
      WHERE id = $2 
      RETURNING id
    `;
    const result = await pool.query(query, [lockUntil, id]);
    return result.rows[0];
  }

  // Mở khóa tài khoản
  static async unlockAccount(id) {
    const query = `
      UPDATE users 
      SET locked_until = null, failed_login_attempts = 0
      WHERE id = $1 
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Kiểm tra tài khoản có bị khóa không
  static async isAccountLocked(id) {
    const user = await this.findById(id);
    if (!user) return false;
    
    const query = 'SELECT locked_until FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    const userData = result.rows[0];
    
    if (!userData.locked_until) return false;
    if (new Date() > new Date(userData.locked_until)) {
      this.unlockAccount(id);
      return false;
    }
    return true;
  }

  // Cập nhật profile
  static async updateProfile(id, profileData) {
    const { first_name, last_name, phone, avatar_url } = profileData;
    
    const query = `
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 
      RETURNING id, email, first_name, last_name, phone, avatar_url, user_type
    `;
    
    const result = await pool.query(query, [first_name, last_name, phone, avatar_url, id]);
    return result.rows[0];
  }

  // Lấy user với supplier info (nếu là supplier)
  static async findByIdWithSupplierInfo(id) {
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [id]);
    
    if (!userResult.rows.length) return null;
    
    const user = userResult.rows[0];
    let supplierInfo = null;

    if (user.user_type === 'supplier') {
      const supplierQuery = 'SELECT * FROM supplier_details WHERE user_id = $1';
      const supplierResult = await pool.query(supplierQuery, [id]);
      supplierInfo = supplierResult.rows[0] || null;
    }

    return { user, supplierInfo };
  }
}

export default User;
