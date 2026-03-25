import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import api from '../../../services/api';

export default function ProductForm({ initialData = null, onSuccess = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    product_type: initialData?.product_type || 'dry_product',
    original_price: initialData?.original_price || '',
    current_price: initialData?.current_price || '',
    min_floor_price: initialData?.min_floor_price || '',
    stock_quantity: initialData?.stock_quantity || '',
    min_stock_threshold: initialData?.min_stock_threshold || '',
    expiry_date: initialData?.expiry_date || '',
    image_url: initialData?.image_url || '',
    auto_pricing_enabled: initialData?.auto_pricing_enabled !== false
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category.trim()) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.product_type) newErrors.product_type = 'Loại sản phẩm là bắt buộc';
    if (!formData.original_price) newErrors.original_price = 'Giá gốc là bắt buộc';
    if (!formData.current_price) newErrors.current_price = 'Giá bán là bắt buộc';
    if (!formData.stock_quantity) newErrors.stock_quantity = 'Tồn kho là bắt buộc';
    if (!formData.expiry_date) newErrors.expiry_date = 'Ngày hết hạn là bắt buộc';

    if (
      formData.original_price
      && formData.current_price
      && parseFloat(formData.current_price) > parseFloat(formData.original_price)
    ) {
      newErrors.current_price = 'Giá bán không được cao hơn giá gốc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // DEBUG: Check token
      const token = localStorage.getItem('token');
      console.log('[DEBUG] Token from localStorage:', token);

      const payload = {
        ...formData,
        original_price: parseFloat(formData.original_price),
        current_price: parseFloat(formData.current_price),
        min_floor_price: formData.min_floor_price ? parseFloat(formData.min_floor_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_threshold: formData.min_stock_threshold
          ? parseInt(formData.min_stock_threshold)
          : null
      };

      let response;
      if (initialData?.id) {
        // Update existing product
        response = await api.put(`/products/${initialData.id}`, payload);
      } else {
        // Create new product
        response = await api.post('/products', payload);
      }

      setSuccessMessage(
        response.data.message || 'Sản phẩm được lưu thành công'
      );

      // Reset form
      if (!initialData?.id) {
        setFormData({
          name: '',
          description: '',
          category: '',
          product_type: 'dry_product',
          original_price: '',
          current_price: '',
          min_floor_price: '',
          stock_quantity: '',
          min_stock_threshold: '',
          expiry_date: '',
          image_url: '',
          auto_pricing_enabled: true
        });
      }

      if (onSuccess) {
        onSuccess(response.data.product);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || 'Lỗi khi lưu sản phẩm'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {initialData?.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Row 1 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên sản phẩm*"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Danh mục*"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                error={!!errors.category}
                helperText={errors.category}
              />
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.product_type}>
                <InputLabel>Loại sản phẩm*</InputLabel>
                <Select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                >
                  <MenuItem value="dry_product">Khô/đóng gói (30-90 ngày)</MenuItem>
                  <MenuItem value="fresh_product">Tươi/trong ngày (0-1 ngày)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày hết hạn*"
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                error={!!errors.expiry_date}
                helperText={errors.expiry_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Row 3 - Prices */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Giá gốc (VND)*"
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                error={!!errors.original_price}
                helperText={errors.original_price}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Giá bán (VND)*"
                type="number"
                name="current_price"
                value={formData.current_price}
                onChange={handleInputChange}
                error={!!errors.current_price}
                helperText={errors.current_price}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Giá sàn tối thiểu (VND)"
                type="number"
                name="min_floor_price"
                value={formData.min_floor_price}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            {/* Row 4 - Stock */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tồn kho*"
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity}
                inputProps={{ min: '0' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngưỡng tồn kho cảnh báo"
                type="number"
                name="min_stock_threshold"
                value={formData.min_stock_threshold}
                onChange={handleInputChange}
                inputProps={{ min: '0' }}
              />
            </Grid>

            {/* Row 5 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả sản phẩm"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            {/* Row 6 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL hình ảnh"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Row 7 - Auto pricing */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="body2">
                  <input
                    type="checkbox"
                    name="auto_pricing_enabled"
                    checked={formData.auto_pricing_enabled}
                    onChange={handleInputChange}
                  />
                  {' '}
                  Bật Auto Pricing Engine
                </Typography>
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : (initialData?.id ? 'Cập nhật' : 'Thêm sản phẩm')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
