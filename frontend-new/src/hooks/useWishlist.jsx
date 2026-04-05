import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist từ API
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = getApiBaseUrl();
      
      if (!token) {
        setWishlist([]);
        setError(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      console.log('[useWishlist] Wishlist items:', data.items);
      setWishlist(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào wishlist
  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập để lưu sản phẩm');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to add to wishlist');
      const data = await response.json();
      
      if (data.isNew && data.wishlistItem) {
        // Thêm item mới vào state ngay lập tức để trigger re-render
        const newItem = {
          id: data.wishlistItem.id,
          product_id: productId,
          added_at: data.wishlistItem.added_at,
          product: {} // Có thể không cần thông tin product để check isInWishlist
        };
        setWishlist(prev => [newItem, ...prev]);
      }
      
      return true;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.message);
      return false;
    }
  };

  // Xóa khỏi wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}/wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to remove from wishlist');
      
      // Cập nhật state
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.message);
      return false;
    }
  };

  // Kiểm tra sản phẩm trong wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  // Xóa tất cả wishlist
  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    count: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
