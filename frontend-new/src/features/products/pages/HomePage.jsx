import { Box, Button, Container, Grid, Pagination, Typography } from '@mui/material';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';

const mockProducts = [
  {
    id: 1,
    name: 'Cà Chua Tươi',
    product_type: 'fresh',
    current_price: 25000,
    original_price: 35000,
    discount_percentage: 28,
    stock: 15,
  },
  {
    id: 2,
    name: 'Gạo Lứt 5kg',
    product_type: 'dry',
    current_price: 120000,
    original_price: 150000,
    discount_percentage: 20,
    stock: 8,
  },
  {
    id: 3,
    name: 'Dâu Tây Nhập Khẩu',
    product_type: 'fresh',
    current_price: 45000,
    original_price: 65000,
    discount_percentage: 31,
    stock: 5,
  },
  {
    id: 4,
    name: 'Dầu Ôliu Extra Virgin',
    product_type: 'dry',
    current_price: 250000,
    original_price: 320000,
    discount_percentage: 21,
    stock: 12,
  },
  {
    id: 5,
    name: 'Chuối Vàng Tươi',
    product_type: 'fresh',
    current_price: 15000,
    original_price: 22000,
    discount_percentage: 32,
    stock: 20,
  },
  {
    id: 6,
    name: 'Bắp Chuối 1kg',
    product_type: 'fresh',
    current_price: 12000,
    original_price: 18000,
    discount_percentage: 33,
    stock: 25,
  },
];

export default function HomePage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(mockProducts.length / itemsPerPage);

  const paginatedProducts = mockProducts.slice(
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
        </Box>
      </Container>
    </Box>
  );
}
