import db from '../config/database.js';

// Get all addresses for user
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      'SELECT * FROM delivery_addresses WHERE user_id = $1 AND is_active = TRUE ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Lỗi khi tải địa chỉ' });
  }
};

// Get default address
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      'SELECT * FROM delivery_addresses WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không có địa chỉ mặc định' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({ error: 'Lỗi khi tải địa chỉ mặc định' });
  }
};

// Create new address
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      label,
      full_name,
      phone_number,
      street_address,
      ward,
      district,
      city,
      postal_code,
      is_default
    } = req.body;

    // Validate required fields
    if (!label || !full_name || !phone_number || !street_address || !district || !city) {
      return res.status(400).json({ error: 'Vui lòng điền các trường bắt buộc' });
    }

    // Check if label already exists for user
    const labelCheck = await db.query(
      'SELECT id FROM delivery_addresses WHERE user_id = $1 AND label = $2',
      [userId, label]
    );

    if (labelCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Nhãn địa chỉ đã tồn tại' });
    }

    // If this is the first address or marked as default, set as default
    const shouldSetAsDefault = is_default === true || (await db.query(
      'SELECT COUNT(*) FROM delivery_addresses WHERE user_id = $1 AND is_active = TRUE',
      [userId]
    )).rows[0].count === '0';

    // If setting as default, unset other defaults
    if (shouldSetAsDefault) {
      await db.query(
        'UPDATE delivery_addresses SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const result = await db.query(
      `INSERT INTO delivery_addresses 
       (user_id, label, full_name, phone_number, street_address, ward, district, city, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, label, full_name, phone_number, street_address, ward, district, city, postal_code, shouldSetAsDefault]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: 'Lỗi khi tạo địa chỉ' });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const {
      label,
      full_name,
      phone_number,
      street_address,
      ward,
      district,
      city,
      postal_code,
      is_default
    } = req.body;

    // Check if address exists and belongs to user
    const addressCheck = await db.query(
      'SELECT * FROM delivery_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Địa chỉ không tồn tại' });
    }

    // Check if new label is already used by another address
    if (label && label !== addressCheck.rows[0].label) {
      const labelCheck = await db.query(
        'SELECT id FROM delivery_addresses WHERE user_id = $1 AND label = $2 AND id != $3',
        [userId, label, id]
      );

      if (labelCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Nhãn địa chỉ đã tồn tại' });
      }
    }

    // If setting as default, unset other defaults
    if (is_default === true) {
      await db.query(
        'UPDATE delivery_addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2',
        [userId, id]
      );
    }

    const result = await db.query(
      `UPDATE delivery_addresses 
       SET label = COALESCE($1, label),
           full_name = COALESCE($2, full_name),
           phone_number = COALESCE($3, phone_number),
           street_address = COALESCE($4, street_address),
           ward = COALESCE($5, ward),
           district = COALESCE($6, district),
           city = COALESCE($7, city),
           postal_code = COALESCE($8, postal_code),
           is_default = COALESCE($9, is_default),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [label, full_name, phone_number, street_address, ward, district, city, postal_code, is_default, id, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật địa chỉ' });
  }
};

// Delete address (soft delete)
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if address exists
    const addressCheck = await db.query(
      'SELECT is_default FROM delivery_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Địa chỉ không tồn tại' });
    }

    // Soft delete
    await db.query(
      'UPDATE delivery_addresses SET is_active = FALSE WHERE id = $1',
      [id]
    );

    // If this was the default, set another as default
    if (addressCheck.rows[0].is_default) {
      const newDefault = await db.query(
        'SELECT id FROM delivery_addresses WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at LIMIT 1',
        [userId]
      );

      if (newDefault.rows.length > 0) {
        await db.query(
          'UPDATE delivery_addresses SET is_default = TRUE WHERE id = $1',
          [newDefault.rows[0].id]
        );
      }
    }

    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Lỗi khi xóa địa chỉ' });
  }
};

// Set address as default
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if address exists
    const addressCheck = await db.query(
      'SELECT id FROM delivery_addresses WHERE id = $1 AND user_id = $2 AND is_active = TRUE',
      [id, userId]
    );

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Địa chỉ không tồn tại' });
    }

    // Unset all defaults for user
    await db.query(
      'UPDATE delivery_addresses SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );

    // Set this as default
    const result = await db.query(
      'UPDATE delivery_addresses SET is_default = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ error: 'Lỗi khi đặt địa chỉ mặc định' });
  }
};

// Get delivery methods
export const getDeliveryMethods = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM delivery_methods WHERE is_active = TRUE ORDER BY base_price DESC'
    );

    // Ensure numeric values are numbers
    const methods = result.rows.map(method => ({
      ...method,
      base_price: Number(method.base_price) || 0
    }));

    res.json(methods);
  } catch (error) {
    console.error('Error fetching delivery methods:', error);
    res.status(500).json({ error: 'Lỗi khi tải phương thức giao hàng' });
  }
};
