import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = getApiBaseUrl();

  // Fetch cart từ API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      
      if (!token) {
        // Chưa đăng nhập, load from localStorage
        const savedCart = localStorage.getItem('guestCart');
        setCart(savedCart ? JSON.parse(savedCart) : []);
        setError(null);
        return;
      }

      // Đã đăng nhập - kiểm tra có guest cart cần merge không
      const guestCartStr = localStorage.getItem('guestCart');
      const guestItems = guestCartStr ? JSON.parse(guestCartStr) : [];

      if (guestItems.length > 0) {
        console.log('[useCart] Detected guestCart during fetchCart, auto-merging...');
        // Auto-merge guest cart vào server
        const mergeResponse = await fetch(`${API_BASE_URL}/cart/merge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ items: guestItems })
        });

        if (mergeResponse.ok) {
          console.log('[useCart] Auto-merge successful, removing guestCart');
          localStorage.removeItem('guestCart');
        }
      }

      // Fetch cart từ API
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      console.log('[useCart] Backend cart response:', data.items);
      setCart(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào giỏ hàng
  const addToCart = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('[addToCart] ProductId:', productId);
      console.log('[addToCart] Quantity:', quantity);
      console.log('[addToCart] Token:', token ? token.substring(0, 30) + '...' : 'null');

      const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ product_id: productId, quantity })
      });

      const data = await response.json();
      console.log('[addToCart] Response:', data);
      console.log('[addToCart] Response OK:', response.ok);

      if (!response.ok) {
        setError(data.error || 'Lỗi khi thêm vào giỏ hàng');
        return false;
      }

      if (data.requiresAuth) {
        // Chưa đăng nhập, lưu vào localStorage
        const savedCart = localStorage.getItem('guestCart');
        const guestCart = savedCart ? JSON.parse(savedCart) : [];
        const existing = guestCart.find(item => item.product_id === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          guestCart.push({ product_id: productId, quantity, unit_price: data.item.unit_price });
        }
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        return true;
      }

      // Dã đăng nhập, fetch cart mới
      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      return false;
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        // Cập nhật localStorage
        const savedCart = localStorage.getItem('guestCart');
        const guestCart = JSON.parse(savedCart || '[]');
        const item = guestCart.find(i => i.product_id === productId);
        if (item) item.quantity = quantity;
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
      return false;
    }
  };

  // Xóa khỏi giỏ
  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        const savedCart = localStorage.getItem('guestCart');
        const guestCart = JSON.parse(savedCart || '[]').filter(item => item.product_id !== productId);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to remove item');

      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        localStorage.removeItem('guestCart');
        setCart([]);
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to clear cart');

      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      return false;
    }
  };

  // Toggle select item
  const toggleSelectItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    setSelectedItems(cart.map(item => item.product_id));
  };

  // Unselect all items
  const unselectAllItems = () => {
    setSelectedItems([]);
  };

  // Get selected items
  const getSelectedItems = () => {
    return cart.filter(item => selectedItems.includes(item.product_id));
  };

  // Get selected total
  const getSelectedTotal = () => {
    return getSelectedItems().reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  };

  // Tính tổng tiền
  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const itemsCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Fetch cart khi mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Lắng nghe thay đổi đăng nhập
  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('[useCart] Auth change detected, merging cart...');
      const token = localStorage.getItem('token');
      
      if (token) {
        // User vừa đăng nhập - merge guest cart + server cart
        await mergeGuestCart();
      } else {
        // User vừa đăng xuất - load guest cart
        const savedCart = localStorage.getItem('guestCart');
        setCart(savedCart ? JSON.parse(savedCart) : []);
      }
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Merge guest cart vào server cart khi user đăng nhập
  const mergeGuestCart = async () => {
    try {
      const guestCartStr = localStorage.getItem('guestCart');
      if (!guestCartStr) {
        // Không có guest cart, chỉ fetch server cart
        await fetchCart();
        return;
      }

      const guestItems = JSON.parse(guestCartStr);
      if (guestItems.length === 0) {
        await fetchCart();
        return;
      }

      console.log('[useCart] Merging guest cart items:', guestItems);

      // Gửi guest items lên server để merge
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: guestItems })
      });

      if (!response.ok) {
        console.error('[useCart] Merge failed, fetching server cart only');
        await fetchCart();
        return;
      }

      console.log('[useCart] Merge successful');
      
      // Xóa guest cart
      localStorage.removeItem('guestCart');
      
      // Load cart mới từ server
      await fetchCart();
    } catch (err) {
      console.error('[useCart] Error merging guest cart:', err);
      setError(err.message);
      // Fallback: fetch server cart
      await fetchCart();
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      selectedItems,
      loading,
      error,
      totalAmount,
      itemsCount,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleSelectItem,
      selectAllItems,
      unselectAllItems,
      getSelectedItems,
      getSelectedTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng trong CartProvider');
  }
  return context;
}
