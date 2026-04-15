import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { pricingPackageService, productService } from '../../../services/api';

export default function PricingPackageForm({ packageData, mode = 'create', onSave, onCancel }) {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    package_name: '',
    description: '',
    package_price: '',
    stock_quantity: 0,
    is_active: true,
    expiry_date: '',
  });

  const [addItemForm, setAddItemForm] = useState({
    product_id: '',
    quantity: 1,
  });

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Initialize if editing
  useEffect(() => {
    if (mode === 'edit' && packageData) {
      setFormData({
        package_name: packageData.package_name || '',
        description: packageData.description || '',
        package_price: packageData.package_price || '',
        stock_quantity: packageData.stock_quantity || 0,
        is_active: packageData.is_active !== false,
        expiry_date: packageData.expiry_date || '',
      });

      if (packageData.items && packageData.items.length > 0) {
        const itemsWithExpiry = packageData.items.map((item) => ({
          product_id: item.id || item.product_id,
          product_name: item.name || item.product_name,
          quantity: item.quantity,
          original_price: item.original_price || item.current_price || 0,
          expiry_date: item.expiry_date || null,
        }));
        setSelectedItems(itemsWithExpiry);
      }
    }
  }, [mode, packageData]);

  // Auto-update expiry_date when selectedItems changes
  useEffect(() => {
    const earliestDate = getEarliestExpiryDate();
    if (earliestDate) {
      setFormData((prev) => ({
        ...prev,
        expiry_date: earliestDate,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        expiry_date: '',
      }));
    }
  }, [selectedItems]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productService.getAll();
      const products = Array.isArray(response.data?.products)
        ? response.data.products
        : Array.isArray(response.data)
          ? response.data
          : [];
      setAllProducts(products);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddItemChange = (e) => {
    const { name, value } = e.target;
    setAddItemForm({
      ...addItemForm,
      [name]: name === 'quantity' ? parseInt(value) : value,
    });
  };

  const handleAddItem = () => {
    if (!addItemForm.product_id) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }

    if (addItemForm.quantity <= 0) {
      setError('Số lượng phải lớn hơn 0');
      return;
    }

    // Check if product already in list
    if (selectedItems.some((item) => item.product_id === parseInt(addItemForm.product_id))) {
      setError('Sản phẩm này đã trong gói');
      return;
    }

    const product = allProducts.find((p) => p.id === parseInt(addItemForm.product_id));
    if (!product) {
      setError('Không tìm thấy sản phẩm');
      return;
    }

    const newItem = {
      product_id: parseInt(addItemForm.product_id),
      product_name: product.name,
      quantity: addItemForm.quantity,
      original_price: product.current_price || 0,
      expiry_date: product.expiry_date || null,
    };

    setSelectedItems([...selectedItems, newItem]);
    setAddItemForm({
      product_id: '',
      quantity: 1,
    });
    setError('');
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(selectedItems.filter((item) => item.product_id !== productId));
  };

  const getEarliestExpiryDate = () => {
    if (selectedItems.length === 0) return null;
    
    const dates = selectedItems
      .map((item) => item.expiry_date)
      .filter((date) => date); // Filter out null/undefined dates
    
    if (dates.length === 0) return null;
    
    // Find earliest date
    const earliest = dates.reduce((min, date) => {
      return new Date(date) < new Date(min) ? date : min;
    });
    
    return earliest;
  };

  const calculateTotalOriginal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.original_price || 0) * item.quantity, 0);
  };

  const calculateSavings = () => {
    const total = calculateTotalOriginal();
    const packagePrice = parseFloat(formData.package_price) || 0;
    return total - packagePrice;
  };

  const calculateSavingsPercent = () => {
    const total = calculateTotalOriginal();
    if (total === 0) return 0;
    return Math.round((calculateSavings() / total) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.package_name.trim()) {
      setError('Tên gói không được rỗng');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Gói phải có ít nhất 1 sản phẩm');
      return;
    }

    if (!formData.package_price || parseFloat(formData.package_price) <= 0) {
      setError('Giá gói phải lớn hơn 0');
      return;
    }

    const totalOriginal = calculateTotalOriginal();
    if (parseFloat(formData.package_price) >= totalOriginal) {
      setError(`Giá gói phải nhỏ hơn tổng giá gốc (${totalOriginal?.toLocaleString('vi-VN')}₫)`);
      return;
    }

    try {
      setLoading(true);

      // Format date to yyyy-MM-dd for backend
      const payload = {
        ...formData,
        expiry_date: formData.expiry_date ? formData.expiry_date.split('T')[0] : null
      };

      if (mode === 'create') {
        // Create package
        const pkgResponse = await pricingPackageService.createPackage(payload);
        const newPackageId = pkgResponse.data.package.id;

        console.log('[PricingPackageForm] Created package:', newPackageId, 'selectedItems:', selectedItems);

        // Add items to package
        for (const item of selectedItems) {
          console.log('[PricingPackageForm] Adding item:', item);
          await pricingPackageService.addItemToPackage(
            newPackageId,
            item.product_id,
            item.quantity
          );
        }

        setSuccess('Tạo gói giá thành công!');
      } else {
        // Update package
        await pricingPackageService.updatePackage(packageData.id, payload);

        // Update items (remove old ones and add new ones)
        // First remove all old items
        const oldItems = packageData.items || [];
        for (const oldItem of oldItems) {
          await pricingPackageService.removeItemFromPackage(packageData.id, oldItem.product_id);
        }

        // Then add new items
        for (const item of selectedItems) {
          await pricingPackageService.addItemToPackage(
            packageData.id,
            item.product_id,
            item.quantity
          );
        }

        setSuccess('Cập nhật gói giá thành công!');
      }

      // Reload page after success
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Có lỗi xảy ra';
      setError(errMsg);
      console.error('Error saving package:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {success}
        </Alert>
      )}

      {/* Section 1: Package Info */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          1️⃣ Thông tin gói
        </Typography>

        <TextField
          label="Tên gói giá"
          name="package_name"
          value={formData.package_name}
          onChange={handleInputChange}
          placeholder="VD: Túi Mini, Túi Tiêu chuẩn"
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
          required
        />

        <TextField
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Mô tả ngắn về gói giá"
          fullWidth
          multiline
          rows={2}
          size="small"
          sx={{ mb: 1.5 }}
        />

        <TextField
          label="Giá gói (₫)"
          name="package_price"
          type="number"
          value={formData.package_price}
          onChange={handleInputChange}
          placeholder="0"
          fullWidth
          size="small"
          inputProps={{ step: '1000', min: '0' }}
          sx={{ mb: 1.5 }}
          required
        />

        <TextField
          label="Ngày hết hạn gói (tự động tính từ SP)"
          name="expiry_date"
          type="date"
          value={formData.expiry_date}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          disabled
          helperText={formData.expiry_date ? `Ngày gần nhất: ${new Date(formData.expiry_date).toLocaleDateString('vi-VN')}` : 'Thêm sản phẩm để tính'}
          sx={{ mb: 1.5 }}
        />

        <TextField
          label="Tồn kho gói"
          name="stock_quantity"
          type="number"
          value={formData.stock_quantity}
          onChange={handleInputChange}
          placeholder="0"
          fullWidth
          size="small"
          inputProps={{ min: 0 }}
        />
      </Box>

      {/* Section 2: Select Products */}
      <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          2️⃣ Chọn sản phẩm cho gói
        </Typography>

        {productsLoading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Chọn sản phẩm</InputLabel>
                <Select
                  name="product_id"
                  value={addItemForm.product_id}
                  onChange={handleAddItemChange}
                  label="Chọn sản phẩm"
                >
                  {allProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} ({product.current_price?.toLocaleString('vi-VN')}₫)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="SL"
                name="quantity"
                type="number"
                value={addItemForm.quantity}
                onChange={handleAddItemChange}
                size="small"
                inputProps={{ min: 1 }}
                sx={{ width: 80 }}
              />

              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ bgcolor: '#0D631B' }}
              >
                Thêm
              </Button>
            </Box>

            {/* Selected Items Table */}
            {selectedItems.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="right">SL</TableCell>
                      <TableCell align="right">Giá/SP</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                      <TableCell align="center">Hạn SD</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.product_id} hover>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {item.original_price?.toLocaleString('vi-VN')}₫
                        </TableCell>
                        <TableCell align="right">
                          {(item.original_price * item.quantity)?.toLocaleString('vi-VN')}₫
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('vi-VN') : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.product_id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 2, textAlign: 'center', mb: 2 }}>
                <Typography color="textSecondary" variant="body2">
                  Chưa có sản phẩm nào
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Section 3: Pricing */}
      {selectedItems.length > 0 && (
        <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            3️⃣ Định giá gói
          </Typography>

          {/* Pricing Summary Card */}
          <Card sx={{ mb: 2, bgcolor: '#f9f9f9' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Tổng giá gốc (tất cả SP):</Typography>
                <Typography
                  variant="body2"
                  sx={{ textDecoration: 'line-through', color: '#999', fontWeight: 600 }}
                >
                  {calculateTotalOriginal()?.toLocaleString('vi-VN')}₫
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Giá gói bạn muốn bán:
                </Typography>
                <TextField
                  name="package_price"
                  type="number"
                  value={formData.package_price}
                  onChange={handleInputChange}
                  placeholder="0"
                  size="small"
                  inputProps={{ step: '1000', min: '0' }}
                  sx={{ width: 150 }}
                />
              </Box>

              {parseFloat(formData.package_price) > 0 && parseFloat(formData.package_price) < calculateTotalOriginal() && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#e8f5e9', p: 1, borderRadius: 1 }}>
                    <Typography variant="body2">Tiết kiệm cho khách:</Typography>
                    <Typography variant="body2" sx={{ color: '#0D631B', fontWeight: 700 }}>
                      -{calculateSavings()?.toLocaleString('vi-VN')}₫ ({calculateSavingsPercent()}%)
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 2 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading || selectedItems.length === 0}
          sx={{ bgcolor: '#0D631B', '&:hover': { bgcolor: '#0A4A15' } }}
        >
          {loading ? <CircularProgress size={24} /> : mode === 'create' ? 'Tạo gói' : 'Cập nhật gói'}
        </Button>
      </Box>
    </Box>
  );
}
