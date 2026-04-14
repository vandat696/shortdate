import { Box, Typography, Container, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../../../components/common/CategoryCard';
import { productService } from '../../../services/api';

// Xác định category là freshness hay không (dựa trên name)
const isFreshCategory = (categoryName) => {
  const freshKeywords = ['rau', 'quả', 'trái cây', 'thịt', 'cá', 'hải sản', 'seafood', 'meat', 'vegetables', 'fruits'];
  return freshKeywords.some(keyword => categoryName?.toLowerCase().includes(keyword));
};

export default function CategoriesSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await productService.getCategories();
      console.log('Categories API Response:', response);
      
      // API returns: [...] directly (array of categories)
      // Axios wraps it as: response.data = [...]
      const categoryList = response.data || [];
      console.log('categoryList:', categoryList);
      console.log('categoryList.length:', categoryList.length);

      if (Array.isArray(categoryList) && categoryList.length > 0) {
        setCategories(categoryList);
        setError(null);
        console.log('✅ Categories loaded:', categoryList.length);
      } else {
        console.log('❌ No categories found or empty');
        setError('Không tìm thấy danh mục sản phẩm');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Lỗi khi tải danh mục sản phẩm');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?categories=${encodeURIComponent(categoryName)}`);
  };

  return (
    <Box sx={{ width: '100%', px: 3, py: '64px' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: 0 }}>
        {/* Heading */}
        <Typography
          sx={{
            fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
            fontWeight: 800,
            fontSize: 30,
            lineHeight: '36px',
            letterSpacing: '-0.75px',
            color: '#181D17',
            mb: 6,
          }}
        >
          Có thể bạn sẽ thích
        </Typography>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Typography sx={{ color: '#d32f2f', textAlign: 'center', py: 4 }}>
            {error}
          </Typography>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
            {categories.map((category) => (
              <CategoryCard
                key={`${category.id}-${category.name}`}
                icon={category.icon || '📦'}
                label={category.name}
                isFresh={isFreshCategory(category.name)}
                onClick={() => handleCategoryClick(category.name)}
              />
            ))}
          </Box>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && !error && (
          <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>
            Chưa có danh mục sản phẩm nào
          </Typography>
        )}
      </Container>
    </Box>
  );
}
