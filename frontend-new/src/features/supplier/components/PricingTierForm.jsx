import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { pricingTierService } from '../../../services/api';

export default function PricingTierForm({
  tierData,
  productId,
  mode = 'create',
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    product_id: productId,
    min_quantity: '',
    max_quantity: '',
    tier_price: '',
    discount_percentage: 0,
    description: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form with tier data if editing
  useEffect(() => {
    if (mode === 'edit' && tierData) {
      setFormData({
        product_id: productId,
        min_quantity: tierData.min_quantity || '',
        max_quantity: tierData.max_quantity || '',
        tier_price: tierData.tier_price || '',
        discount_percentage: tierData.discount_percentage || 0,
        description: tierData.description || '',
        is_active: tierData.is_active !== false,
      });
    }
  }, [mode, tierData, productId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.min_quantity || parseInt(formData.min_quantity) <= 0) {
      setError('Số lượng tối thiểu phải lớn hơn 0');
      return;
    }

    if (!formData.tier_price || parseFloat(formData.tier_price) <= 0) {
      setError('Giá tầng phải lớn hơn 0');
      return;
    }

    if (
      formData.max_quantity &&
      parseInt(formData.max_quantity) > 0 &&
      parseInt(formData.max_quantity) < parseInt(formData.min_quantity)
    ) {
      setError('Số lượng tối đa phải >= số lượng tối thiểu');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        product_id: formData.product_id,
        min_quantity: parseInt(formData.min_quantity),
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : null,
        tier_price: parseFloat(formData.tier_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (mode === 'create') {
        await pricingTierService.createTier(submitData);
        setSuccess('Tạo tầng giá thành công!');
      } else {
        await pricingTierService.updateTier(tierData.id, submitData);
        setSuccess('Cập nhật tầng giá thành công!');
      }

      setTimeout(() => {
        onSave();
      }, 500);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Có lỗi xảy ra';
      setError(errMsg);
      console.error('Error saving tier:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        label="Số lượng tối thiểu"
        name="min_quantity"
        type="number"
        value={formData.min_quantity}
        onChange={handleInputChange}
        placeholder="VD: 1"
        fullWidth
        size="small"
        disabled={mode === 'edit'}
        inputProps={{ min: 1 }}
      />

      <TextField
        label="Số lượng tối đa (để trống = không giới hạn)"
        name="max_quantity"
        type="number"
        value={formData.max_quantity}
        onChange={handleInputChange}
        placeholder="VD: 5"
        fullWidth
        size="small"
        inputProps={{ min: 1 }}
      />

      <TextField
        label="Giá/đơn vị (₫)"
        name="tier_price"
        type="number"
        value={formData.tier_price}
        onChange={handleInputChange}
        placeholder="0"
        fullWidth
        size="small"
        inputProps={{ step: '1000', min: '0' }}
      />

      <TextField
        label="Chiết khấu (%)"
        name="discount_percentage"
        type="number"
        value={formData.discount_percentage}
        onChange={handleInputChange}
        fullWidth
        size="small"
        inputProps={{ min: 0, max: 100 }}
      />

      <TextField
        label="Mô tả (không bắt buộc)"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="VD: Giá đặc biệt chiết khấu 10%"
        fullWidth
        multiline
        rows={2}
        size="small"
      />

      <FormControlLabel
        control={
          <Checkbox
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
        }
        label="Hoạt động"
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (mode === 'create' ? 'Tạo mới' : 'Cập nhật')}
        </Button>
      </Box>
    </Box>
  );
}
