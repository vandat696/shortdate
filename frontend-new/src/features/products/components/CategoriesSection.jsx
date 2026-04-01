import { Box, Typography, Container } from '@mui/material';
import CategoryCard from '../../../components/common/CategoryCard';

export default function CategoriesSection() {
  const freshCategories = [
    { icon: '🥬', label: 'Rau Xanh', isFresh: true },
    { icon: '🍞', label: 'Bánh Mỳ', isFresh: true },
    { icon: '🍅', label: 'Nông Sản', isFresh: true },
  ];

  const dryCategories = [
    { icon: '🌾', label: 'Thực Phẩm Khô', isFresh: false },
    { icon: '🧀', label: 'Sản phẩm từ sữa', isFresh: false },
  ];

  return (
    <Box sx={{ width: '100%', px: 3, py: '64px' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: 0 }}>
        {/* Heading */}
        <Typography
          sx={{
            fontFamily: '"Manrope","Inter",system-ui,sans-serif',
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

        {/* Categories Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          {[...freshCategories, ...dryCategories].map((cat, idx) => (
            <CategoryCard
              key={`${cat.label}-${idx}`}
              icon={cat.icon}
              label={cat.label}
              isFresh={cat.isFresh}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
