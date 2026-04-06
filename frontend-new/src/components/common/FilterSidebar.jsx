import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

const CATEGORIES = [
  { id: 'vegetables', label: 'Rau Xanh' },
  { id: 'fruits', label: 'Trái Cây' },
  { id: 'dairy', label: 'Sữa & Kem' },
  { id: 'meat', label: 'Thịt & Cá' },
  { id: 'grains', label: 'Gạo & Ngũ Cốc' },
  { id: 'bakery', label: 'Bánh Mì' },
  { id: 'other', label: 'Khác' },
];

const DISTANCE_RANGES = [
  { id: '1km', label: 'Dưới 1km' },
  { id: '5km', label: 'Dưới 5km' },
  { id: '10km', label: 'Dưới 10km' },
  { id: '20km', label: 'Dưới 20km' },
];

export default function FilterSidebar({ open, onClose, onFilterChange, filters }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategories, setSelectedCategories] = useState(filters?.categories || []);
  const [selectedDistances, setSelectedDistances] = useState(filters?.distances || []);
  const [priceRange, setPriceRange] = useState(filters?.priceRange || [0, 1000000]);
  const [selectedExpiry, setSelectedExpiry] = useState(filters?.expiry || []);

  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  const handleDistanceChange = (distanceId) => {
    const newDistances = selectedDistances.includes(distanceId)
      ? selectedDistances.filter(id => id !== distanceId)
      : [...selectedDistances, distanceId];
    setSelectedDistances(newDistances);
  };

  const handleExpiryChange = (expiryType) => {
    const newExpiry = selectedExpiry.includes(expiryType)
      ? selectedExpiry.filter(type => type !== expiryType)
      : [...selectedExpiry, expiryType];
    setSelectedExpiry(newExpiry);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleApplyFilters = () => {
    const newFilters = {
      categories: selectedCategories,
      distances: selectedDistances,
      priceRange,
      expiry: selectedExpiry,
    };

    // Call the callback
    onFilterChange(newFilters);
    onClose();

    // If not on AllProductsPage, navigate there with filter params
    if (location.pathname !== '/products') {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      }
      if (priceRange[0] > 0) {
        params.set('minPrice', priceRange[0]);
      }
      if (priceRange[1] < 1000000) {
        params.set('maxPrice', priceRange[1]);
      }
      if (selectedExpiry.length > 0) {
        params.set('expiry', selectedExpiry.join(','));
      }

      navigate(`/products?${params.toString()}`);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedDistances([]);
    setPriceRange([0, 1000000]);
    setSelectedExpiry([]);
    onFilterChange({
      categories: [],
      distances: [],
      priceRange: [0, 1000000],
      expiry: [],
    });
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 340 },
          backgroundColor: '#EBEFE5',
          borderTopRightRadius: '24px',
          borderBottomRightRadius: '24px',
          border: 'none',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 728,
          p: 3,
          gap: 4,
          alignItems: 'flex-start',
        }}
      >
        {/* Close Button */}
        <Box sx={{ alignSelf: 'flex-end' }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ color: '#181D17', width: 24, height: 24 }} />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2, width: '100%', pl: 1.5 }}>
          {/* Categories */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#181D17', fontFamily: 'Montserrat' }}>
              DANH MỤC
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
              {CATEGORIES.map(category => (
                <FormControlLabel
                  key={category.id}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      sx={{
                        width: 18,
                        height: 18,
                        color: '#F7FBF0',
                        border: '1px solid #6B7280',
                        borderRadius: '4px',
                        '&.Mui-checked': {
                          backgroundColor: '#0D631B',
                          borderColor: '#0D631B',
                          color: '#FFFFFF',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 500, color: '#181D17' }}>
                      {category.label}
                    </Typography>
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    margin: 0,
                    width: '100%',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Price Range */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#181D17', fontFamily: 'Montserrat' }}>
              GIÁ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5, width: '100%', px: 1 }}>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                min={0}
                max={1000000}
                step={10000}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${(value / 1000).toFixed(0)}k`}
                sx={{
                  width: 220,
                  height: 6,
                  borderRadius: '8px',
                  '& .MuiSlider-thumb': {
                    backgroundColor: theme => theme.palette.primary.main,
                    width: 18,
                    height: 18,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: theme => theme.palette.primary.main,
                    height: 6,
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#E0E4DA',
                    height: 6,
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 220, fontSize: 12, fontWeight: 700, color: '#707A6C' }}>
                <span>{`${(priceRange[0] / 1000).toFixed(0)}k`}</span>
                <span>{`${(priceRange[1] / 1000).toFixed(0)}k`}</span>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Expiry Date */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#181D17', fontFamily: 'Montserrat' }}>
              HẠN SỬ DỤNG
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
              {[
                { id: 'today', label: 'Hôm nay' },
                { id: '3days', label: 'Trong 3 ngày' },
                { id: '7days', label: 'Trong 7 ngày' },
                { id: '14days', label: 'Trong 14 ngày' },
              ].map(item => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={selectedExpiry.includes(item.id)}
                      onChange={() => handleExpiryChange(item.id)}
                      sx={{
                        width: 16,
                        height: 16,
                        color: '#F7FBF0',
                        border: '1px solid #6B7280',
                        borderRadius: '4px',
                        '&.Mui-checked': {
                          backgroundColor: '#0D631B',
                          borderColor: '#0D631B',
                          color: '#FFFFFF',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 500, color: '#181D17' }}>
                      {item.label}
                    </Typography>
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    margin: 0,
                    width: '100%',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Distance */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#181D17', fontFamily: 'Montserrat' }}>
              KHOẢNG CÁCH
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
              {DISTANCE_RANGES.map(distance => (
                <FormControlLabel
                  key={distance.id}
                  control={
                    <Checkbox
                      checked={selectedDistances.includes(distance.id)}
                      onChange={() => handleDistanceChange(distance.id)}
                      sx={{
                        width: 16,
                        height: 16,
                        color: '#F7FBF0',
                        border: '1px solid #6B7280',
                        borderRadius: '4px',
                        '&.Mui-checked': {
                          backgroundColor: '#0D631B',
                          borderColor: '#0D631B',
                          color: '#FFFFFF',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 500, color: '#181D17' }}>
                      {distance.label}
                    </Typography>
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    margin: 0,
                    width: '100%',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', pt: 2 }}>
          <Button
            onClick={handleResetFilters}
            sx={{
              width: '100%',
              height: 38,
              backgroundColor: 'rgba(224, 228, 218, 0.5)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontFamily: 'Montserrat',
              fontSize: 14,
              fontWeight: 700,
              color: '#181D17',
              border: 'none',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(224, 228, 218, 0.7)',
              },
            }}
          >
            Xóa lọc
          </Button>
          <Button
            onClick={handleApplyFilters}
            sx={{
              width: '100%',
              height: 36,
              backgroundColor: '#FC820C',
              borderRadius: '12px',
              padding: '8px 16px',
              fontFamily: 'Montserrat',
              fontSize: 14,
              fontWeight: 700,
              color: '#5E2C00',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#E66E00',
              },
            }}
          >
            Áp dụng
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
