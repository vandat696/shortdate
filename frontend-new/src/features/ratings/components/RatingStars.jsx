import React from 'react';
import { Box, Rating, Typography, Stack } from '@mui/material';

const RatingStars = ({ rating = 0, count = 0, size = 'medium', interactive = false, onRate = null }) => {
  const sizeMap = {
    small: { fontSize: '1.2rem', spacing: 0.5 },
    medium: { fontSize: '1.5rem', spacing: 1 },
    large: { fontSize: '2rem', spacing: 1 }
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  return (
    <Stack direction="row" alignItems="center" spacing={currentSize.spacing}>
      <Rating
        value={interactive ? rating : rating}
        onChange={interactive && onRate ? (e, newValue) => onRate(newValue) : undefined}
        readOnly={!interactive}
        sx={{
          fontSize: currentSize.fontSize,
          color: '#ffc107',
          '& .MuiRating-iconEmpty': {
            color: '#d0d0d0'
          }
        }}
      />
      {rating > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} color="#333">
            {rating.toFixed(1)}
          </Typography>
          {count > 0 && (
            <Typography variant="caption" color="textSecondary">
              ({count} đánh giá)
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default RatingStars;
