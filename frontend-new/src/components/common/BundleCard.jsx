import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function BundleCard({ title, description, price, bgColor, imageBg, isPremium = false }) {
  const textColor = isPremium ? '#EEF2E8' : '#181D17';
  const subtitleColor = isPremium ? '#EEF2E8' : '#181D17';
  const priceColor = isPremium ? '#A3F69C' : '#0D631B';
  const buttonBg = isPremium ? '#A3F69C' : '#0D631B';
  const buttonText = isPremium ? '#002204' : '#FFFFFF';
  const buttonFontWeight = isPremium ? 900 : 700;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Background Image Overlay */}
      <Box
        sx={{
          position: 'absolute',
          right: '-16px',
          top: 0,
          bottom: 0,
          width: '192px',
          background: imageBg,
          borderRadius: '24px',
          zIndex: 0,
          opacity: 0.3,
        }}
      />

      {/* Blur Overlay for Premium */}
      {isPremium && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '128px',
            height: '128px',
            background: 'rgba(13, 99, 27, 0.2)',
            filter: 'blur(32px)',
            zIndex: 2,
          }}
        />
      )}

      {/* Top Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          sx={{
            fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '32px',
            color: textColor,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: subtitleColor,
            opacity: isPremium ? 0.6 : 0.7,
            maxWidth: '320px',
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Bottom Content */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '32px',
            color: priceColor,
          }}
        >
          {Math.round(price).toLocaleString('vi-VN')}₫
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: buttonBg,
            color: buttonText,
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: buttonFontWeight,
            fontSize: '16px',
            lineHeight: '24px',
            textAlign: 'center',
            padding: '12px 0',
            borderRadius: '24px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: isPremium ? '#8FE68F' : '#0B5717',
            },
          }}
        >
          Thêm vào giỏ
        </Button>
      </Box>
    </Box>
  );
}

BundleCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  bgColor: PropTypes.string.isRequired,
  imageBg: PropTypes.string,
  isPremium: PropTypes.bool,
};

BundleCard.defaultProps = {
  imageBg: '#E5EADF',
  isPremium: false,
};
