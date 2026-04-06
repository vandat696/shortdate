import { Box, Typography, Container, Grid } from '@mui/material';
import BundleCard from '../../../components/common/BundleCard';

export default function BundlesSection() {
  const bundles = [
    {
      id: 'mini',
      title: 'Gói Nhỏ',
      description: 'Tốt cho sức khỏe',
      price: 19,
      bgColor: '#E0E4DA',
      imageBg: 'linear-gradient(135deg, #A3F69C 0%, #0D631B 100%)',
    },
    {
      id: 'standard',
      title: 'Gói Chuẩn',
      description: 'Phục vụ gia đình',
      price: 49,
      bgColor: '#A3F69C',
      imageBg: 'linear-gradient(135deg, #E5EADF 0%, #A3F69C 100%)',
    },
    {
      id: 'family',
      title: 'Gói Gia Đình',
      description: 'Tùy chọn cho gia đình lớn',
      price: 59,
      bgColor: '#FFDCC6',
      imageBg: 'linear-gradient(135deg, #964900 0%, #FFDCC6 100%)',
    },
    {
      id: 'premium',
      title: 'Gói Hàng Cao Cấp',
      description: 'Các mốn sang trọng và đặc sản nhấp khẩu.',
      price: 89,
      bgColor: '#2D322B',
      imageBg: 'linear-gradient(135deg, #A3F69C 0%, #0D631B 100%)',
      isPremium: true,
    },
  ];

  return (
    <Box sx={{ width: '100%', px: 3, py: '64px', bgcolor: '#F7FBF0' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Typography
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 800,
              fontSize: 36,
              lineHeight: '40px',
              letterSpacing: '-0.9px',
              color: '#181D17',
            }}
          >
            Gói Sinh Thái
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'rgba(252, 130, 12, 0.2)',
              borderRadius: '8px',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: 14,
                lineHeight: '20px',
                color: '#5E2C00',
              }}
            >
              🔥 Ưu đãi giới hạn!!
            </Typography>
          </Box>
        </Box>

        {/* Bundles Grid - Bento Layout */}
        <Grid container spacing={3}>
          {/* Mini Bundle - Small */}
          <Grid item xs={12} sm={6} md={3}>
            <BundleCard
              title={bundles[0].title}
              description={bundles[0].description}
              price={bundles[0].price}
              bgColor={bundles[0].bgColor}
              imageBg={bundles[0].imageBg}
            />
          </Grid>

          {/* Standard & Family - Larger */}
          <Grid item xs={12} sm={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <BundleCard
                  title={bundles[1].title}
                  description={bundles[1].description}
                  price={bundles[1].price}
                  bgColor={bundles[1].bgColor}
                  imageBg={bundles[1].imageBg}
                />
              </Grid>
              <Grid item xs={6}>
                <BundleCard
                  title={bundles[2].title}
                  description={bundles[2].description}
                  price={bundles[2].price}
                  bgColor={bundles[2].bgColor}
                  imageBg={bundles[2].imageBg}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Premium Bundle - Small */}
          <Grid item xs={12} sm={6} md={3}>
            <BundleCard
              title={bundles[3].title}
              description={bundles[3].description}
              price={bundles[3].price}
              bgColor={bundles[3].bgColor}
              imageBg={bundles[3].imageBg}
              isPremium={bundles[3].isPremium}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
