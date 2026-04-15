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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pricingPackageService, getImageUrl } from '../../../services/api';
import { useCart } from '../../../hooks/useCart';

export default function PricingPackageProductsPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [packageDetail, setPackageDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingPackageToCart, setAddingPackageToCart] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    fetchPackageDetail();
  }, [packageId]);

  const fetchPackageDetail = async () => {
    try {
      setLoading(true);

      // Fetch package details (includes items with image_url)
      const pkgResponse = await pricingPackageService.getPackageDetail(packageId);
      setPackageDetail(pkgResponse.data);

      // Use items directly from package - they already have all needed data
      if (pkgResponse.data.items && pkgResponse.data.items.length > 0) {
        // Map items to product format with image URL conversion
        const packageProducts = pkgResponse.data.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity_in_package: item.quantity,
          current_price: item.current_price,
          original_price: item.original_price,
          image_url: item.image_url,
          stock_quantity: item.stock_quantity,
          expiry_date: item.expiry_date,
        }));

        setProducts(packageProducts);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching package detail:', err);
      setError('Không thể tải thông tin gói giá');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackageToCart = async () => {
    try {
      setAddingPackageToCart(true);
      await addToCart(packageId, 1);
      setConfirmDialog(false);
      alert('Đã thêm gói giá vào giỏ hàng!');
    } catch (err) {
      console.error('Error adding package to cart:', err);
      alert('Không thể thêm gói giá vào giỏ hàng');
    } finally {
      setAddingPackageToCart(false);
    }
  };

  const handleAddProductToCart = async (product) => {
    try {
      await addToCart(product.id, product.quantity_in_package);
      alert(`Đã thêm ${product.quantity_in_package} ${product.name} vào giỏ hàng!`);
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Không thể thêm sản phẩm vào giỏ hàng');
    }
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

    const chipProps = {
      size: "small",
      variant: "outlined",
      sx: { 
        borderRadius: '6px',
        height: '32px',
        '& .MuiChip-label': { fontSize: '12px', fontWeight: 600 }
      }
    };

    if (daysLeft < 0) return <Chip label="Hết hạn" color="error" {...chipProps} />;
    if (daysLeft === 0) return <Chip label="Hôm nay hết hạn" color="warning" {...chipProps} />;
    if (daysLeft <= 7) return <Chip label={`${daysLeft} ngày nữa`} color="warning" {...chipProps} />;

    return <Chip label={`Còn ${daysLeft} ngày`} color="success" {...chipProps} />;
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
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Quay lại trang chủ
        </Button>
      </Box>
    );
  }

  if (!packageDetail) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Alert severity="warning">Gói giá không tồn tại</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Quay lại trang chủ
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: '#F7FBF0', py: 4 }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Trang chủ
          </Link>
          <Typography color="textSecondary">Gói giá ưu đãi</Typography>
          <Typography color="textPrimary">{packageDetail.package_name}</Typography>
        </Breadcrumbs>

        {/* Package Title */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#181D17' }}>
          {packageDetail.package_name}
        </Typography>

        {/* Package Header - Conditional Layout */}
        <Box
          sx={{
            mb: 6,
            display: 'grid',
            gridTemplateColumns: packageDetail.display_image
              ? { xs: '1fr', md: '1fr 1.2fr' }
              : { xs: '1fr', md: '1fr' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          {/* LEFT: Package Image - Only if exists */}
          {packageDetail.display_image && (
            <Box>
              <Card sx={{ overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={getImageUrl(packageDetail.display_image)}
                  alt={packageDetail.package_name}
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </Box>
          )}

          {/* RIGHT: Products List & Price Info */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              alignItems: 'start',
              width: '100%',
              minWidth: 0,
            }}
          >
            {/* Products List - Left Sub-Column */}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
                Sản phẩm trong gói ({products.length})
              </Typography>

              {products.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    pr: 2,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#0D631B',
                      borderRadius: '3px',
                    },
                  }}
                >
                  {products.map((product, index) => (
                    <Paper
                      key={product.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '80px 1fr 60px', md: '120px 1fr 100px' },
                        alignItems: 'center',
                        gap: { xs: 1.5, md: 2 },
                        p: 2,
                        width: '100%',
                        borderRadius: '12px',
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #EBEFE5',
                        backgroundColor: '#FFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          borderColor: '#0D631B',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {/* Product Image */}
                      <Box
                        sx={{
                          width: { xs: '80px', md: '120px' },
                          height: { xs: '80px', md: '120px' },
                          flexShrink: 0,
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        {product.image_url ? (
                          <Box
                            component="img"
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            sx={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease',
                              '&:hover': { transform: 'scale(1.05)' }
                            }}
                            onClick={() => navigate(`/products/${product.id}`)}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#F1F5EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#A8A29E',
                              fontSize: '32px',
                            }}
                          >
                            📦
                          </Box>
                        )}
                      </Box>

                      {/* Product Info */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#181D17',
                              mb: 0.5,
                              cursor: 'pointer',
                              '&:hover': { color: '#0D631B' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            {product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#78716C', display: 'block', mb: 1 }}>
                            {product.skuCode || 'N/A'}
                          </Typography>

                          {/* Info Grid: Enhanced Layout */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap', fontSize: '13px' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#999', fontSize: '11px' }}>Tồn kho</Typography>
                              <Typography sx={{ fontWeight: 700, color: '#181D17', fontSize: '13px' }}>
                                {product.stock_quantity !== null && product.stock_quantity !== undefined ? product.stock_quantity : '-'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#999', fontSize: '11px' }}>Hạn SD</Typography>
                              <Typography sx={{ fontWeight: 700, color: product.stock_quantity < 10 ? '#BA1A1A' : '#181D17', fontSize: '13px' }}>
                                {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('vi-VN') : '-'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#999', fontSize: '11px' }}>Giá</Typography>
                              <Typography sx={{ fontWeight: 700, color: '#0D631B', fontSize: '13px' }}>
                                {formatCurrency(product.current_price)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Quantity Chip */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chip
                          label={`SL: ${product.quantity_in_package}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">Gói giá hiện chưa có sản phẩm nào</Alert>
              )}
            </Box>

            {/* Price Info - Right Sub-Column (Sticky) */}
            <Box sx={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
              {/* Status Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {packageDetail.expiry_date && getExpiryBadge(packageDetail.expiry_date)}
                <Chip
                  label={packageDetail.stock_quantity > 0 ? `Còn ${packageDetail.stock_quantity} gói` : 'Hết hàng'}
                  color={packageDetail.stock_quantity > 0 ? 'primary' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderRadius: '6px',
                    height: '32px',
                    '& .MuiChip-label': { fontSize: '12px', fontWeight: 600 }
                  }}
                />
              </Box>

              {/* Pricing Card */}
              <Card sx={{ 
                bgcolor: '#FFF', 
                border: '1px solid #EBEFE5',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                mb: 2.5,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.75,
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  {/* Original Price */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#78716C', fontSize: '13px' }}>
                      Tổng giá gốc
                    </Typography>
                    <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: '13px', fontWeight: 500 }}>
                      {formatCurrency(packageDetail.value?.total_original_value || 0)}
                    </Typography>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ height: '1px', backgroundColor: '#EBEFE5' }} />

                  {/* Offer Price */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Typography variant="body2" sx={{ color: '#181D17', fontWeight: 600 }}>
                      Giá ưu đãi
                    </Typography>
                    <Typography sx={{ color: '#0D631B', fontWeight: 800, fontSize: '20px' }}>
                      {formatCurrency(packageDetail.package_price)}
                    </Typography>
                  </Box>

                  {/* Savings Box */}
                  <Box sx={{ 
                    bgcolor: '#E8F5E9', 
                    p: 1.5, 
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: '1px solid #C8E6C9'
                  }}>
                    <Typography variant="caption" sx={{ color: '#555', display: 'block', mb: 0.5, fontSize: '12px', fontWeight: 500 }}>
                      Bạn tiết kiệm được
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.75 }}>
                      <Typography sx={{ color: '#0D631B', fontWeight: 700, fontSize: '18px' }}>
                        {formatCurrency(packageDetail.value?.savings || 0)}
                      </Typography>
                      <Typography sx={{ color: '#0D631B', fontWeight: 600, fontSize: '13px' }}>
                        ({(((packageDetail.value?.savings || 0) / (packageDetail.value?.total_original_value || 1)) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setConfirmDialog(true)}
                disabled={packageDetail.stock_quantity <= 0}
                sx={{
                  bgcolor: '#0D631B',
                  py: 2.25,
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
                  textTransform: 'uppercase',
                  '&:hover': { 
                    bgcolor: '#0A4A15',
                    boxShadow: '0 6px 16px rgba(13, 99, 27, 0.35)',
                  },
                  '&:disabled': { 
                    bgcolor: '#BDBDBD',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {packageDetail.stock_quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Thêm gói giá vào giỏ hàng?</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {packageDetail.package_name}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Gói này chứa {packageDetail.value?.items_count || 0} sản phẩm
          </Typography>
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2">Giá gộp:</Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#0D631B' }}
            >
              {formatCurrency(packageDetail.package_price)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleAddPackageToCart}
            loading={addingPackageToCart}
            sx={{
              bgcolor: '#0D631B',
              '&:hover': { bgcolor: '#0A4A15' },
            }}
          >
            {addingPackageToCart ? <CircularProgress size={20} /> : 'Thêm vào giỏ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
