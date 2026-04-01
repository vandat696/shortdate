import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { wishlistService } from '../../../services/api';
import { useCart } from '../../../hooks/useCart';

export default function ProductControls({ productId, stock_quantity, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart, fetchCart } = useCart();

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0 && val <= (stock_quantity || 999)) setQuantity(val);
  };

  const handleAddToCart = async () => {
    try {
      if (quantity > (stock_quantity || 0)) {
        alert(`Tồn kho chỉ còn ${stock_quantity} sản phẩm`);
        return;
      }
      
      setLoading(true);
      const success = await addToCart(productId, quantity);
      if (success) {
        onAddToCart?.(quantity);
        // Refetch cart to ensure UI updates
        await fetchCart();
        alert('✓ Đã thêm vào giỏ hàng');
      } else {
        alert('Lỗi: Không thể thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Lỗi: ' + (error?.message || 'Không thể thêm vào giỏ hàng'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      setLoading(true);
      if (isSaved) {
        await wishlistService.removeFromWishlist(productId);
        setIsSaved(false);
        alert('✓ Đã xóa khỏi danh sách lưu');
      } else {
        await wishlistService.addToWishlist(productId);
        setIsSaved(true);
        alert('✓ Đã lưu sản phẩm');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để lưu sản phẩm');
      } else {
        alert('Lỗi: ' + (error.response?.data?.error || 'Không thể lưu sản phẩm'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Quantity Selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 16px',
          backgroundColor: '#E0E4DA',
          borderRadius: '12px',
        }}
      >
        <Button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={loading}
          sx={{
            minWidth: 'auto',
            padding: 0,
            color: '#40493D',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          −
        </Button>
        <TextField
          value={quantity}
          onChange={handleQuantityChange}
          type="number"
          inputProps={{ min: 1 }}
          disabled={loading}
          sx={{
            width: '60px',
            '& .MuiOutlinedInput-root': {
              padding: 0,
              textAlign: 'center',
            },
          }}
        />
        <Button
          onClick={() => setQuantity(quantity + 1)}
          disabled={loading}
          sx={{
            minWidth: 'auto',
            padding: 0,
            color: '#40493D',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          +
        </Button>
      </Box>

      {/* Buttons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Button
          onClick={handleToggleSave}
          disabled={loading}
          variant="contained"
          sx={{
            backgroundColor: isSaved ? '#0D631B' : '#EBEFE5',
            color: isSaved ? '#FFFFFF' : '#40493D',
            fontFamily: '"Manrope","Inter",system-ui,sans-serif',
            fontWeight: 800,
            fontSize: '16px',
            padding: '16px 0',
            borderRadius: '12px',
            display: 'flex',
            gap: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isSaved ? '#0B5717' : '#E5EADF',
            },
          }}
        >
          {isSaved ? '❤️ Thích' : '🤍 Bỏ thích'}
        </Button>
        <Button
          variant="contained"
          onClick={handleAddToCart}
          disabled={loading}
          sx={{
            backgroundColor: '#0D631B',
            color: '#FFFFFF',
            fontFamily: '"Manrope","Inter",system-ui,sans-serif',
            fontWeight: 800,
            fontSize: '16px',
            padding: '16px 0',
            borderRadius: '12px',
            boxShadow: '0px 10px 15px -3px rgba(13, 99, 27, 0.2), 0px 4px 6px -4px rgba(13, 99, 27, 0.2)',
            '&:hover': {
              backgroundColor: '#0B5717',
            },
          }}
        >
          {loading ? 'Đang tải...' : 'Thêm vào giỏ hàng'}
        </Button>
      </Box>
    </Box>
  );
}

ProductControls.propTypes = {
  productId: PropTypes.number.isRequired,
  stock_quantity: PropTypes.number,
  onAddToCart: PropTypes.func,
};
