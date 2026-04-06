import { Box, LinearProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function FreshnessIndicator({ currentPrice, originalPrice, expiryDate, freshnessPercentage }) {
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const freshness = freshnessPercentage || 88;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Pricing Box */}
      <Box
        sx={{
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E5EADF',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
          {/* Current Price */}
          <Box>
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: '#964900',
                mb: 1,
              }}
            >
              Giá Thông Minh Hiện Tại
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                  fontWeight: 800,
                  fontSize: '48px',
                  lineHeight: '48px',
                  letterSpacing: '-2.4px',
                  color: '#181D17',
                }}
              >
                {Math.round(currentPrice).toLocaleString('vi-VN')}₫
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter",system-ui,sans-serif',
                  fontWeight: 400,
                  fontSize: '20px',
                  lineHeight: '28px',
                  textDecoration: 'line-through',
                  color: '#707A6C',
                }}
              >
                {Math.round(originalPrice).toLocaleString('vi-VN')}₫
              </Typography>
            </Box>
          </Box>

          {/* Discount Badge */}
          <Box
            sx={{
              padding: '4px 12px',
              backgroundColor: '#FFDCC6',
              borderRadius: '9999px',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#311300',
              }}
            >
              -{discount}%
            </Typography>
          </Box>
        </Box>

        {/* Auto-Pricing Info */}
        <Box
          sx={{
            padding: '12px 16px',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            border: '1px solid rgba(13, 99, 27, 0.05)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box sx={{ width: '16px', height: '10px', backgroundColor: '#0D631B', mt: 0.5 }} />
          <Box>
            <Typography
              sx={{
                fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#0D631B',
                mb: 0.5,
              }}
            >
              Tự động định giá
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 400,
                fontSize: '10px',
                lineHeight: '12px',
                color: '#40493D',
              }}
            >
              Giá giảm mỗi 6 giờ!
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Freshness & Expiry */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              textTransform: 'uppercase',
              color: '#181D17',
            }}
          >
            Độ tươi
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 700,
              fontSize: '12px',
              lineHeight: '16px',
              textTransform: 'uppercase',
              color: '#0D631B',
            }}
          >
            {freshness}%
          </Typography>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={freshness}
          sx={{
            height: '12px',
            borderRadius: '9999px',
            backgroundColor: '#E0E4DA',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#0D631B',
              boxShadow: '0px 0px 12px rgba(13, 99, 27, 0.3)',
            },
          }}
        />
      </Box>

      {/* Use By Date & Guaranteed Fresh */}
      <Box sx={{ display: 'flex', gap: 2.5 }}>
        {/* Use By Date */}
        <Box
          sx={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#EBEFE5',
            border: '1px solid rgba(13, 99, 27, 0.15)',
            borderRadius: '16px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ fontSize: '16px' }}>📅</Box>
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 600,
                fontSize: '10px',
                lineHeight: '15px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#40493D',
              }}
            >
              Ngày Hết Hạn
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#181D17',
            }}
          >
            {expiryDate || 'Oct 24, 2024'}
          </Typography>
        </Box>

        {/* Guaranteed Fresh */}
        <Box
          sx={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#F0F8ED',
            border: '2px solid #0D631B',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ fontSize: '16px' }}>✓</Box>
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 600,
                fontSize: '10px',
                lineHeight: '15px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#0D631B',
              }}
            >
              Độ tươi mới
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#0D631B',
            }}
          >
            Đạt chuẩn tươi mới
          </Typography>
        </Box>
      </Box>

      {/* Delivery */}
      <Box
        sx={{
          padding: '16px',
          backgroundColor: '#F1F5EB',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: '48px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
          }}
        >
          🚚
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#181D17',
              mb: 0.5,
            }}
          >
            Giao hàng trong 4 tiếng
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#707A6C',
            }}
          >
            Hyper-local Same-Day Delivery Available
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

FreshnessIndicator.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  originalPrice: PropTypes.number.isRequired,
  expiryDate: PropTypes.string,
  freshnessPercentage: PropTypes.number,
};

FreshnessIndicator.defaultProps = {
  expiryDate: 'Oct 24, 2024',
  freshnessPercentage: 88,
};
