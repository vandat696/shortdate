import Category from '../models/Category.js';

// LẤY DANH SÁCH CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    res.status(200).json(categories);
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({
      error: 'Lấy danh sách danh mục thất bại',
      message: err.message
    });
  }
};

// THÊM CATEGORY MỚI (ADMIN)
export const createCategory = async (req, res) => {
  try {
    const { userType } = req.user;

    // Chỉ Admin có thể thêm category
    if (userType !== 'admin') {
      return res.status(403).json({ 
        error: 'Chỉ Admin có thể thêm danh mục' 
      });
    }

    const { name, description, icon, display_order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Tên danh mục là bắt buộc' 
      });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || '',
      display_order: display_order || 0
    });

    res.status(201).json({
      data: {
        success: true,
        category: newCategory
      }
    });
  } catch (err) {
    console.error('Create category error:', err.message);
    
    // Check for unique constraint violation
    if (err.code === '23505') {
      return res.status(400).json({
        error: 'Danh mục này đã tồn tại'
      });
    }

    res.status(500).json({
      error: 'Thêm danh mục thất bại',
      message: err.message
    });
  }
};

// CẬP NHẬT CATEGORY (ADMIN)
export const updateCategory = async (req, res) => {
  try {
    const { userType } = req.user;

    if (userType !== 'admin') {
      return res.status(403).json({ 
        error: 'Chỉ Admin có thể cập nhật danh mục' 
      });
    }

    const { id } = req.params;
    const { name, description, icon, display_order, is_active } = req.body;

    const updatedCategory = await Category.update(id, {
      name,
      description,
      icon,
      display_order,
      is_active
    });

    if (!updatedCategory) {
      return res.status(404).json({ 
        error: 'Danh mục không tồn tại' 
      });
    }

    res.status(200).json({
      data: {
        success: true,
        category: updatedCategory
      }
    });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({
      error: 'Cập nhật danh mục thất bại',
      message: err.message
    });
  }
};

// XÓA CATEGORY (ADMIN)
export const deleteCategory = async (req, res) => {
  try {
    const { userType } = req.user;

    if (userType !== 'admin') {
      return res.status(403).json({ 
        error: 'Chỉ Admin có thể xóa danh mục' 
      });
    }

    const { id } = req.params;

    const deletedCategory = await Category.delete(id);

    if (!deletedCategory) {
      return res.status(404).json({ 
        error: 'Danh mục không tồn tại' 
      });
    }

    res.status(200).json({
      data: {
        success: true,
        message: 'Danh mục đã được xóa'
      }
    });
  } catch (err) {
    console.error('Delete category error:', err.message);
    res.status(500).json({
      error: 'Xóa danh mục thất bại',
      message: err.message
    });
  }
};

// LẤY CATEGORIES CỦA SẢN PHẨM
export const getProductCategories = async (req, res) => {
  try {
    const { productId } = req.params;

    const categories = await Category.getProductCategories(productId);

    res.status(200).json({
      data: {
        success: true,
        categories
      }
    });
  } catch (err) {
    console.error('Get product categories error:', err.message);
    res.status(500).json({
      error: 'Lấy danh mục sản phẩm thất bại',
      message: err.message
    });
  }
};
