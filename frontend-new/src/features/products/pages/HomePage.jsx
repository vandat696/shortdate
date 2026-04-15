import { Box, Button, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSalesCarousel from '../components/HeroSalesCarousel';
import CategoriesSection from '../components/CategoriesSection';
import PricingPackageCategories from '../components/PricingPackageCategories';
import NearYouMap from '../components/NearYouMap';
import FilterSidebar from '../../../components/common/FilterSidebar';
import { productService } from '../../../services/api';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Cà Chua Tươi',
    product_type: 'fresh_product',
    current_price: 25000,
    original_price: 35000,
    stock_quantity: 15,
    categories: [{ id: 1, name: 'Rau quả tươi', icon: '🥬' }],
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Gạo Lứt 5kg',
    product_type: 'dry_product',
    current_price: 120000,
    original_price: 150000,
    stock_quantity: 8,
    categories: [{ id: 2, name: 'Thực phẩm khô', icon: '🌾' }],
    expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 44 * 60 + 12);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    distances: [],
    priceRange: [0, 1000000],
    expiry: [],
  });

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Listen for filter menu toggle event from Header
  useEffect(() => {
    const handleFilterMenuToggle = () => {
      setFilterOpen(prev => !prev);
    };

    window.addEventListener('filterMenuToggle', handleFilterMenuToggle);
    return () => window.removeEventListener('filterMenuToggle', handleFilterMenuToggle);
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

  // Filter products based on selected filters
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filter by category - check if product has any of the selected categories
      if (filters.categories.length > 0) {
        const productCategoryNames = (product.categories || []).map(cat => cat.name || cat);
        const hasMatchingCategory = filters.categories.some(selectedCategory =>
          productCategoryNames.includes(selectedCategory)
        );
        if (!hasMatchingCategory) return false;
      }

      // Filter by price range
      if (product.current_price < filters.priceRange[0] || product.current_price > filters.priceRange[1]) {
        return false;
      }

      // Filter by expiry date
      if (filters.expiry.length > 0) {
        const expiryDate = new Date(product.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

        const isMatch = filters.expiry.some(type => {
          switch (type) {
            case 'today':
              return daysUntilExpiry === 0;
            case '3days':
              return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
            case '7days':
              return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
            case '14days':
              return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
            default:
              return true;
          }
        });

        if (!isMatch) return false;
      }

      return true;
    });
  };

  const filteredProducts = getFilteredProducts();

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Box sx={{ width: '100%', background: '#F7FBF0', overflowX: 'hidden' }}>
      {/* Filter Sidebar */}
      <FilterSidebar 
        open={filterOpen} 
        onClose={() => setFilterOpen(false)}
        onFilterChange={setFilters}
        filters={filters}
      />

      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: 1280,
          px: 3,
          pb: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '48px',
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        <Box sx={{ width: '100%', pt: '96px', display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {/* Hero Section */}
          <Box sx={{ width: '100%', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: { xs: '100%', md: '50%' }, height: 450, zIndex: 100 }}>
              <HeroSalesCarousel products={products} />
            </Box>

            <Box sx={{ width: '100%', height: 450, position: 'relative', zIndex: 1 }}>
              <Grid container spacing={4} sx={{ height: '100%' }}>
                <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 2, py: 0.5, bgcolor: '#A3F69C', borderRadius: 9999 }}>
                      <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#005312' }}>
                        Có gì mới?
                      </Typography>
                    </Box>

                    <Typography sx={{ mt: 2, fontFamily: '"Myriad Condensed","Inter",system-ui,sans-serif', fontWeight: 700, fontSize: { xs: 44, md: 72 }, lineHeight: { xs: '48px', md: '72px' }, letterSpacing: { xs: '-2px', md: '-3.6px' }, color: '#181D17' }}>
                      SALE HÀNG NGÀY
                      <br />
                      SIÊU ƯU ĐÃI
                    </Typography>

                    <Typography sx={{ mt: 2, maxWidth: 448, fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 400, fontSize: 18, lineHeight: '29px', color: '#40493D' }}>
                      Lựa chọn các sản phẩm mà bạn cần với giá rẻ nhất
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={() => navigate('/products')}
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

                <Grid item xs={12} md={7} />
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
                    <Typography sx={{ fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif', fontWeight: 800, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.75px', textTransform: 'uppercase', color: '#181D17' }}>                      
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

          {/* Pricing Package Categories Section */}
          <PricingPackageCategories />

          {/* Near You Section - Map View */}
          <Box sx={{ width: '100%', py: '128px' }}>
            <Container maxWidth={false} sx={{ maxWidth: 1280, px: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
                <Typography sx={{ fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif', fontWeight: 800, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.75px', color: '#181D17' }}>
                  Sản phẩm quanh bạn
                </Typography>
              </Box>
              <NearYouMap />
            </Container>
          </Box>

          {/* All Products Section with Filter */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 16, height: 20, bgcolor: '#964900', borderRadius: 1 }} />
              <Typography sx={{ fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif', fontWeight: 800, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.75px', textTransform: 'uppercase', color: '#181D17' }}>
                TẤT CẢ SẢN PHẨM
              </Typography>
              <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 16, color: '#40493D', ml: 2 }}>
                {filteredProducts.length > 0 ? `${filteredProducts.length} sản phẩm` : 'Không có sản phẩm'}
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
                {error}
              </Typography>
            ) : filteredProducts.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 8, color: '#666', fontSize: 16 }}>
                Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={3} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
