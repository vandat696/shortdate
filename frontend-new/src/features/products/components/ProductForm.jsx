import React, { useState, useEffect } from 'react';
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
  Grid,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import api, { productService } from '../../../services/api';

export default function ProductForm({ initialData = null, onSuccess = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryIds: initialData?.categories?.map(c => c.id) || [],
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
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await productService.getCategories();
      console.log('Categories response:', response);
      const categoryList = response.data || [];
      setCategories(categoryList);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setErrorMessage('Lỗi khi tải danh mục');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      categoryIds: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      newErrors.categoryIds = 'Vui lòng chọn ít nhất một danh mục';
    }
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

  // Image upload handlers
  const handleFileSelect = (files) => {
    const maxFiles = 4;
    const totalFiles = selectedFiles.length + files.length;

    if (totalFiles > maxFiles) {
      setErrorMessage(`Tối đa ${maxFiles} ảnh. Hiện tại bạn đã chọn ${selectedFiles.length} ảnh.`);
      return;
    }

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage(`${file.name} không phải là ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);

      // Create previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
      setErrorMessage('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadProductImages = async (productId) => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post(`/images/${productId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSelectedFiles([]);
      setImagePreviews([]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi khi tải ảnh';
      throw new Error(errorMsg);
    } finally {
      setUploadingImages(false);
    }
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
        categoryIds: formData.categoryIds.map(id => parseInt(id, 10)),
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

      const newProductId = response.data.product.id;
      let successMsg = response.data.message || 'Sản phẩm được lưu thành công';

      // Upload images if any selected
      if (selectedFiles.length > 0 && !initialData?.id) {
        try {
          await uploadProductImages(newProductId);
          successMsg = 'Sản phẩm và ảnh được lưu thành công';
        } catch (uploadErr) {
          // If upload fails, still show product created but mention image error
          setErrorMessage(uploadErr.message || 'Lỗi khi tải ảnh sản phẩm');
          setLoading(false);
          return; // Don't call onSuccess if upload failed
        }
      }

      setSuccessMessage(successMsg);

      // Reset form
      if (!initialData?.id) {
        setFormData({
          name: '',
          description: '',
          categoryIds: [],
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

      // Only call onSuccess if everything succeeded
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
              <FormControl fullWidth error={!!errors.categoryIds} disabled={loadingCategories}>
                <InputLabel>Danh mục*</InputLabel>
                <Select
                  multiple
                  name="categoryIds"
                  value={formData.categoryIds.map(id => String(id))}
                  onChange={handleCategoryChange}
                  renderValue={(selected) => {
                    const selectedCats = selected.map(id => 
                      categories.find(c => String(c.id) === String(id))?.name
                    ).filter(Boolean);
                    return selectedCats.join(', ');
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.categoryIds && (
                <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px' }}>
                  {errors.categoryIds}
                </div>
              )}
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

            {/* Row 6 - File Upload with Drag & Drop */}
            {!initialData?.id && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                 Tải ảnh sản phẩm (tối đa 4 ảnh)
                </Typography>

                <Paper
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: dragging ? '#0D631B' : '#CCCCCC',
                    backgroundColor: dragging ? '#F7FBF0' : '#FAFAFA',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    mb: 2
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#0D631B', mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Kéo ảnh vào đây hoặc bấm để chọn
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Hỗ trợ JPG, PNG, WebP (tối đa 5MB mỗi ảnh)
                    </Typography>
                  </label>
                </Paper>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                      Ảnh đã chọn ({imagePreviews.length}/4):
                    </Typography>
                    <Grid container spacing={1}>
                      {imagePreviews.map((preview, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Paper
                            sx={{
                              position: 'relative',
                              overflow: 'hidden',
                              paddingBottom: '100%',
                              backgroundColor: '#F0F0F0'
                            }}
                          >
                            <Box
                              component="img"
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': {
                                  backgroundColor: '#FF6B6B'
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                backgroundColor: '#0D631B',
                                color: 'white'
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
            )}

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
                  disabled={loading || uploadingImages}
                  sx={{ flex: 1 }}
                >
                  {loading || uploadingImages ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                      {uploadingImages ? 'Đang tải ảnh...' : 'Đang xử lý...'}
                    </Box>
                  ) : (
                    initialData?.id ? 'Cập nhật' : 'Thêm sản phẩm'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
