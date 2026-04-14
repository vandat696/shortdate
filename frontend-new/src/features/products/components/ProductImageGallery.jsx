import { Box, Grid, Modal, Typography, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { getImageUrl } from '../../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default function ProductImageGallery({ mainImage, thumbnails, allImages = [], discountPercentage = 38 }) {
  // Determine which image URL to use as main display
  const imageToDisplay = mainImage || (allImages && allImages.length > 0 ? allImages[0]?.image_url : null);
  const currentMainImageUrl = imageToDisplay ? getImageUrl(imageToDisplay) : '';
  
  // Extract thumbnail images
  // When mainImage is passed separately + allImages provided:
  //   - allImages contains all images including main at index 0
  //   - Skip first image (main) and use the rest as thumbnails
  // When only allImages is provided without mainImage:
  //   - Use allImages as-is for thumbnails (assuming first is already removed by caller)
  // Fallback: use thumbnails prop if provided
  let images = [];
  if (allImages && allImages.length > 0) {
    // If mainImage is passed separately, skip the first image in allImages (it's likely the main)
    if (mainImage) {
      images = allImages.slice(1);
    } else {
      // No mainImage prop, use allImages as-is for thumbnails
      images = allImages;
    }
  } else if (thumbnails && thumbnails.length > 0) {
    // Fallback to thumbnails prop if provided
    images = thumbnails;
  }
  
  // Debug log
  console.log('🖼️ ProductImageGallery:', { 
    mainImage, 
    allImages, 
    imageToDisplay,
    currentMainImageUrl,
    thumbnailCount: images.length,
    hasMainImageProp: !!mainImage,
    allImagesCount: allImages.length
  });
  
  // Track which image is currently displayed
  const [currentMainImage, setCurrentMainImage] = useState(currentMainImageUrl);
  
  // Track current image index for carousel navigation
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Track modal state for viewing all images
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle thumbnail click to change main image
  const handleThumbnailClick = (imageUrl) => {
    setCurrentMainImage(getImageUrl(imageUrl));
  };

  // Handle next image in carousel
  const handleNextImage = () => {
    if (allImages.length > 0) {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(nextIndex);
      const nextImage = allImages[nextIndex];
      setCurrentMainImage(getImageUrl(nextImage.image_url || nextImage.src));
    }
  };

  // Handle previous image in carousel
  const handlePrevImage = () => {
    if (allImages.length > 0) {
      const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
      setCurrentImageIndex(prevIndex);
      const prevImage = allImages[prevIndex];
      setCurrentMainImage(getImageUrl(prevImage.image_url || prevImage.src));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Main Image - Figma spec: 698.67px × 523.98px */}
      <Box
        sx={{
          width: '667px',
          height: '500px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
          backgroundImage: currentMainImage ? `url(${currentMainImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Discount Badge - Top Right */}
        <Box
          sx={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 16px',
            backgroundColor: 'rgba(252, 130, 12, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            zIndex: 10,
          }}
        >
          <LocalOfferIcon sx={{ color: '#5E2C00', fontSize: '16px', flexShrink: 0 }} />
          <Box
            sx={{
              fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#5E2C00',
              letterSpacing: '-0.35px',
            }}
          >
            -{discountPercentage}%
          </Box>
        </Box>

        {/* Previous Arrow Button - Left */}
        {allImages.length > 1 && (
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 5,
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              },
            }}
          >
            <ArrowBackIcon sx={{ color: '#0D631B', fontSize: '24px' }} />
          </IconButton>
        )}

        {/* Next Arrow Button - Right */}
        {allImages.length > 1 && (
          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 5,
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              },
            }}
          >
            <ArrowForwardIcon sx={{ color: '#0D631B', fontSize: '24px' }} />
          </IconButton>
        )}
      </Box>

      {/* Thumbnail Gallery - Fixed 4 slots (3 thumbnails + "+More" button) */}
      {images.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-start',
          }}
        >
          {/* Display first 3 thumbnails with fixed size */}
          {images.slice(0, 3).map((img, index) => {
            const imageUrl = getImageUrl(img.image_url || img.src);
            const imageId = img.id || index;
            const allImagesIndex = index + 1;
            return (
              <Box
                key={imageId}
                onClick={() => {
                  handleThumbnailClick(img.image_url || img.src);
                  setCurrentImageIndex(allImagesIndex);
                }}
                sx={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#F1F5EB',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: currentMainImage === imageUrl 
                    ? '3px solid #0D631B' 
                    : '2px solid rgba(13, 99, 27, 0.2)',
                  boxShadow: currentMainImage === imageUrl
                    ? '0px 4px 16px rgba(13, 99, 27, 0.2)'
                    : '0px 2px 8px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                    border: currentMainImage === imageUrl
                      ? '3px solid #0D631B'
                      : '2px solid #0D631B80',
                    transform: 'translateY(-4px)',
                  },
                }}
              />
            );
          })}
          
          {/* "+X More" Button - Always shown if more than 3 images */}
          {images.length > 3 && (
            <Box
              onClick={() => {
                setModalOpen(true);
                setSelectedImageIndex(3);
              }}
              sx={{
                width: '120px',
                height: '120px',
                backgroundColor: '#F1F5EB',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(13, 99, 27, 0.2)',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: '#E8F0DC',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                  border: '2px solid #0D631B80',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#0D631B',
                  textAlign: 'center',
                  letterSpacing: '-0.35px',
                }}
              >
                +{images.length - 3}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Full Image Gallery Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: '800px', width: '90%' }}>
          {/* Close Button */}
          <Box
            onClick={() => setModalOpen(false)}
            sx={{
              position: 'absolute',
              top: '-40px',
              right: 0,
              cursor: 'pointer',
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              '&:hover': { color: '#ccc' },
            }}
          >
            ✕
          </Box>

          {/* Main Image in Modal */}
          <Box
            sx={{
              width: '100%',
              height: '600px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              backgroundImage: `url(${getImageUrl(images[selectedImageIndex]?.image_url || images[selectedImageIndex]?.src)})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              mb: 2,
            }}
          />

          {/* Modal Thumbnails */}
          <Grid container spacing={1}>
            {images.map((img, index) => {
              const thumbUrl = getImageUrl(img.image_url || img.src);
              return (
                <Grid item xs={3} sm={2} key={img.id || index}>
                  <Box
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      width: '100%',
                      aspectRatio: '1/1',
                      backgroundColor: '#F1F5EB',
                      borderRadius: '8px',
                      backgroundImage: `url(${thumbUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '3px solid #0D631B' : '1px solid rgba(191, 202, 186, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}

ProductImageGallery.propTypes = {
  mainImage: PropTypes.string,
  thumbnails: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      src: PropTypes.string,
      position: PropTypes.number,
    })
  ),
  allImages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      image_url: PropTypes.string,
      position: PropTypes.number,
    })
  ),
};

ProductImageGallery.defaultProps = {
  mainImage: '',
  thumbnails: [],
  allImages: [],
};
