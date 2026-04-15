import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { pricingTierService } from '../../../services/api';
import { useCart } from '../../../hooks/useCart';

export default function PricingTiersDisplay({ productId, currentPrice }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadTiers();
  }, [productId]);

  useEffect(() => {
    // Calculate price when quantity changes
    calculatePrice();
  }, [selectedQuantity, tiers]);

  const loadTiers = async () => {
    try {
      setLoading(true);
      const response = await pricingTierService.getProductTiers(productId);
      setTiers(response.data.tiers || []);
    } catch (err) {
      console.error('Error loading tiers:', err);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selectedQuantity || selectedQuantity <= 0) {
      setCalculatedPrice(null);
      return;
    }

    try {
      const response = await pricingTierService.calculatePrice(productId, selectedQuantity);
      setCalculatedPrice(response.data);
    } catch (err) {
      console.error('Error calculating price:', err);
      setCalculatedPrice(null);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(productId, parseInt(selectedQuantity));
    } catch (err) {
      alert('Không thể thêm sản phẩm vào giỏ hàng');
      console.error('Error adding to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (tiers.length === 0) {
    return null; // Don't show section if no tiers
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        📊 Giá Theo Số Lượng Mua
      </Typography>

      {/* Pricing Tiers Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Số lượng</TableCell>
              <TableCell align="right">Giá/đơn vị</TableCell>
              <TableCell align="center">Chiết khấu</TableCell>
              <TableCell>Thông tin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiers.map((tier, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  {tier.min_quantity} - {tier.max_quantity ? tier.max_quantity : '∞'}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {tier.tier_price?.toLocaleString('vi-VN')}₫
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {tier.discount_percentage > 0 ? (
                    <Chip
                      label={`-${tier.discount_percentage}%`}
                      color="success"
                      size="small"
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {tier.description || 'Mua thêm để được chiết khấu'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Quantity Selector */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                Chọn số lượng:
              </Typography>
              <TextField
                type="number"
                value={selectedQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setSelectedQuantity(Math.max(1, val));
                }}
                inputProps={{ min: 1 }}
                size="small"
                sx={{ width: 100 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            {calculatedPrice && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline', justifyContent: 'flex-end' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {calculatedPrice.total_price?.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>

                {calculatedPrice.total_savings > 0 && (
                  <Chip
                    label={`Tiết kiệm ${calculatedPrice.total_savings?.toLocaleString('vi-VN')}₫`}
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            )}
          </Grid>
        </Grid>

        {calculatedPrice && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Giá gốc: {calculatedPrice.original_total?.toLocaleString('vi-VN')}₫
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {calculatedPrice.tier_applied ? (
                    <>
                      ✅ Áp dụng tầng giá: {calculatedPrice.tier_applied.min_quantity}-
                      {calculatedPrice.tier_applied.max_quantity || '∞'}
                    </>
                  ) : (
                    '✓ Giá bình thường'
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<CartIcon />}
          onClick={handleAddToCart}
          disabled={adding || !calculatedPrice}
          sx={{ mt: 2 }}
        >
          Thêm {selectedQuantity} vào giỏ hàng
        </Button>
      </Paper>
    </Box>
  );
}
