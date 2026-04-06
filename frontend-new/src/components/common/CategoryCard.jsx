import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function CategoryCard({ icon, label, isFresh = true }) {
  const isFreshCategory = isFresh;
  const bgColor = isFreshCategory ? '#E5EADF' : '#F1F5EB';
  const iconBgColor = isFreshCategory ? '#0D631B' : '#964900';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px',
        height: '131px',
        backgroundColor: bgColor,
        borderRadius: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '21px',
          height: '27px',
          backgroundColor: iconBgColor,
          borderRadius: '4px',
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: '16px', color: bgColor }}>
          {icon}
        </Typography>
      </Box>

      {/* Label */}
      <Typography
        sx={{
          fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '24px',
          textAlign: 'center',
          color: '#181D17',
          mt: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

CategoryCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isFresh: PropTypes.bool,
};
