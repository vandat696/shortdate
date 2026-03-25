import { Box, Button, Container, Grid, Pagination, Typography, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productService } from '../../../services/api';

// Fallback mockup products (xóa sau khi API hoạt động)
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('[HomePage] Fetching products from /products/all...');
      const response = await productService.getAll();
      console.log('[HomePage] Response:', response);
      // API returns { total, offset, limit, products: [...] }
      const productList = response.data?.products || response.data || [];
      console.log('[HomePage] Product list:', productList);
      
      if (Array.isArray(productList) && productList.length > 0) {
        setProducts(productList);
        setError(null);
      } else {
        console.log('[HomePage] No products, using fallback');
        setProducts(FALLBACK_PRODUCTS);
        setError(null);
      }
    } catch (err) {
      console.error('[HomePage] Error:', err);
      console.error('[HomePage] Error response:', err.response?.data);
      console.error('[HomePage] Error message:', err.message);
      console.log('[HomePage] Using fallback products due to error');
      setProducts(FALLBACK_PRODUCTS);
      setError('API không khả dụng, hiển thị sản phẩm mẫu');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleAddToCart = (product, quantity) => {
    console.log(`Added ${quantity} x ${product.name} to cart`);
    // TODO: Integrate with cart service
  };

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 2 }}>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #9CCC65 100%)',
          color: '#FFFFFF',
          py: 6,
          mb: 4,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          🍔 Thực Phẩm Giá Tốt
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 300 }}>
          Sắp hết hạn = Giảm giá siêu khủng
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: '#FF9800',
            color: '#FFFFFF',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            '&:hover': { backgroundColor: '#F57C00' },
          }}
        >
          Khám Phá Ngay
        </Button>
      </Box>

      {/* Flash Sale Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#212121', mb: 2 }}
          >
            ⚡ Flash Sale Ngay Bây Giờ
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
              {error}
            </Typography>
          ) : products.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 4, color: '#666' }}>
              Không có sản phẩm nào
            </Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                {paginatedProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
