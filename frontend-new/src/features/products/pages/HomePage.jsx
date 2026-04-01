import { Box, Button, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoriesSection from '../components/CategoriesSection';
import BundlesSection from '../components/BundlesSection';
import LocalProductCard from '../../../components/common/LocalProductCard';
import { productService } from '../../../services/api';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Cà Chua Tươi',
    product_type: 'fresh_product',
    current_price: 25000,
    original_price: 35000,
    stock_quantity: 15,
    category: 'vegetables',
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Gạo Lứt 5kg',
    product_type: 'dry_product',
    current_price: 120000,
    original_price: 150000,
    stock_quantity: 8,
    category: 'grains',
    expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 44 * 60 + 12);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      const productList = response.data?.products || response.data || [];

      if (Array.isArray(productList) && productList.length > 0) {
        setProducts(productList);
        setError(null);
      } else {
        setProducts(FALLBACK_PRODUCTS);
        setError(null);
      }
    } catch (err) {
      setProducts(FALLBACK_PRODUCTS);
      setError('API không khả dụng, hiển thị sản phẩm mẫu');
    } finally {
      setLoading(false);
    }
  };

  const flashSaleProducts = products.slice(0, 4);
  const nearYouProducts = products.slice(0, 8);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Box sx={{ width: '100%', background: '#F7FBF0' }}>
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: 1280,
          px: 0,
          pb: '9px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '48px',
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        <Box sx={{ width: '100%', pt: '96px', display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {/* Hero Section: Editorial Layering */}
          <Box sx={{ width: '100%', px: 3 }}>
            <Box sx={{ width: '100%', height: 500, position: 'relative' }}>
              <Grid container spacing={4} sx={{ height: '100%' }}>
                <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 2, py: 0.5, bgcolor: '#A3F69C', borderRadius: 9999 }}>
                      <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#005312' }}>
                        Có gì mới?
                      </Typography>
                    </Box>

                    <Typography sx={{ mt: 2, fontFamily: '"Manrope","Inter",system-ui,sans-serif', fontWeight: 700, fontSize: { xs: 44, md: 72 }, lineHeight: { xs: '48px', md: '72px' }, letterSpacing: { xs: '-2px', md: '-3.6px' }, color: '#181D17' }}>
                      SALE HÀNG NGÀY
                      <br />
                      SIÊU ƯU ĐÃI
                    </Typography>

                    <Typography sx={{ mt: 2, maxWidth: 448, fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 400, fontSize: 18, lineHeight: '29px', color: '#40493D' }}>
                      Lựa chọn các sản phẩm mà bạn cần với giá rẻ nhất
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={() => navigate('/search?hsd=today&discount=50-80&sort=nearest_expiry')}
                        variant="contained"
                        sx={{ height: 57, px: 4, borderRadius: 3, bgcolor: '#0D631B', color: '#fff', fontSize: 18, fontWeight: 700, '&:hover': { bgcolor: '#0B5717' } }}
                      >
                        SĂN NGAY
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ height: 57, px: 4, borderRadius: 3, bgcolor: '#EBEFE5', color: '#181D17', fontSize: 18, fontWeight: 700, '&:hover': { bgcolor: '#E5EADF' } }}
                      >
                        SHORTDATE là gì?
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={7} sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', inset: 0 }}>
                    <Box sx={{ position: 'absolute', left: -26, right: -9, top: -25, bottom: 0, bgcolor: '#E5EADF', opacity: 0.5, borderRadius: 6, transform: 'rotate(-2deg)' }} />
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 500,
                        borderRadius: 5,
                        overflow: 'hidden',
                        boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
                        background: 'linear-gradient(135deg, #E0E4DA 0%, #A3F69C 55%, #0D631B 100%)',
                      }}
                    />

                    <Box sx={{ position: 'absolute', left: -24, bottom: -24, width: 204, height: 124, bgcolor: '#964900', borderRadius: 4, p: 3, boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                      <Typography sx={{ fontFamily: '"Manrope","Inter",system-ui,sans-serif', fontWeight: 900, fontSize: 36, lineHeight: '40px', color: '#fff' }}>
                        70%
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '-0.7px', textTransform: 'uppercase', color: '#fff', opacity: 0.8 }}>
                        ƯU ĐÃI
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Flash Sale Section */}
          <Box sx={{ width: '100%', bgcolor: '#EBEFE5', py: '64px' }}>
            <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 16, height: 20, bgcolor: '#964900', borderRadius: 1 }} />
                    <Typography sx={{ fontFamily: '"Manrope","Inter",system-ui,sans-serif', fontWeight: 800, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.75px', textTransform: 'uppercase', color: '#181D17' }}>                      
                      FLASH SALE                  
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '24px', color: '#40493D' }}>
                    Sale mạnh sản phẩm khác trong vòng 24 giờ.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, bgcolor: '#FFDCC6', border: '1px solid rgba(150, 73, 0, 0.1)', borderRadius: 9999 }}>
                  <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.7px', textTransform: 'uppercase', color: '#311300' }}>
                    Kết Thúc Trong:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {[hh, mm, ss].map((part, idx) => (
                      <Box key={`${part}-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ px: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                          <Typography sx={{ fontFamily: '"Liberation Mono",monospace', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#5E2C00' }}>
                            {part}
                          </Typography>
                        </Box>
                        {idx < 2 && (
                          <Typography sx={{ fontFamily: '"Liberation Mono",monospace', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#5E2C00' }}>
                            :
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
                  {error}
                </Typography>
              ) : flashSaleProducts.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                  Không có sản phẩm nào
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {flashSaleProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>

          {/* Categories Section */}
          <CategoriesSection />

          {/* Bundles Section */}
          <BundlesSection />

          {/* Near You Section - Enhanced */}
          <Box sx={{ width: '100%', px: 3, py: '128px' }}>
            <Container maxWidth={false} sx={{ maxWidth: 1280, px: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#2E7D32',
                    borderRadius: '9999px',
                  }}
                >
                  <Typography sx={{ fontSize: '24px' }}>🚀</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Manrope","Inter",system-ui,sans-serif', fontWeight: 800, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.75px', color: '#181D17' }}>
                    Sản phẩm quanh bạn
                  </Typography>
                  <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '24px', color: '#40493D', mt: 0.5 }}>
                    CHỈ mất 2 TIẾNG giao hàng
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  {/* Map Placeholder */}
                  <Box
                    sx={{
                      height: '400px',
                      backgroundColor: '#E0E4DA',
                      borderRadius: '32px',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: '48px' }}>🗺️</Typography>
                    <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 700, fontSize: 16, lineHeight: '24px', color: '#181D17', textAlign: 'center' }}>
                      📍 Vị trí của bạn
                    </Typography>

                    {/* Gradient Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
                      }}
                    />

                    {/* Location Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '24px',
                        left: '24px',
                        right: '24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '24px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        zIndex: 10,
                      }}
                    >
                      <Typography sx={{ fontSize: '16px' }}>📍</Typography>
                      <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 700, fontSize: 14, lineHeight: '20px', color: '#181D17' }}>
                        Cách 1.2 km
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    {nearYouProducts.slice(0, 4).map((product, idx) => (
                      <Grid item xs={12} key={`near-${idx}`}>
                        <LocalProductCard
                          image=""
                          category={product.category || 'Fresh'}
                          name={product.name}
                          price={product.current_price}
                          discount={Math.round(((product.original_price - product.current_price) / product.original_price) * 100)}
                          delivery="Trong 4 giờ"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
