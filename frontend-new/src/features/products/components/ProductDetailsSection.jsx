import { Box, Button, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductDetailsSection() {
  const [activeTab, setActiveTab] = useState('overview');

  const relatedProducts = [
    {
      id: 101,
      name: 'Organic Cheese Wheels',
      category: 'Dairy',
      current_price: 12.99,
      original_price: 18.99,
    },
    {
      id: 102,
      name: 'Fresh Sourdough Loaf',
      category: 'Bakery',
      current_price: 4.99,
      original_price: 7.99,
    },
    {
      id: 103,
      name: 'Premium Grass-Fed Butter',
      category: 'Dairy',
      current_price: 8.99,
      original_price: 12.99,
    },
    {
      id: 104,
      name: 'Mixed Berry Preserves',
      category: 'Pantry',
      current_price: 6.99,
      original_price: 10.99,
    },
  ];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Tabs Section */}
      <Box
        sx={{
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(191, 202, 186, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
            fontWeight: 900,
            fontSize: '30px',
            lineHeight: '36px',
            letterSpacing: '-1.5px',
            color: '#181D17',
          }}
        >
          Chi Tiết
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {['Tổng Quan', 'Thông Số', 'Bình Luận'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: '20px',
                color: activeTab === tab.toLowerCase() ? '#0D631B' : '#707A6C',
                textTransform: 'none',
                padding: 0,
                paddingBottom: '4px',
                borderBottom: activeTab === tab.toLowerCase() ? '2px solid #0D631B' : 'none',
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Content Cards - Bento Grid */}
      {activeTab === 'overview' && (
        <Grid container spacing={3}>
          {/* Review Card */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                padding: '32px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#A3F69C',
                    borderRadius: '9999px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '18px',
                  }}
                >
                  S
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#181D17',
                    }}
                  >
                    Sarah M.
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Inter",system-ui,sans-serif',
                      fontWeight: 400,
                      fontSize: '10px',
                      lineHeight: '15px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: '#707A6C',
                    }}
                  >
                    Verified Buyer
                  </Typography>
                </Box>
              </Box>

              {/* Review Text */}
              <Typography
                sx={{
                  fontFamily: '"Inter",system-ui,sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '23px',
                  color: '#40493D',
                }}
              >
                "Arrived within 3 hours. Packaging was perfectly chilled. The yogurt tasted better than the 'fresh' stuff I get at my local grocer. Highly recommend!"
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#964900',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Info Cards - Bento */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Planet Impact */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    padding: '24px',
                    backgroundColor: '#EBEFE5',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box sx={{ fontSize: '24px' }}>🌍</Box>
                  <Typography
                    sx={{
                      fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                      fontWeight: 800,
                      fontSize: '18px',
                      lineHeight: '28px',
                      letterSpacing: '-0.45px',
                      color: '#181D17',
                    }}
                  >
                    Planet Impact
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Inter",system-ui,sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: '#40493D',
                    }}
                  >
                    By purchasing this, you've diverted 1.2kg of CO2e and saved 500g of high-quality dairy from landfill.
                  </Typography>
                </Box>
              </Grid>

              {/* Smart Saver */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    padding: '24px',
                    backgroundColor: '#FFDCC6',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box sx={{ fontSize: '24px' }}>💰</Box>
                  <Typography
                    sx={{
                      fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                      fontWeight: 800,
                      fontSize: '18px',
                      lineHeight: '28px',
                      letterSpacing: '-0.45px',
                      color: '#181D17',
                    }}
                  >
                    Smart Saver
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Inter",system-ui,sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '15px',
                      color: '#723600',
                    }}
                  >
                    This item is currently at its 2nd price floor. Next drop in: 04:22:15.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 'specs' && (
        <Box sx={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
          <Typography sx={{ color: '#707A6C' }}>Specification details coming soon</Typography>
        </Box>
      )}

      {activeTab === 'reviews' && (
        <Box sx={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
          <Typography sx={{ color: '#707A6C' }}>More reviews coming soon</Typography>
        </Box>
      )}

      {/* Related Products Section */}
      <Box sx={{ marginTop: 4 }}>
        <Typography
          sx={{
            fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '-1.2px',
            color: '#181D17',
            mb: 3,
          }}
        >
          Near-expiry deals you might like
        </Typography>

        <Grid container spacing={3}>
          {relatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
