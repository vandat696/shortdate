import { useState, useCallback } from 'react';
import ratingAPI from '../services/ratingAPI';

export const useRating = (productId) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách đánh giá
  const fetchRatings = useCallback(async (limit = 10, offset = 0) => {
    console.log('🎣 [useRating] fetchRatings called - Product:', productId, 'Limit:', limit, 'Offset:', offset);
    setLoading(true);
    setError(null);
    try {
      const response = await ratingAPI.getProductRatings(productId, limit, offset);
      console.log('🎣 [useRating] fetchRatings response:', response);
      if (response.data.success) {
        console.log('🎣 [useRating] Setting ratings:', response.data.data.ratings.length, 'items');
        console.log('🎣 [useRating] Setting stats:', response.data.data.stats);
        setRatings(response.data.data.ratings);
        setStats(response.data.data.stats);
      }
    } catch (err) {
      console.error('🎣 [useRating] fetchRatings error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Lấy thống kê
  const fetchStats = useCallback(async () => {
    console.log('🎣 [useRating] fetchStats called - Product:', productId);
    try {
      const response = await ratingAPI.getRatingStats(productId);
      console.log('🎣 [useRating] fetchStats response:', response);
      if (response.data.success) {
        console.log('🎣 [useRating] Setting stats:', response.data.data);
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('🎣 [useRating] fetchStats error:', err.message);
      setError(err.message);
    }
  }, [productId]);

  // Lấy rating của user
  const fetchUserRating = useCallback(async () => {
    try {
      const response = await ratingAPI.getUserRating(productId);
      if (response.data.success) {
        setUserRating(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching user rating:', err);
    }
  }, [productId]);

  // Tạo đánh giá
  const createRating = useCallback(async (data) => {
    console.log('🎣 [useRating] createRating called with data:', data);
    setLoading(true);
    setError(null);
    try {
      const response = await ratingAPI.create(data);
      console.log('🎣 [useRating] createRating response:', response);
      if (response.data.success || response.status === 201 || response.status === 200) {
        console.log('🎣 [useRating] Setting userRating:', response.data.data);
        setUserRating(response.data.data);
        // Refresh ratings list
        console.log('🎣 [useRating] Refreshing ratings list after create');
        await fetchRatings();
        // Refresh stats
        console.log('🎣 [useRating] Refreshing stats after create');
        await fetchStats();
        return response.data;
      }
    } catch (err) {
      console.error('🎣 [useRating] createRating error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRatings, fetchStats]);

  // Cập nhật đánh giá
  const updateRating = useCallback(async (ratingId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ratingAPI.update(ratingId, data);
      if (response.success) {
        setUserRating(response.data);
        // Refresh ratings list
        await fetchRatings();
        // Refresh stats
        await fetchStats();
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRatings, fetchStats]);

  // Xóa đánh giá
  const deleteRating = useCallback(async (ratingId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ratingAPI.delete(ratingId);
      if (response.success) {
        setUserRating(null);
        // Refresh ratings list
        await fetchRatings();
        // Refresh stats
        await fetchStats();
        return true;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRatings, fetchStats]);

  // Đánh dấu hữu ích
  const markHelpful = useCallback(async (ratingId) => {
    try {
      const response = await ratingAPI.markHelpful(ratingId);
      if (response.success) {
        // Refresh ratings list
        await fetchRatings();
        return true;
      }
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  }, [fetchRatings]);

  return {
    ratings,
    stats,
    userRating,
    loading,
    error,
    fetchRatings,
    fetchStats,
    fetchUserRating,
    createRating,
    updateRating,
    deleteRating,
    markHelpful
  };
};

export default useRating;
