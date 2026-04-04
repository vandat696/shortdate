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
      contact_email,
      latitude,
      longitude,
      supplier_address
    } = supplierData;

    const query = `
      INSERT INTO supplier_details (
        user_id, company_name, tax_id, warehouse_address,
        contact_phone, contact_email, latitude, longitude, supplier_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      user_id,
      company_name || '',
      tax_id || '',
      warehouse_address || '',
      contact_phone || '',
      contact_email || '',
      latitude || null,
      longitude || null,
      supplier_address || null
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

  // Cập nhật vị trí của supplier (latitude, longitude, supplier_address)
  static async updateLocation(user_id, locationData) {
    const { latitude, longitude, address } = locationData;
    
    const query = `
      UPDATE supplier_details
      SET latitude = $1,
          longitude = $2,
          supplier_address = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING user_id, company_name, latitude, longitude, supplier_address;
    `;

    const result = await pool.query(query, [latitude, longitude, address, user_id]);
    return result.rows[0];
  }

  // Lấy vị trí của supplier
  static async getLocation(user_id) {
    const query = 'SELECT user_id, company_name, latitude, longitude, supplier_address FROM supplier_details WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }
}
