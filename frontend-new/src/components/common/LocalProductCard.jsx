import { Box, Typography } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/api';
import { getSupplierDistance } from '../../utils/distanceUtils';

export default function LocalProductCard({ 
  productId, 
  image, 
  category, 
  name, 
  price, 
  discount, 
  delivery,
  supplierName,
  supplierLatitude,
  supplierLongitude
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  // Tính khoảng cách từ user đến supplier
  const userLocation = (() => {
    try {
      const loc = localStorage.getItem('userLocation');
      return loc ? JSON.parse(loc) : null;
    } catch {
      return null;
    }
  })();

  const supplierDistance = getSupplierDistance(
    userLocation,
    supplierLatitude,
    supplierLongitude
  );

  const imageUrl = getImageUrl(image);
  
  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px',
        gap: '24px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
        cursor: productId ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': productId ? {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        } : {},
      }}
    >
      {/* Product Image */}
      <Box
        sx={{
          width: '96px',
          height: '96px',
          backgroundColor: '#E5EADF',
          borderRadius: '24px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {/* Category */}
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#FC820C',
            textTransform: 'uppercase',
          }}
        >
          {category}
        </Typography>

        {/* Product Name */}
        <Typography
          sx={{
            fontFamily: '"Manrope","Inter",system-ui,sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '22px',
            color: '#181D17',
          }}
        >
          {name}
        </Typography>

        {/* Supplier Name */}
        {supplierName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StoreIcon sx={{ fontSize: '12px', color: '#666666' }} />
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#666666',
              }}
            >
              {supplierName}
            </Typography>
          </Box>
        )}

        {/* Distance */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOnIcon sx={{ fontSize: '12px', color: '#0D631B' }} />
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#0D631B',
            }}
          >
            {supplierDistance}
          </Typography>
        </Box>

        {/* Price & Discount */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 900,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#0D631B',
            }}
          >
            {price.toLocaleString('vi-VN')}₫
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              borderRadius: '4px',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: '10px',
                lineHeight: '15px',
                color: '#0D631B',
                textTransform: 'uppercase',
              }}
            >
              {discount}% OFF
            </Typography>
          </Box>
        </Box>

        {/* Delivery Badge */}
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#0D631B',
            opacity: 0.7,
          }}
        >
          🚚 {delivery}
        </Typography>
      </Box>
    </Box>
  );
}

LocalProductCard.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  category: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
  delivery: PropTypes.string.isRequired,
  supplierName: PropTypes.string,
  supplierLatitude: PropTypes.number,
  supplierLongitude: PropTypes.number,
};

LocalProductCard.defaultProps = {
  image: '',
  supplierName: '',
  supplierLatitude: null,
  supplierLongitude: null,
};
