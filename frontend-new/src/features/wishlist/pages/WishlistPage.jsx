import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EmptyStateIcon from '@mui/icons-material/BookmarkBorder';
import { useAuth } from '../../../hooks/useAuth';
import { useWishlist } from '../../../hooks/useWishlist';
import { useCart } from '../../../hooks/useCart.jsx';
import { getImageUrl } from '../../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { wishlist, loading, fetchWishlist, removeFromWishlist, error } = useWishlist();
  const { addToCart } = useCart();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    fetchWishlist();
  }, [isLoggedIn]);

  const handleRemoveFromWishlist = async (productId, productName) => {
    try {
      setActionLoading(productId);
      const success = await removeFromWishlist(productId);
      if (success) {
        setMessage(`Đã xóa "${productName}" khỏi wishlist`);
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Lỗi khi xóa sản phẩm');
      setMessageType('error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      setActionLoading(productId);
      await addToCart(productId, 1);
      setMessage(`Đã thêm "${productName}" vào giỏ hàng`);
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Lỗi khi thêm vào giỏ hàng');
      setMessageType('error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%', py: 8, overflowX: 'hidden', bgcolor: '#F7FBF0' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 4, overflowX: 'hidden', bgcolor: '#F7FBF0', overflow: 'hidden' }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#0D631B',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <FavoriteIcon sx={{ fontSize: '32px' }} />
          Danh sách yêu thích
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          {wishlist.length > 0
            ? `Bạn có ${wishlist.length} sản phẩm trong wishlist`
            : 'Wishlist của bạn trống'}
        </Typography>
      </Box>

      {/* Messages */}
      {message && (
        <Alert
          severity={messageType}
          onClose={() => setMessage('')}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: '#F7FBF0',
            border: '2px dashed #BFC2BA',
            borderRadius: '16px',
          }}
        >
          <EmptyStateIcon sx={{ fontSize: '64px', color: '#CCC', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
            Wishlist trống
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
            Hãy thêm những sản phẩm yêu thích của bạn để lưu lại
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#0D631B',
              '&:hover': { backgroundColor: '#094D13' },
            }}
            onClick={() => navigate('/search')}
          >
            Khám phá sản phẩm
          </Button>
        </Paper>
      ) : (
        <>
          {/* Wishlist Items Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {wishlist.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-4px)',
                    },
                    position: 'relative',
                  }}
                >
                  {/* Product Image */}
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#F1F5EB',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/products/${item.product_id}`)}
                  >
                    <CardMedia
                      component="img"
                      image={getImageUrl(item.product.image_url)}
                      alt={item.product.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    {/* Discount Badge */}
                    {item.product.original_price && item.product.current_price < item.product.original_price && (
                      <Chip
                        label={`-${Math.round(
                          ((item.product.original_price - item.product.current_price) /
                            item.product.original_price) *
                            100
                        )}%`}
                        sx={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(252, 130, 12, 0.9)',
                          color: '#5E2C00',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>

                  {/* Product Info */}
                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#0D631B',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => navigate(`/products/${item.product_id}`)}
                    >
                      {item.product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#999',
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.product.description}
                    </Typography>

                    {/* Category & Stock */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={item.product.category}
                        size="small"
                        variant="outlined"
                        sx={{ backgroundColor: '#F7FBF0' }}
                      />
                      <Chip
                        label={`Còn ${item.product.stock_quantity}`}
                        size="small"
                        sx={{
                          backgroundColor:
                            item.product.stock_quantity > 0 ? '#E8F5E9' : '#FFEBEE',
                          color: item.product.stock_quantity > 0 ? '#0D631B' : '#D32F2F',
                        }}
                      />
                    </Stack>

                    {/* Price */}
                    <Box sx={{ mb: 2 }}>
                      {item.product.original_price && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#999',
                            textDecoration: 'line-through',
                            mb: 0.5,
                          }}
                        >
                          ₫{Math.round(item.product.original_price).toLocaleString('vi-VN')}
                        </Typography>
                      )}
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#0D631B',
                          fontWeight: 700,
                        }}
                      >
                        ₫{Math.round(item.product.current_price).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>

                    {/* Added Date */}
                    <Typography variant="caption" sx={{ color: '#CCC' }}>
                      Thêm từ {new Date(item.added_at).toLocaleDateString('vi-VN')}
                    </Typography>
                  </CardContent>

                  {/* Actions */}
                  <Divider />
                  <Stack direction="row" spacing={1} sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      disabled={
                        item.product.stock_quantity === 0 || actionLoading === item.product_id
                      }
                      onClick={() =>
                        handleAddToCart(item.product_id, item.product.name)
                      }
                      sx={{
                        backgroundColor: '#0D631B',
                        '&:hover': { backgroundColor: '#094D13' },
                        '&:disabled': { backgroundColor: '#CCC' },
                      }}
                    >
                      {item.product.stock_quantity === 0 ? 'Hết hàng' : 'Giỏ hàng'}
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleRemoveFromWishlist(item.product_id, item.product.name)
                      }
                      disabled={actionLoading === item.product_id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Summary */}
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#F7FBF0',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  <strong>{wishlist.length}</strong> sản phẩm trong danh sách
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#0D631B',
                    '&:hover': { backgroundColor: '#094D13' },
                  }}
                  onClick={() => navigate('/search')}
                >
                  Tiếp tục mua sắm
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
      </Box>
    </Box>
  );
}
