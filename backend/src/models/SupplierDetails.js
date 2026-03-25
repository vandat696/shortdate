import pool from '../config/database.js';

export default class SupplierDetails {
  // Lấy thông tin supplier
  static async findByUserId(user_id) {
    const query = 'SELECT * FROM supplier_details WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);
    return result.rows[0] || null;
  }

  // Tạo thông tin supplier
  static async create(supplierData) {
    const {
      user_id,
      company_name,
      tax_id,
      warehouse_address,
      contact_phone,
      contact_email
    } = supplierData;

    const query = `
      INSERT INTO supplier_details (
        user_id, company_name, tax_id, warehouse_address,
        contact_phone, contact_email
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      user_id,
      company_name,
      tax_id,
      warehouse_address,
      contact_phone,
      contact_email
    ]);

    return result.rows[0];
  }

  // Cập nhật thông tin supplier
  static async update(user_id, supplierData) {
    const {
      company_name,
      tax_id,
      warehouse_address,
      contact_phone,
      contact_email,
      description,
      banner_url
    } = supplierData;

    const query = `
      UPDATE supplier_details
      SET company_name = COALESCE($1, company_name),
          tax_id = COALESCE($2, tax_id),
          warehouse_address = COALESCE($3, warehouse_address),
          contact_phone = COALESCE($4, contact_phone),
          contact_email = COALESCE($5, contact_email),
          description = COALESCE($6, description),
          banner_url = COALESCE($7, banner_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $8
      RETURNING *;
    `;

    const result = await pool.query(query, [
      company_name,
      tax_id,
      warehouse_address,
      contact_phone,
      contact_email,
      description,
      banner_url,
      user_id
    ]);

    return result.rows[0];
  }

  // Xóa thông tin supplier
  static async delete(user_id) {
    const query = 'DELETE FROM supplier_details WHERE user_id = $1';
    await pool.query(query, [user_id]);
  }
}
