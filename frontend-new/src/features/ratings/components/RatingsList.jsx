import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Pagination,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ratingAPI from '../services/ratingAPI';

const RatingsList = ({ productId, isLoading: initialLoading = false }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalRatings, setTotalRatings] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(initialLoading);

  const LIMIT = 10;

  const fetchRatings = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      console.log('📊 [RatingsList] Fetching ratings for product:', productId, 'Page:', page);
      const response = await ratingAPI.getProductRatings(productId, LIMIT, (page - 1) * LIMIT);

      console.log('📊 [RatingsList] API Response:', response);
      
      if (response.data.success) {
        console.log('📊 [RatingsList] Response structure:', {
          hasSuccess: response.data.success,
          hasData: !!response.data.data,
          dataKeys: Object.keys(response.data.data || {}),
          fullData: response.data.data
        });
        
        console.log('📊 [RatingsList] Ratings data:', response.data.data.ratings);
        console.log('📊 [RatingsList] Ratings length:', response.data.data.ratings?.length);
        console.log('📊 [RatingsList] Stats data:', response.data.data.stats);
        
        // Log each rating's comment
        response.data.data.ratings.forEach((rating, idx) => {
          console.log(`  ⭐ Rating ${idx + 1}: ${rating.rating} stars | Comment: "${rating.comment || 'No comment'}" | Verified: ${rating.is_verified_purchase}`);
        });
        
        setRatings(response.data.data.ratings);
        setStats(response.data.data.stats);
        setTotalRatings(parseInt(response.data.data.stats.total_ratings));
      }
    } catch (err) {
      console.error('❌ [RatingsList] Error fetching ratings:', err);
      setError(err.message || 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleHelpful = async (ratingId) => {
    try {
      const response = await ratingAPI.markHelpful(ratingId);

      if (response.success) {
        fetchRatings();
      }
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const totalPages = Math.ceil(totalRatings / LIMIT);

  return (
    <Box sx={{ mt: 4 }}>
      {/* Rating Summary */}
      {stats && (
        <>
          {console.log('📊 [RatingsList] Rendering stats:', stats)}
          <Card sx={{ mb: 4, backgroundColor: '#f5f5f5', border: 'none', boxShadow: 0 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Đánh giá từ khách hàng
              </Typography>

              {/* Average Rating */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffc107' }}>
                    {parseFloat(stats.average_rating || 0).toFixed(1)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Rating
                    value={parseFloat(stats.average_rating || 0)}
                    readOnly
                    sx={{ color: '#ffc107' }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {parseInt(stats.total_ratings)} đánh giá
                  </Typography>
                </Box>
              </Stack>

              {/* Rating Distribution */}
              <Stack spacing={1.5}>
              {[5, 4, 3, 2, 1].map((star) => {
                const key = `${star}_star`;
                const count = stats[key] || 0;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                return (
                  <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="body2" sx={{ minWidth: 35 }}>
                      {star} ⭐
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 1,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#ffc107',
                          borderRadius: 1
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
        </>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Ratings List */}
      {!loading && ratings.length > 0 && (
        <>
          {console.log('📊 [RatingsList] Rendering', ratings.length, 'ratings')}
          <Stack spacing={2} sx={{ mb: 3 }}>
            {ratings.map((rating, idx) => {
              console.log(`  📌 Rating ${idx + 1}: ID=${rating.id}, Stars=${rating.rating}, Comment="${rating.comment}"`);
              return (
                <Card key={rating.id} sx={{ '&:hover': { boxShadow: 2 } }}>
                  <CardContent>
                    {/* Rating Header */}
                    <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mb: 2 }}
                >
                  {/* Author Info */}
                  <Stack direction="row" spacing={1.5}>
                    <Avatar
                      src={rating.avatar_url}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box flex={1}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {rating.first_name} {rating.last_name}
                        </Typography>
                        {rating.is_verified_purchase && (
                          <Chip
                            icon={<VerifiedUserIcon />}
                            label="Mua hàng đã xác thực"
                            size="small"
                            sx={{
                              backgroundColor: '#e8f5e9',
                              color: '#2e7d32',
                              height: 'auto',
                              py: 0.5
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(rating.created_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Rating Stars */}
                  <Rating
                    value={rating.rating}
                    readOnly
                    size="small"
                    sx={{ color: '#ffc107' }}
                  />
                </Stack>

                {/* Comment Section */}
                {rating.comment && (
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        color: '#333'
                      }}
                    >
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        borderLeft: '3px solid #ffc107'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="textPrimary"
                        sx={{
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                      >
                        {rating.comment}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Helpful Button */}
                <Button
                  size="small"
                  startIcon={<ThumbUpOutlinedIcon />}
                  onClick={() => handleHelpful(rating.id)}
                  sx={{
                    color: '#666',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#ffc107'
                    }
                  }}
                >
                  Hữu ích ({rating.helpful_count})
                </Button>
              </CardContent>
            </Card>
              );
            })}
          </Stack>
          </>
        )}

      {/* No Ratings */}
      {!loading && ratings.length === 0 && (
        <Box textAlign="center" py={5}>
          <Typography color="textSecondary">
            Chưa có đánh giá nào cho sản phẩm này
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="standard"
            sx={{
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#ffc107',
                color: '#333'
              },
              '& .MuiPaginationItem-page:hover': {
                backgroundColor: '#ffb300'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default RatingsList;
