import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ShoppingCart as CartIcon, Info as InfoIcon } from '@mui/icons-material';
import { pricingPackageService } from '../../../services/api';
import { useCart } from '../../../hooks/useCart';

export default function PricingPackagesDisplay({ supplierId, productId }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [supplierId]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pricingPackageService.getSupplierPackages(supplierId);
      // Filter packages that contain this product
      const filteredPackages = (response.data.packages || []).filter(pkg =>
        pkg.items && pkg.items.some(item => item.id === productId)
      );
      setPackages(filteredPackages);
    } catch (err) {
      setError('Không thể tải danh sách gói giá');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackageToCart = async (pkg) => {
    try {
      setAdding(true);
      // For packages, we'll store them with a special prefix in product_id
      // The backend will need to handle this appropriately
      // For MVP, we'll just add with quantity = 1
      await addToCart(pkg.id, 1);
      setDetailDialog(false);
      setSelectedPackage(null);
    } catch (err) {
      alert('Không thể thêm gói giá vào giỏ hàng');
      console.error('Error adding package to cart:', err);
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

  if (packages.length === 0) {
    return null; // Don't show section if no packages
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
        📦 Gói Giá Đặc Biệt
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {packages.map((pkg) => {
          const totalOriginal = pkg.value?.total_original_value || 0;
          const savings = totalOriginal - pkg.package_price;
          const savingsPercent = totalOriginal > 0 ? Math.round((savings / totalOriginal) * 100) : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={pkg.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                {pkg.display_image && (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundImage: `url(${pkg.display_image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {pkg.package_name}
                  </Typography>

                  {pkg.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {pkg.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${pkg.item_count || 0} sản phẩm`}
                      size="small"
                      variant="outlined"
                    />
                    {pkg.stock_quantity > 0 && (
                      <Chip
                        label={`Tồn: ${pkg.stock_quantity}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline', mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: 'line-through',
                        color: 'textSecondary',
                      }}
                    >
                      {totalOriginal?.toLocaleString('vi-VN')}₫
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: '#1976d2' }}
                    >
                      {pkg.package_price?.toLocaleString('vi-VN')}₫
                    </Typography>
                  </Box>

                  {savings > 0 && (
                    <Chip
                      label={`Tiết kiệm ${savings?.toLocaleString('vi-VN')}₫ (${savingsPercent}%)`}
                      color="success"
                      size="small"
                      sx={{ width: '100%' }}
                    />
                  )}

                  {pkg.expiry_date && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                      📅 Hạn: {new Date(pkg.expiry_date).toLocaleDateString('vi-VN')}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setDetailDialog(true);
                    }}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CartIcon />}
                    onClick={() => handleAddPackageToCart(pkg)}
                    disabled={adding || pkg.stock_quantity === 0}
                    sx={{ ml: 'auto' }}
                  >
                    Thêm
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Package Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết gói giá: {selectedPackage?.package_name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPackage && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Sản phẩm trong gói:
              </Typography>
              {selectedPackage.items?.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <Box>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      x{item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {(item.current_price * item.quantity)?.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
              ))}

              <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid #ddd' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Giá gốc:</Typography>
                  <Typography variant="body2">
                    {selectedPackage.value?.total_original_value?.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Giá gói:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {selectedPackage.package_price?.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Tiết kiệm:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {selectedPackage.value?.savings?.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
          <Button
            variant="contained"
            onClick={() => handleAddPackageToCart(selectedPackage)}
            disabled={adding}
            startIcon={<CartIcon />}
          >
            Thêm vào giỏ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
