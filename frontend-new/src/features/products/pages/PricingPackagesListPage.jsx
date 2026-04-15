import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { pricingPackageService } from '../../../services/api';

const PACKAGE_TYPE_NAMES = {
  mini: 'Túi Mini',
  standard: 'Túi Tiêu chuẩn',
  family: 'Túi Gia Đình',
  premium: 'Túi Premium',
};

export default function PricingPackagesListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const minPrice = parseInt(searchParams.get('minPrice')) || 0;
  const maxPrice = parseInt(searchParams.get('maxPrice')) || 1000000;
  const packageType = searchParams.get('type') || '';

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, [minPrice, maxPrice]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await pricingPackageService.getAllPackages();
      const packageList = response.data?.packages || [];

      // Filter by price range and active status
      const filtered = packageList.filter(
        (pkg) =>
          pkg.is_active !== false &&
          pkg.package_price >= minPrice &&
          pkg.package_price <= maxPrice
      );

      setPackages(filtered);
      setError(null);
    } catch (err) {
      console.error('Error fetching pricing packages:', err);
      setError('Không thể tải danh sách gói giá');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPackage = (pkg) => {
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

  return (
    <Box sx={{ width: '100%', bgcolor: '#F7FBF0', py: 4 }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280 }}>
        {/* Breadcrumb & Header */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer' }}
            >
              Trang chủ
            </Link>
            <Typography color="textPrimary">
              {PACKAGE_TYPE_NAMES[packageType] || 'Gói giá ưu đãi'}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#181D17' }}>
            {PACKAGE_TYPE_NAMES[packageType] || 'Danh Sách Gói Giá'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Packages Grid */}
        {packages.length > 0 ? (
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
                  }}
                >
                  {/* Package Image */}
                  {pkg.display_image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={pkg.display_image}
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
                        }}
                      >
                        {formatCurrency(pkg.package_price)}
                      </Typography>
                    </Box>

                    {/* View Button */}
                    <Button
                      variant="contained"
                      onClick={() => handleViewPackage(pkg)}
                      disabled={pkg.stock_quantity <= 0}
                      sx={{
                        bgcolor: '#0D631B',
                        '&:hover': { bgcolor: '#0A4A15' },
                        '&:disabled': { bgcolor: '#ccc' },
                      }}
                    >
                      {pkg.stock_quantity > 0 ? 'Xem Gói' : 'Hết hàng'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
              Hiện chưa có gói giá nào trong dải giá này
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                bgcolor: '#0D631B',
                '&:hover': { bgcolor: '#0A4A15' },
              }}
            >
              Quay lại trang chủ
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
