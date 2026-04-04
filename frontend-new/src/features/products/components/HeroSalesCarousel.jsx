import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../services/api';

export default function HeroSalesCarousel({ products = [] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Lấy top sản phẩm có discount cao nhất
  const topProducts = products
    .filter((p) => p.current_price && p.original_price)
    .map((p) => ({
      ...p,
      discount: Math.round(((p.original_price - p.current_price) / p.original_price) * 100) || 0,
    }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 5);

  // Tự động chuyển sản phẩm mỗi 6 giây
  useEffect(() => {
    if (topProducts.length === 0) return;

    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % topProducts.length);
        setFadeOut(false);
      }, 400);
    }, 6000);

    return () => clearInterval(interval);
  }, [topProducts.length]);

  const handlePrev = () => {
    setFadeOut(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + topProducts.length) % topProducts.length);
      setFadeOut(false);
    }, 400);
  };

  const handleNext = () => {
    setFadeOut(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % topProducts.length);
      setFadeOut(false);
    }, 400);
  };

  if (topProducts.length === 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 450,
          borderRadius: 3,
          overflow: 'visible',
          background: 'linear-gradient(135deg, #E0E4DA 0%, #A3F69C 55%, #0D631B 100%)',
        }}
      />
    );
  }

  const currentProduct = topProducts[currentIndex];
  const imageUrl = getImageUrl(currentProduct.thumbnail_url || currentProduct.image_url);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 450,
        borderRadius: 3,
        overflow: 'visible',
        backgroundColor: '#E0E4DA',
        zIndex: 10,
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: imageUrl 
            ? `url(${imageUrl})` 
            : `linear-gradient(135deg, #E0E4DA 0%, #D9E0D5 50%, #EBEFE5 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!imageUrl && (
          <Typography
            sx={{
              fontFamily: '"Manrope","Inter",system-ui,sans-serif',
              fontWeight: 700,
              fontSize: '48px',
              color: 'rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
            }}
          >
            🛒
          </Typography>
        )}
      </Box>

      {/* Left Fade Overlay */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '15%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(247,251,240,0.8) 0%, rgba(247,251,240,0) 100%)',
          zIndex: 5,
          borderRadius: '3px 0 0 3px',
          pointerEvents: 'none',
        }}
      />

      {/* Right Fade Overlay */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '15%',
          height: '100%',
          background: 'linear-gradient(270deg, rgba(247,251,240,0.8) 0%, rgba(247,251,240,0) 100%)',
          zIndex: 5,
          borderRadius: '0 3px 3px 0',
          pointerEvents: 'none',
        }}
      />

      {/* Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)',
          opacity: fadeOut ? 0.1 : 0.2,
          transition: 'opacity 0.4s ease-in-out',
          borderRadius: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          p: 3,
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        {/* Discount Badge - Bottom Right */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            bgcolor: '#964900',
            borderRadius: '12px',
            p: '12px 20px',
            textAlign: 'center',
            boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Manrope","Inter",system-ui,sans-serif',
              fontWeight: 900,
              fontSize: '36px',
              lineHeight: '40px',
              color: '#fff',
              letterSpacing: '-1px',
            }}
          >
            {currentProduct.discount}%
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#fff',
              opacity: 0.9,
              mt: 0.3,
            }}
          >
            Giảm
          </Typography>
        </Box>

        {/* Product Info - Bottom Left */}
        <Typography
          sx={{
            fontFamily: '"Manrope","Inter",system-ui,sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            color: '#fff',
            mb: 1,
            maxWidth: '70%',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {currentProduct.name}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: '#fff',
          }}
        >
          {currentProduct.current_price.toLocaleString('vi-VN')}đ
        </Typography>
      </Box>

      {/* Left Navigation Button - Middle Left (like ear) */}
      <Button
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: -50,
          top: '50%',
          transform: 'translateY(-50%)',
          minWidth: '44px',
          width: '44px',
          height: '44px',
          p: 0,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.5)',
          color: '#181D17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          zIndex: 11,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.7)',
          },
        }}
      >
        ←
      </Button>

      {/* Right Navigation Button - Middle Right (like ear) */}
      <Button
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: -50,
          top: '50%',
          transform: 'translateY(-50%)',
          minWidth: '44px',
          width: '44px',
          height: '44px',
          p: 0,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.5)',
          color: '#181D17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          zIndex: 11,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.7)',
          },
        }}
      >
        →
      </Button>

      {/* Indicator Dots - Below carousel */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 5,
        }}
      >
        {topProducts.map((_, idx) => (
          <Box
            key={idx}
            sx={{
              width: idx === currentIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              bgcolor: idx === currentIndex ? '#964900' : 'rgba(150, 73, 0, 0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => {
              setFadeOut(true);
              setTimeout(() => {
                setCurrentIndex(idx);
                setFadeOut(false);
              }, 300);
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
