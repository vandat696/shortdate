import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PACKAGE_TYPES = [
  {
    id: 'mini',
    title: 'Túi Mini',
    priceRange: 'Dưới 49.999đ',
    minPrice: 0,
    maxPrice: 49999,
    description: 'Dành cho cá nhân, sinh viên, người muốn thử/trải nghiệm',
    benefits: 'Cam kết giá tốt của sản phẩm thương từ 35.000đ - 70.000',
    bgColor: '#E0E4DA',
    borderColor: '#0D631B',
  },
  {
    id: 'standard',
    title: 'Túi tiêu chuẩn',
    priceRange: '50.000 - 99.000 đ',
    minPrice: 50000,
    maxPrice: 99000,
    description: 'Dành cho 1-2 người',
    benefits: 'Cam kết giá từ 100.000đ - 200.000đ',
    bgColor: '#A3F69C',
    borderColor: '#0D631B',
  },
  {
    id: 'family',
    title: 'Túi gia đình',
    priceRange: '100.000 - 249.999 đ',
    minPrice: 100000,
    maxPrice: 249999,
    description: 'Dành cho gia đình 3-4 người',
    benefits: 'Cam kết giá từ 300.000đ - 350.000đ',
    bgColor: '#FFDCC6',
    borderColor: '#964900',
  },
  {
    id: 'premium',
    title: 'Túi Premium',
    priceRange: 'Trên 250.000đ',
    minPrice: 250000,
    maxPrice: 299000,
    description: 'Cam kết giá trị thực > 500k',
    benefits: 'Gồm nhiều món trong ngày',
    bgColor: '#2D322B',
    borderColor: '#A3F69C',
    textColor: '#FFFFFF',
  },
];

export default function PricingPackageCategories() {
  const navigate = useNavigate();

  const handleSelectCategory = (category) => {
    // Navigate to packages list filtered by price range
    navigate(`/pricing-packages?minPrice=${category.minPrice}&maxPrice=${category.maxPrice}&type=${category.id}`);
  };

  return (
    <Box sx={{ width: '100%', px: 3, py: '64px', bgcolor: '#F7FBF0' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: 36,
              lineHeight: '40px',
              letterSpacing: '-0.9px',
              color: '#181D17',
              mb: 2,
            }}
          >
            Các gói ưu đãi
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Chọn gói phù hợp với nhu cầu của bạn
          </Typography>
        </Box>

        {/* Package Categories Grid - Fixed layout (4 items per row) */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 3,
            '@media (max-width: 1200px)': {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          {PACKAGE_TYPES.map((pkg) => (
            <Card
              key={pkg.id}
              sx={{
                height: 280,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: pkg.bgColor,
                border: `2px solid ${pkg.borderColor}`,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => handleSelectCategory(pkg)}
            >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {/* Icon & Title */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 32,
                        mb: 1,
                      }}
                    >
                      {pkg.icon}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: 24,
                        lineHeight: '28px',
                        color: pkg.textColor || '#181D17',
                        mb: 1,
                      }}
                    >
                      {pkg.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: 16,
                        lineHeight: '20px',
                        color: pkg.textColor || '#0D631B',
                      }}
                    >
                      {pkg.priceRange}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: pkg.textColor || '#40493D',
                        mb: 1.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {pkg.description}
                    </Typography>

                    {/* Benefits */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: pkg.textColor || '#66706B',
                        display: 'block',
                        lineHeight: 1.5,
                      }}
                    >
                      {pkg.benefits}
                    </Typography>
                  </Box>

                  {/* Button */}
                  <Button
                    variant="contained"
                    onClick={() => handleSelectCategory(pkg)}
                    sx={{
                      mt: 'auto',
                      bgcolor: pkg.textColor ? '#A3F69C' : '#0D631B',
                      color: pkg.textColor ? '#181D17' : '#FFFFFF',
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: pkg.textColor ? '#8FDF8B' : '#0A4A15',
                      },
                    }}
                  >
                    Xem gói
                  </Button>
                </CardContent>
              </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
