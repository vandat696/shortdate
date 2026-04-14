import { Box, Typography, Rating } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../services/api';
import { getSupplierDistance } from '../../../utils/distanceUtils';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(product.thumbnail_url || product.image_url);
  const discount = Math.round(
    ((product.original_price - product.current_price) / product.original_price) * 100
  );

  // Calculate distance from user to supplier
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
    product.supplier_latitude,
    product.supplier_longitude
  );

  // Format expiry date
  const formatExpiryDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return null;
    }
  };

  const expiryDate = formatExpiryDate(product.expiry_date);

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
        height: '300px',
        width: '185px',
        flexShrink: 0,
        '&:hover': {
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Image Container — fixed height */}
      <Box
        sx={{
          width: '100%',
          height: '140px',
          flexShrink: 0, 
          position: 'relative',
          backgroundColor: '#E0E4DA',
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : 'linear-gradient(135deg, #EBEFE5 0%, #D9E0D5 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
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
                fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
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

      {/* Content — remaining space after image */}
      <Box
        sx={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Product Name — 2 lines fixed */}
        <Typography
          sx={{
            fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
            fontWeight: 700,
            fontSize: '13px',
            lineHeight: '16px',
            color: '#181D17',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 0,
            minHeight: '32px',
          }}
        >
          {product.name}
        </Typography>

        {/* Star Rating */}
        {product.average_rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: '16px', flexShrink: 0 }}>
            <Rating
              value={Number(product.average_rating) || 0}
              readOnly
              size="small"
              sx={{
                color: '#ffc107',
                '& .MuiRating-icon': { fontSize: '14px' },
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 600,
                fontSize: '9px',
                lineHeight: '12px',
                color: '#666666',
              }}
            >
              ({product.rating_count || 0})
            </Typography>
          </Box>
        )}

        {/* Supplier & Distance */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '16px',
            flexShrink: 0,
            // ✅ minWidth: 0 so flex children can truncate
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {product.supplier_name && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                // ✅ flex: 1 + minWidth: 0 for proper truncate
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <StoreIcon sx={{ fontSize: '11px', color: '#666666', flexShrink: 0 }} />
              <Typography
                sx={{
                  fontFamily: '"Inter",system-ui,sans-serif',
                  fontWeight: 500,
                  fontSize: '9px',
                  lineHeight: '12px',
                  color: '#666666',
                  // ✅ single-line ellipsis
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.supplier_name}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <LocationOnIcon sx={{ fontSize: '11px', color: '#0D631B', flexShrink: 0 }} />
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 500,
                fontSize: '9px',
                lineHeight: '12px',
                color: '#0D631B',
                whiteSpace: 'nowrap',
              }}
            >
              {supplierDistance}
            </Typography>
          </Box>
        </Box>

        {/* Expiry Date */}
        {expiryDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: '14px', flexShrink: 0 }}>
            <CalendarTodayIcon sx={{ fontSize: '11px', color: '#D68800', flexShrink: 0 }} />
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 500,
                fontSize: '9px',
                lineHeight: '12px',
                color: '#D68800',
                whiteSpace: 'nowrap',
              }}
            >
              HSD: {expiryDate}
            </Typography>
          </Box>
        )}

        {/* Description — 2 lines fixed, NO nowrap */}
        {product.description && (
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 400,
              fontSize: '9px',
              lineHeight: '12px',
              color: '#666666',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 0,
              minHeight: '24px',
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Pricing — always at bottom */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            mt: 'auto',  // ✅ push to bottom
            pt: '2px',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#181D17',
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(product.current_price).toLocaleString('vi-VN')}₫
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 400,
              fontSize: '11px',
              lineHeight: '14px',
              textDecoration: 'line-through',
              color: '#BFCCBA',
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(product.original_price).toLocaleString('vi-VN')}₫
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
    description: PropTypes.string,
    current_price: PropTypes.number.isRequired,
    original_price: PropTypes.number.isRequired,
    expiry_date: PropTypes.string,
    supplier_name: PropTypes.string,
    supplier_latitude: PropTypes.number,
    supplier_longitude: PropTypes.number,
    average_rating: PropTypes.number,
    rating_count: PropTypes.number,
  }).isRequired,
};
