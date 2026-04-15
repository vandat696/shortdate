import PricingPackage from '../models/PricingPackage.js';
import PackageItem from '../models/PackageItem.js';
import db from '../config/database.js';

class PricingPackageController {
  /**
   * GET /api/pricing-packages
   * Lấy danh sách gói giá (buyer view)
   */
  static async getAllPackages(req, res) {
    try {
      const { supplier_id, search } = req.query;

      const filters = {};
      if (supplier_id) filters.supplier_id = parseInt(supplier_id);
      if (search) filters.search = search;

      const packages = await PricingPackage.findAll(filters);

      return res.json({
        count: packages.length,
        packages
      });
    } catch (error) {
      console.error('Error getting pricing packages:', error);
      res.status(500).json({ error: 'Lỗi khi lấy danh sách gói giá' });
    }
  }

  /**
   * GET /api/pricing-packages/:id
   * Lấy chi tiết gói giá (kèm danh sách sản phẩm bên trong)
   */
  static async getPackageDetail(req, res) {
    try {
      const { id } = req.params;

      const packageData = await PricingPackage.findById(id);

      if (!packageData) {
        return res.status(404).json({ error: 'Gói giá không tồn tại' });
      }

      // Tính giá trị gốc của gói (tổng giá sản phẩm bên trong)
      const value = await PackageItem.calculatePackageValue(id);

      return res.json({
        ...packageData,
        value: {
          total_original_value: parseFloat(value.total_original_value) || 0,
          total_current_value: parseFloat(value.total_current_value) || 0,
          items_count: value.items_count || 0,
          savings: parseFloat(value.total_original_value) - packageData.package_price || 0
        }
      });
    } catch (error) {
      console.error('Error getting package detail:', error);
      res.status(500).json({ error: 'Lỗi khi lấy chi tiết gói giá' });
    }
  }

  /**
   * GET /api/pricing-packages/supplier/:supplierId
   * Lấy tất cả gói giá của một supplier (supplier view)
   * Requires: authenticate middleware
   */
  static async getSupplierPackages(req, res) {
    try {
      const { supplierId } = req.params;
      const { includeInactive } = req.query;

      console.log('[getSupplierPackages] req.user:', req.user);
      console.log('[getSupplierPackages] supplierId param:', supplierId);

      const userIdAsInt = req.user?.userId;
      const supplierIdAsInt = parseInt(supplierId);

      console.log('[getSupplierPackages] userIdAsInt:', userIdAsInt, 'supplierIdAsInt:', supplierIdAsInt);

      // Kiểm tra quyền: chỉ supplier của gói hoặc admin mới có quyền xem
      if (userIdAsInt !== supplierIdAsInt && req.user?.userType !== 'admin') {
        console.log('[getSupplierPackages] 403 - Access denied. userType:', req.user?.userType);
        return res.status(403).json({ error: 'Bạn không có quyền truy cập gói giá này' });
      }

      const packages = await PricingPackage.findBySupplier(
        supplierIdAsInt,
        { includeInactive: includeInactive === 'true' }
      );

      // Calculate value for each package
      const packagesWithValue = await Promise.all(
        packages.map(async (pkg) => {
          try {
            console.log(`[getSupplierPackages] Package ${pkg.id} items from findBySupplier:`, pkg.items);
            
            const value = await PackageItem.calculatePackageValue(pkg.id);
            console.log(`[getSupplierPackages] Package ${pkg.id} value:`, value);
            
            return {
              ...pkg,
              value: {
                total_original_value: parseFloat(value?.total_original_value) || 0,
                total_current_value: parseFloat(value?.total_current_value) || 0,
                items_count: parseInt(value?.items_count) || 0,
                savings: (parseFloat(value?.total_original_value) || 0) - pkg.package_price || 0
              }
            };
          } catch (err) {
            console.error(`[getSupplierPackages] Error calculating value for package ${pkg.id}:`, err);
            return {
              ...pkg,
              value: {
                total_original_value: 0,
                total_current_value: 0,
                items_count: 0,
                savings: 0
              }
            };
          }
        })
      );

      return res.json({
        supplier_id: supplierId,
        count: packagesWithValue.length,
        packages: packagesWithValue
      });
    } catch (error) {
      console.error('Error getting supplier packages:', error);
      res.status(500).json({ error: 'Lỗi khi lấy gói giá của supplier' });
    }
  }

  /**
   * POST /api/pricing-packages
   * Tạo gói giá mới (Supplier only)
   * Body: { package_name, description, package_price, stock_quantity, expiry_date }
   */
  static async createPackage(req, res) {
    try {
      const { package_name, description, package_price, stock_quantity, expiry_date } = req.body;
      const supplier_id = req.user.userId;

      // Validate
      if (!package_name || package_price === undefined) {
        return res.status(400).json({ error: 'Tên gói và giá không được rỗng' });
      }

      if (package_price <= 0) {
        return res.status(400).json({ error: 'Giá gói phải lớn hơn 0' });
      }

      const newPackage = await PricingPackage.create({
        supplier_id,
        package_name,
        description,
        package_price,
        expiry_date: expiry_date || null,
        stock_quantity: stock_quantity || 0
      });

      return res.status(201).json({
        message: 'Tạo gói giá thành công',
        package: newPackage
      });
    } catch (error) {
      console.error('Error creating package:', error);
      
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Tên gói này đã tồn tại' });
      }

      res.status(500).json({ error: 'Lỗi khi tạo gói giá' });
    }
  }

  /**
   * PUT /api/pricing-packages/:id
   * Cập nhật gói giá (Supplier only)
   * Body: { package_name, description, package_price, stock_quantity, expiry_date, is_active }
   */
  static async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const { package_name, description, package_price, stock_quantity, expiry_date, is_active } = req.body;

      // Kiểm tra quyền sở hữu
      const isOwner = await PricingPackage.isOwner(id, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Bạn chỉ có thể cập nhật gói của mình' });
      }

      if (package_price !== undefined && package_price <= 0) {
        return res.status(400).json({ error: 'Giá gói phải lớn hơn 0' });
      }

      const updatedPackage = await PricingPackage.update(id, {
        package_name,
        description,
        package_price,
        stock_quantity,
        expiry_date,
        is_active
      });

      return res.json({
        message: 'Cập nhật gói giá thành công',
        package: updatedPackage
      });
    } catch (error) {
      console.error('Error updating package:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật gói giá' });
    }
  }

  /**
   * DELETE /api/pricing-packages/:id
   * Xóa gói giá (Supplier only)
   */
  static async deletePackage(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra quyền sở hữu
      const isOwner = await PricingPackage.isOwner(id, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Bạn chỉ có thể xóa gói của mình' });
      }

      const deleted = await PricingPackage.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Gói giá không tồn tại' });
      }

      return res.json({ message: 'Xóa gói giá thành công' });
    } catch (error) {
      console.error('Error deleting package:', error);
      res.status(500).json({ error: 'Lỗi khi xóa gói giá' });
    }
  }

  /**
   * POST /api/pricing-packages/:packageId/items
   * Thêm sản phẩm vào gói (Supplier only)
   * Body: { product_id, quantity }
   */
  static async addItemToPackage(req, res) {
    try {
      const { packageId } = req.params;
      const { product_id, quantity } = req.body;

      console.log('[addItemToPackage] packageId:', packageId, 'product_id:', product_id, 'quantity:', quantity);

      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Product ID và số lượng không hợp lệ' });
      }

      // Kiểm tra quyền sở hữu gói
      const isOwner = await PricingPackage.isOwner(packageId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Bạn chỉ có thể chỉnh sửa gói của mình' });
      }

      // Kiểm tra sản phẩm có tồn tại & quyền sở hữu sản phẩm
      const productCheck = await db.query(
        'SELECT id FROM products WHERE id = $1 AND supplier_id = $2',
        [product_id, req.user.userId]
      );

      if (productCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Sản phẩm không tồn tại hoặc bạn không sở hữu' });
      }

      const item = await PackageItem.addItem(packageId, product_id, quantity);
      console.log('[addItemToPackage] Item added:', item);

      return res.status(201).json({
        message: 'Thêm sản phẩm vào gói thành công',
        item
      });
    } catch (error) {
      console.error('Error adding item to package:', error);
      res.status(500).json({ error: 'Lỗi khi thêm sản phẩm' });
    }
  }

  /**
   * DELETE /api/pricing-packages/:packageId/items/:productId
   * Xóa sản phẩm khỏi gói (Supplier only)
   */
  static async removeItemFromPackage(req, res) {
    try {
      const { packageId, productId } = req.params;

      // Kiểm tra quyền sở hữu gói
      const isOwner = await PricingPackage.isOwner(packageId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Bạn chỉ có thể chỉnh sửa gói của mình' });
      }

      const removed = await PackageItem.removeItem(packageId, productId);

      if (!removed) {
        return res.status(404).json({ error: 'Sản phẩm không có trong gói' });
      }

      return res.json({ message: 'Xóa sản phẩm khỏi gói thành công' });
    } catch (error) {
      console.error('Error removing item from package:', error);
      res.status(500).json({ error: 'Lỗi khi xóa sản phẩm' });
    }
  }

  /**
   * PUT /api/pricing-packages/:packageId/items/:productId
   * Cập nhật số lượng sản phẩm trong gói (Supplier only)
   * Body: { quantity }
   */
  static async updateItemQuantity(req, res) {
    try {
      const { packageId, productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
      }

      // Kiểm tra quyền sở hữu gói
      const isOwner = await PricingPackage.isOwner(packageId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Bạn chỉ có thể chỉnh sửa gói của mình' });
      }

      const item = await PackageItem.updateQuantity(packageId, productId, quantity);

      if (!item) {
        return res.status(404).json({ error: 'Sản phẩm không có trong gói' });
      }

      return res.json({
        message: 'Cập nhật số lượng thành công',
        item
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật số lượng' });
    }
  }
}

export default PricingPackageController;
