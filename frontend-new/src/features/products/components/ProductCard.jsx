import { Box, Card, CardMedia, CardContent, Typography, Button, IconButton, Badge } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const discountPercentage = product.discount_percentage || 10;
  const daysToExpiry = Math.ceil(Math.random() * 30); // Mock data

  return (
    <Card
      sx={{
        maxWidth: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Image Container */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image || 'https://via.placeholder.com/280x200?text=' + product.name}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />

        {/* Discount Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#FF5252',
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          -{discountPercentage}%
        </Box>

        {/* Expiry Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: '#FF9800',
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {daysToExpiry}d
        </Box>

        {/* Favorite Button */}
        <IconButton
          onClick={() => setIsFavorited(!isFavorited)}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': { backgroundColor: '#FFFFFF' },
          }}
        >
          {isFavorited ? (
            <Favorite sx={{ color: '#FF5252' }} />
          ) : (
            <FavoriteBorder sx={{ color: '#757575' }} />
          )}
        </IconButton>
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {product.name}
        </Typography>

        <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.85rem', mb: 1 }}>
          {product.description || 'Sản phẩm tươi ngon chất lượng'}
        </Typography>

        {/* Price */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: '#4CAF50', fontWeight: 700, fontSize: '1.1rem' }}
          >
            ₫{product.current_price?.toLocaleString('vi-VN')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textDecoration: 'line-through',
              color: '#BDBDBD',
              fontSize: '0.9rem',
            }}
          >
            ₫{product.original_price?.toLocaleString('vi-VN')}
          </Typography>
        </Box>

        {/* Stock */}
        <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
          Còn {product.stock || 12} sản phẩm
        </Typography>
      </CardContent>

      {/* Add To Cart Button */}
      <Button
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          fontWeight: 600,
          py: 0.8,
          '&:hover': { backgroundColor: '#45a049' },
        }}
        onClick={() => onAddToCart && onAddToCart(product, quantity)}
      >
        Thêm Giỏ
      </Button>
    </Card>
  );
}
