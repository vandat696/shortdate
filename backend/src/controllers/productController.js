import Product from '../models/Product.js';

// Validation helpers
const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  return missing;
};

const validateProductType = (type) => {
  return ['dry_product', 'fresh_product'].includes(type);
};

const validateHSD = (product_type, expiry_date) => {
  const today = new Date();
  const expiryDate = new Date(expiry_date);
  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  if (product_type === 'dry_product') {
    // Dry_Product: 30-90 ngày
    if (daysLeft < 30 || daysLeft > 90) {
      return {
        valid: false,
        message: `Dry_Product phải có HSD từ 30-90 ngày. HSD hiện tại: ${daysLeft} ngày`
      };
    }
  } else if (product_type === 'fresh_product') {
    // Fresh_Product: 0-1 ngày
    if (daysLeft < 0 || daysLeft > 1) {
      return {
        valid: false,
        message: `Fresh_Product phải có HSD từ 0-1 ngày. HSD hiện tại: ${daysLeft} ngày`
      };
    }
  }

  return { valid: true };
};

const validatePrices = (original_price, current_price, min_floor_price) => {
  if (current_price > original_price) {
    return {
      valid: false,
      message: 'Giá bán không được cao hơn giá gốc'
    };
  }

  if (min_floor_price && current_price < min_floor_price) {
    return {
      valid: false,
      message: 'Giá bán không được thấp hơn giá sàn tối thiểu'
    };
  }

  return { valid: true };
};

// THÊM SẢN PHẨM MỚI
export const createProduct = async (req, res) => {
  try {
    const { userId: supplier_id, userType } = req.user;

    // Chỉ Supplier có thể thêm sản phẩm
    if (userType !== 'supplier') {
      return res.status(403).json({ error: 'Chỉ Supplier có thể thêm sản phẩm' });
    }

    const {
      name,
      description,
      category,
      product_type, // 'dry_product' hoặc 'fresh_product'
      original_price,
      current_price,
      min_floor_price,
      stock_quantity,
      min_stock_threshold,
      expiry_date,
      image_url,
      auto_pricing_enabled = true
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'name', 'category', 'product_type',
      'original_price', 'current_price',
      'stock_quantity', 'expiry_date'
    ];

    const missing = validateRequiredFields(req.body, requiredFields);
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Các trường bắt buộc còn thiếu',
        missing_fields: missing
      });
    }

    // Validate product_type
    if (!validateProductType(product_type)) {
      return res.status(400).json({
        error: 'Loại sản phẩm không hợp lệ. Sử dụng: dry_product hoặc fresh_product'
      });
    }

    // Validate HSD theo loại sản phẩm
    const hsdValidation = validateHSD(product_type, expiry_date);
    if (!hsdValidation.valid) {
      return res.status(400).json({
        error: hsdValidation.message
      });
    }

    // Validate giá
    const priceValidation = validatePrices(original_price, current_price, min_floor_price);
    if (!priceValidation.valid) {
      return res.status(400).json({
        error: priceValidation.message
      });
    }

    // Tính discount %
    const discountPercentage = Math.round(
      ((original_price - current_price) / original_price) * 100
    );

    // Tạo sản phẩm
    const newProduct = await Product.create({
      supplier_id,
      name,
      description,
      category,
      product_type,
      original_price: parseFloat(original_price),
      current_price: parseFloat(current_price),
      min_floor_price: min_floor_price ? parseFloat(min_floor_price) : null,
      stock_quantity: parseInt(stock_quantity),
      min_stock_threshold: min_stock_threshold ? parseInt(min_stock_threshold) : null,
      expiry_date,
      image_url,
      auto_pricing_enabled
    });

    // Cập nhật discount percentage
    await Product.update(newProduct.id, {
      discount_percentage: discountPercentage
    });

    res.status(201).json({
      message: 'Sản phẩm được thêm thành công',
      product: {
        ...newProduct,
        discount_percentage: discountPercentage
      }
    });
  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({
      error: 'Thêm sản phẩm thất bại',
      message: err.message
    });
  }
};

// LẤY CHI TIẾT SẢN PHẨM
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({
      error: 'Lấy sản phẩm thất bại',
      message: err.message
    });
  }
};

// LẤY DANH SÁCH SẢN PHẨM CỦA SUPPLIER
export const getSupplierProducts = async (req, res) => {
  try {
    const { userId: supplier_id, userType } = req.user;

    // Chỉ Supplier hoặc Admin có thể xem sản phẩm của supplier
    if (userType !== 'supplier' && userType !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    const filters = {
      expiring_soon: req.query.expiring_soon === 'true',
      low_stock: req.query.low_stock === 'true'
    };

    const products = await Product.findBySupplier(supplier_id, filters);

    res.status(200).json({
      total: products.length,
      products
    });
  } catch (err) {
    console.error('Get supplier products error:', err.message);
    res.status(500).json({
      error: 'Lấy danh sách sản phẩm thất bại',
      message: err.message
    });
  }
};

// LẤY DANH SÁCH SẢN PHẨM (cho Buyer - tìm kiếm & lọc)
export const getAllProducts = async (req, res) => {
  try {
    const filters = {
      product_type: req.query.product_type,
      category: req.query.category,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      min_days_left: req.query.min_days_left ? parseInt(req.query.min_days_left) : null,
      max_days_left: req.query.max_days_left ? parseInt(req.query.max_days_left) : null,
      min_discount: req.query.min_discount ? parseInt(req.query.min_discount) : null,
      sort: req.query.sort || 'created_at',
      order: req.query.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    // Loại bỏ các giá trị null
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    const products = await Product.findAll(filters);

    res.status(200).json({
      total: products.length,
      offset: filters.offset || 0,
      limit: filters.limit || 20,
      products
    });
  } catch (err) {
    console.error('Get all products error:', err.message);
    res.status(500).json({
      error: 'Lấy danh sách sản phẩm thất bại',
      message: err.message
    });
  }
};

// CẬP NHẬT SẢN PHẨM
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: user_id, userType: user_type } = req.user;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Chỉ Supplier chủ sở hữu hoặc Admin có thể cập nhật
    if (product.supplier_id !== user_id && user_type !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền cập nhật sản phẩm này' });
    }

    const updateData = {};

    // Cập nhật các trường được phép
    const allowedFields = [
      'name', 'description', 'category', 'product_type',
      'original_price', 'current_price', 'min_floor_price',
      'stock_quantity', 'min_stock_threshold', 'expiry_date',
      'image_url', 'auto_pricing_enabled'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validate HSD nếu product_type được thay đổi
    if (updateData.product_type || updateData.expiry_date) {
      const productType = updateData.product_type || product.product_type;
      const expiryDate = updateData.expiry_date || product.expiry_date;
      const hsdValidation = validateHSD(productType, expiryDate);
      if (!hsdValidation.valid) {
        return res.status(400).json({ error: hsdValidation.message });
      }
    }

    // Validate giá nếu được thay đổi
    if (updateData.original_price || updateData.current_price || updateData.min_floor_price) {
      const original = updateData.original_price || product.original_price;
      const current = updateData.current_price || product.current_price;
      const floor = updateData.min_floor_price || product.min_floor_price;
      const priceValidation = validatePrices(original, current, floor);
      if (!priceValidation.valid) {
        return res.status(400).json({ error: priceValidation.message });
      }
    }

    const updatedProduct = await Product.update(id, updateData);

    // Tính lại discount percentage
    if (updateData.original_price || updateData.current_price) {
      const discountPercentage = Math.round(
        ((updatedProduct.original_price - updatedProduct.current_price) / updatedProduct.original_price) * 100
      );
      await Product.update(id, { discount_percentage: discountPercentage });
    }

    res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      product: updatedProduct
    });
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({
      error: 'Cập nhật sản phẩm thất bại',
      message: err.message
    });
  }
};

// CẬP NHẬT TỒN KHO
export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_change } = req.body;
    const { userId: user_id, userType: user_type } = req.user;

    if (!quantity_change) {
      return res.status(400).json({ error: 'quantity_change là bắt buộc' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Chỉ Supplier chủ sở hữu hoặc Admin có thể cập nhật
    if (product.supplier_id !== user_id && user_type !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền cập nhật sản phẩm này' });
    }

    const updatedProduct = await Product.updateInventory(id, quantity_change);

    res.status(200).json({
      message: 'Cập nhật tồn kho thành công',
      product: updatedProduct
    });
  } catch (err) {
    console.error('Update inventory error:', err.message);
    res.status(500).json({
      error: 'Cập nhật tồn kho thất bại',
      message: err.message
    });
  }
};

// XÓA SẢN PHẨM (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: user_id, userType: user_type } = req.user;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Chỉ Supplier chủ sở hữu hoặc Admin có thể xóa
    if (product.supplier_id !== user_id && user_type !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền xóa sản phẩm này' });
    }

    await Product.delete(id);

    res.status(200).json({
      message: 'Xóa sản phẩm thành công'
    });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({
      error: 'Xóa sản phẩm thất bại',
      message: err.message
    });
  }
};

// LẤY DANH SÁCH DANH MỤC
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.getCategories();

    res.status(200).json({
      categories
    });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({
      error: 'Lấy danh sách danh mục thất bại',
      message: err.message
    });
  }
};

// LẤY SẢN PHẨM SẮP HẾT HẠN (cảnh báo)
export const getExpiringProducts = async (req, res) => {
  try {
    const { userId: supplier_id, userType } = req.user;

    if (userType !== 'supplier' && userType !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    const days = req.query.days ? parseInt(req.query.days) : 7;
    const products = await Product.getExpiringProducts(supplier_id, days);

    res.status(200).json({
      warning: `Sản phẩm sắp hết hạn trong ${days} ngày`,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get expiring products error:', err.message);
    res.status(500).json({
      error: 'Lấy sản phẩm sắp hết hạn thất bại',
      message: err.message
    });
  }
};

// LẤY SẢN PHẨM TỒN KHO THẤP (cảnh báo)
export const getLowStockProducts = async (req, res) => {
  try {
    const { userId: supplier_id, userType } = req.user;

    if (userType !== 'supplier' && userType !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    const products = await Product.getLowStockProducts(supplier_id);

    res.status(200).json({
      warning: 'Sản phẩm tồn kho thấp hơn ngưỡng cảnh báo',
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get low stock products error:', err.message);
    res.status(500).json({
      error: 'Lấy sản phẩm tồn kho thấp thất bại',
      message: err.message
    });
  }
};
