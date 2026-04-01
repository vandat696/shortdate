import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { getImageUrl } from '../../services/api';

export default function LocalProductCard({ image, category, name, price, discount, delivery }) {
  const imageUrl = getImageUrl(image);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px',
        gap: '24px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        },
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
            ${price}
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
  image: PropTypes.string,
  category: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
  delivery: PropTypes.string.isRequired,
};

LocalProductCard.defaultProps = {
  image: '',
};
