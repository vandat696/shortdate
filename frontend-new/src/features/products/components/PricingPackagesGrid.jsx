import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  Chip,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pricingPackageService, getImageUrl } from '../../../services/api';

export default function PricingPackagesGrid() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await pricingPackageService.getAllPackages();
      const packageList = response.data?.packages || [];
      
      // Filter only active packages
      const activePackages = packageList.filter(pkg => pkg.is_active !== false);
      setPackages(activePackages);
      setError(null);
    } catch (err) {
      console.error('Error fetching pricing packages:', err);
      setError('Không thể tải danh sách gói giá');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageClick = async (pkg) => {
    try {
      // Fetch package detail with product breakdown
      const response = await pricingPackageService.getPackageDetail(pkg.id);
      setSelectedPackage(response.data);
      setDetailDialog(true);
    } catch (err) {
      console.error('Error fetching package detail:', err);
      alert('Không thể tải chi tiết gói giá');
    }
  };

  const handleViewProducts = (pkg) => {
    // Navigate to products in package page
    navigate(`/pricing-packages/${pkg.id}/products`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return <Chip label="Hết hạn" size="small" color="error" variant="outlined" />;
    if (daysLeft === 0) return <Chip label="Hôm nay hết hạn" size="small" color="warning" variant="outlined" />;
    if (daysLeft <= 7) return <Chip label={`${daysLeft} ngày nữa hết hạn`} size="small" color="warning" variant="outlined" />;

    return <Chip label={`Còn ${daysLeft} ngày`} size="small" color="success" variant="outlined" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (packages.length === 0) {
    return (
      <Box sx={{ px: 3, py: 8, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="textSecondary">
          Chưa có gói giá nào được tạo
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', px: 3, py: '64px', bgcolor: '#F7FBF0' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: 36,
              lineHeight: '40px',
              letterSpacing: '-0.9px',
              color: '#181D17',
              mb: 2,
            }}
          >
            Gói Giá Ưu Đãi
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Chọn gói quà có giá, cùng tiết kiệm hơn
          </Typography>
        </Box>

        {/* Packages Grid */}
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                  cursor: 'pointer',
                }}
              >
                {/* Package Image */}
                {pkg.display_image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(pkg.display_image)}
                    alt={pkg.package_name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Package Name */}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#181D17' }}>
                    {pkg.package_name}
                  </Typography>

                  {/* Description */}
                  {pkg.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {pkg.description.substring(0, 80)}
                      {pkg.description.length > 80 ? '...' : ''}
                    </Typography>
                  )}

                  {/* Expiry Badge */}
                  {pkg.expiry_date && (
                    <Box sx={{ mb: 1 }}>
                      {getExpiryBadge(pkg.expiry_date)}
                    </Box>
                  )}

                  {/* Stock Status */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {pkg.stock_quantity > 0 ? (
                      <Chip
                        label={`${pkg.stock_quantity} ${pkg.stock_quantity === 1 ? 'gói' : 'gói'} còn`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Hết hàng" size="small" color="error" variant="outlined" />
                    )}
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ my: 2, flexGrow: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#0D631B',
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {formatCurrency(pkg.package_price)}
                    </Typography>
                  </Box>

                  {/* Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePackageClick(pkg)}
                      sx={{ flex: 1 }}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewProducts(pkg)}
                      sx={{
                        flex: 1,
                        bgcolor: '#0D631B',
                        '&:hover': { bgcolor: '#0A4A15' },
                      }}
                    >
                      Xem gói
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Package Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#181D17' }}>
          {selectedPackage?.package_name} - Chi tiết gói
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPackage && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Pricing Info */}
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Giá gốc (tổng sản phẩm)
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#999', textDecoration: 'line-through' }}>
                      {formatCurrency(selectedPackage.value?.total_original_value || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Giá gói
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#0D631B', fontWeight: 700 }}>
                      {formatCurrency(selectedPackage.package_price)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Tiết kiệm
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700 }}>
                      {formatCurrency(selectedPackage.value?.savings || 0)}
                      ({' '}
                      {(
                        ((selectedPackage.value?.savings || 0) /
                          (selectedPackage.value?.total_original_value || 1)) *
                        100
                      ).toFixed(1)}
                      % )
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Products in Package */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Các sản phẩm trong gói ({selectedPackage.value?.items_count || 0})
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell align="right">SL</TableCell>
                        <TableCell align="right">Giá gốc</TableCell>
                        <TableCell align="right">Theo gói</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPackage.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.original_price || item.current_price || 0)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency((item.original_price || item.current_price || 0) * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Description */}
              {selectedPackage.description && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Mô tả
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedPackage.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
          {selectedPackage && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailDialog(false);
                handleViewProducts(selectedPackage);
              }}
              sx={{
                bgcolor: '#0D631B',
                '&:hover': { bgcolor: '#0A4A15' },
              }}
            >
              Xem các sản phẩm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
