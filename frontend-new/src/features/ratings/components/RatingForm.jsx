import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  Alert,
  Paper,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ratingAPI from '../services/ratingAPI';

const RatingForm = ({ productId, orderId = null, onSubmitSuccess, isLoading: initialLoading = false }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📝 [RatingForm] Form submitted - Rating:', rating, 'Comment:', comment);

    if (rating === 0) {
      console.warn('⚠️ [RatingForm] Validation failed: No rating selected');
      setError('Vui lòng chọn số sao');
      return;
    }

    if (comment.trim().length === 0) {
      console.warn('⚠️ [RatingForm] Validation failed: No comment');
      setError('Vui lòng viết nhận xét');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        product_id: productId,
        order_id: orderId,
        rating,
        comment: comment.trim()
      };
      console.log('📝 [RatingForm] Sending to API:', payload);
      
      const response = await ratingAPI.create(payload);

      console.log('📝 [RatingForm] API Response:', response);
      
      // Check if success - either response.data.success or status is 201 (created)
      const isSuccess = response.data?.success || response.status === 201;
      
      if (isSuccess) {
        console.log('✅ [RatingForm] Rating created successfully:', response.data.data || response.data);
        setSuccess('✓ Đánh giá đã được gửi thành công! Vui lòng chờ...');
        setRating(0);
        setComment('');
        
        // Callback for parent to refresh
        if (onSubmitSuccess) {
          console.log('📝 [RatingForm] Calling onSubmitSuccess callback');
          onSubmitSuccess(response.data.data || response.data);
        }
      } else {
        throw new Error('Submit rating failed - unexpected response');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi gửi đánh giá';
      console.error('❌ [RatingForm] Error submitting rating:', err, 'Message:', errMsg);
      
      // Check if it's an authentication error
      if (err.response?.status === 401 || errMsg.includes('Cần đăng nhập')) {
        console.warn('📝 [RatingForm] 401 Unauthorized - showing login dialog');
        setShowLoginDialog(true);
      } else {
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: '#f9f9f9',
          borderRadius: 1
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Đánh giá sản phẩm này
        </Typography>

        <Stack spacing={3}>
          {/* Rating Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>
              Số sao
            </Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
              sx={{
                fontSize: '2.5rem',
                color: '#ffc107',
                '& .MuiRating-iconEmpty': {
                  color: '#d0d0d0'
                }
              }}
            />
          </Box>

          {/* Comment */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Nhận xét của bạn
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 300))}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ffc107'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffc107'
                  }
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
              {comment.length}/300 ký tự
            </Typography>
          </Box>

          {/* Messages */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading || rating === 0}
            sx={{
              backgroundColor: '#ffc107',
              color: '#333',
              fontWeight: 600,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#ffb300'
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#999'
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ mr: 1 }} />
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </Stack>
      </Paper>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>Đăng nhập để đánh giá</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Vui lòng đăng nhập để có thể gửi đánh giá sản phẩm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Huỷ</Button>
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            sx={{ backgroundColor: '#ffc107', color: '#333' }}
          >
            Đến trang đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RatingForm;
