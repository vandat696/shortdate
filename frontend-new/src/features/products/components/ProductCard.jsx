import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../services/api';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(product.thumbnail_url || product.image_url);
  const discount = Math.round(
    ((product.original_price - product.current_price) / product.original_price) * 100
  );

  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          width: '100%',
          paddingBottom: '100%',
          position: 'relative',
          backgroundColor: '#E0E4DA',
          overflow: 'hidden',
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #EBEFE5 0%, #D9E0D5 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: (product.thumbnail_url || product.image_url) ? 'transparent' : '#E0E4DA',
            backgroundImage: (product.thumbnail_url || product.image_url) ? 'none' : 'linear-gradient(135deg, #EBEFE5 0%, #D9E0D5 100%)',
          }}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 12px',
              backgroundColor: '#FFDCC6',
              borderRadius: '9999px',
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Manrope","Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#311300',
              }}
            >
              -{discount}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
        }}
      >
        {/* Category */}
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 600,
            fontSize: '10px',
            lineHeight: '14px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#964900',
          }}
        >
          {product.category}
        </Typography>

        {/* Product Name */}
        <Typography
          sx={{
            fontFamily: '"Manrope","Inter",system-ui,sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#181D17',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>

        {/* Pricing */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 'auto' }}>
          <Typography
            sx={{
              fontFamily: '"Manrope","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#181D17',
            }}
          >
            ${product.current_price}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              textDecoration: 'line-through',
              color: '#BFCCBA',
            }}
          >
            ${product.original_price}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    current_price: PropTypes.number.isRequired,
    original_price: PropTypes.number.isRequired,
  }).isRequired,
};
