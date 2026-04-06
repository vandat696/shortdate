import { Box, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
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

export default function AllProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    distances: [],
    priceRange: [0, 1000000],
    expiry: [],
  });

  // Listen for filter menu toggle event from Header
  useEffect(() => {
    const handleFilterMenuToggle = () => {
      setFilterOpen(prev => !prev);
    };

    window.addEventListener('filterMenuToggle', handleFilterMenuToggle);
    return () => window.removeEventListener('filterMenuToggle', handleFilterMenuToggle);
  }, []);

  // Load filters from query params on mount
  useEffect(() => {
    const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
    const minPrice = parseInt(searchParams.get('minPrice')) || 0;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || 1000000;
    const expiry = searchParams.get('expiry') ? searchParams.get('expiry').split(',') : [];

    if (categories.length > 0 || minPrice > 0 || maxPrice < 1000000 || expiry.length > 0) {
      setFilters({
        categories,
        distances: [],
        priceRange: [minPrice, maxPrice],
        expiry,
      });
    }
  }, [searchParams]);

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

  // Filter products based on selected filters
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filter by category
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false;
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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    // Update query params when filters change
    const params = new URLSearchParams();
    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    }
    if (newFilters.priceRange[0] > 0) {
      params.set('minPrice', newFilters.priceRange[0]);
    }
    if (newFilters.priceRange[1] < 1000000) {
      params.set('maxPrice', newFilters.priceRange[1]);
    }
    if (newFilters.expiry.length > 0) {
      params.set('expiry', newFilters.expiry.join(','));
    }

    setSearchParams(params);
  };

  const filteredProducts = getFilteredProducts();

  return (
    <Box sx={{ width: '100%', background: '#F7FBF0', minHeight: '100vh' }}>
      {/* Filter Sidebar */}
      <FilterSidebar 
        open={filterOpen} 
        onClose={() => setFilterOpen(false)}
        onFilterChange={handleFilterChange}
        filters={filters}
      />

      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: 1280,
          px: 3,
          pb: '48px',
          pt: '96px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        {/* Header with filter count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 16, height: 20, bgcolor: '#964900', borderRadius: 1 }} />
            <Typography sx={{ fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif', fontWeight: 800, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.75px', textTransform: 'uppercase', color: '#181D17' }}>
              TẤT CẢ SẢN PHẨM
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 16, color: '#40493D' }}>
            {filteredProducts.length > 0 ? `${filteredProducts.length} sản phẩm` : 'Không có sản phẩm'}
          </Typography>
        </Box>

        {/* Active Filters Display */}
        {(filters.categories.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 || filters.expiry.length > 0) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 14, color: '#40493D' }}>
              Lọc hoạt động:
            </Typography>
            {filters.categories.map(cat => (
              <Box key={cat} sx={{ px: 2, py: 0.5, bgcolor: '#A3F69C', borderRadius: 9999 }}>
                <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 12, color: '#005312' }}>
                  {cat}
                </Typography>
              </Box>
            ))}
            {filters.expiry.length > 0 && (
              <Box sx={{ px: 2, py: 0.5, bgcolor: '#FDD835', borderRadius: 9999 }}>
                <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 500, fontSize: 12, color: '#6D4C00' }}>
                  HSD: {filters.expiry.join('/')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Products Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 6 }}>
            {error}
          </Typography>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontSize: 18, color: '#666', mb: 2 }}>
              Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn
            </Typography>
            <Typography sx={{ fontFamily: '"Inter",system-ui,sans-serif', fontSize: 14, color: '#999' }}>
              Thử thay đổi bộ lọc để tìm thêm sản phẩm
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
