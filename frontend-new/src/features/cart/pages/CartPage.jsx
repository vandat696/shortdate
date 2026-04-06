import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
  Alert,
  Checkbox,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { useCart } from '../../../hooks/useCart.jsx';
import { useAuth } from '../../../hooks/useAuth';
import AddressManagementModal from '../../../components/common/AddressManagementModal';
import { getImageUrl } from '../../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    error, 
    loading: cartLoading,
    selectedItems,
    toggleSelectItem,
    selectAllItems,
    unselectAllItems,
    getSelectedItems,
    getSelectedTotal
  } = useCart();
  const { token } = useAuth();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const selectedItemsData = getSelectedItems();
  const selectedTotal = Number(getSelectedTotal()) || 0;
  const deliveryFee = Number(selectedDeliveryMethod?.base_price) || 0;
  const shippingFee = selectedTotal > 0 ? deliveryFee : 0;
  const totalWithShipping = Number(selectedTotal) + Number(shippingFee);

  // Load addresses and delivery methods on mount
  useEffect(() => {
    if (token) {
      fetchAddresses();
      fetchDeliveryMethods();
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data);
      
      // Set default address as selected
      const defaultAddress = response.data.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchDeliveryMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await axios.get(`${API_BASE_URL}/addresses/methods/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryMethods(response.data);
      
      // Set first method as default
      if (response.data.length > 0) {
        setSelectedDeliveryMethod(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching delivery methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleQuantityChange = async (productId, delta) => {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;

    console.log('[DEBUG Cart] Item:', {
      product_id: item.product_id,
      product_name: item.product?.name,
      quantity_in_cart: item.quantity,
      stock_quantity: item.product?.stockQuantity,
      expiry_date: item.product?.expiryDate,
      delta: delta,
      will_be: item.quantity + delta
    });

    // Chỉ validate min = 1, không cần validate max (chưa checkout)
    const newQuantity = Math.max(1, item.quantity + delta);

    // Prevent rapid clicks
    if (updatingItemId === productId) {
      return;
    }

    // Không cập nhật nếu số lượng không thay đổi
    if (newQuantity === item.quantity) {
      return;
    }

    setUpdatingItemId(productId);
    try {
      const success = await updateQuantity(productId, newQuantity);
      if (!success) {
        alert('Cập nhật số lượng thất bại. Vui lòng thử lại.');
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityBlur = async (productId, currentValue) => {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;

    const newQty = Math.max(1, parseInt(currentValue) || 1);

    // Không cập nhật nếu số lượng không thay đổi
    if (newQty === item.quantity) {
      return;
    }

    await handleQuantityChange(productId, newQty - item.quantity);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setOrderError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (!selectedDeliveryMethod) {
      setOrderError('Vui lòng chọn phương thức giao hàng');
      return;
    }

    if (!paymentMethod) {
      setOrderError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setLoading(true);
    setOrderError(null);

    try {
      const selectedItemsData = getSelectedItems();

      if (selectedItemsData.length === 0) {
        setOrderError('Vui lòng chọn ít nhất 1 sản phẩm');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: selectedAddress.id,
          deliveryMethodId: selectedDeliveryMethod.id,
          paymentMethod,
          items: selectedItemsData.map(item => ({
            productId: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi tạo đơn hàng');
      }

      const orderId = data.order.id;
      setOrderCode(data.order.orderCode);
      setOrderSuccess(true);

      // Clear cart immediately
      await clearCart();

      // Reset form fields
      setSelectedAddress(null);
      setSelectedDeliveryMethod(null);
      setPaymentMethod('cod');

      // Redirect to order detail page after 2 seconds
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 2000);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  if (!token) {
    return (
      <Box sx={{ bgcolor: '#F7FBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 18, mb: 2 }}>
            Bạn cần đăng nhập
          </Typography>
          <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#707A6C', mb: 3 }}>
            Vui lòng đăng nhập để tiếp tục mua sắm
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/login')} sx={{ backgroundColor: '#0D631B' }}>
            Đăng Nhập
          </Button>
        </Paper>
      </Box>
    );
  }

  if (cartLoading) {
    return (
      <Box sx={{ bgcolor: '#F7FBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
        <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 600, fontSize: 16 }}>
          Đang tải giỏ hàng...
        </Typography>
      </Box>
    );
  }

  if (cart.length === 0) {
    return (
      <Box sx={{ bgcolor: '#F7FBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 20, mb: 2 }}>
            Giỏ hàng trống
          </Typography>
          <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#707A6C', mb: 3 }}>
            Hãy thêm sản phẩm để tiếp tục mua sắm
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/')} sx={{ backgroundColor: '#0D631B' }}>
            Quay Lại Mua Sắm
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      bgcolor: '#F7FBF0', 
      py: 3,
      overflowX: 'hidden',
      overflow: 'hidden',
    }}>
      {/* Urgency Banner */}
      <Box sx={{ 
        width: '100%',
        bgcolor: '#FFDCC6', 
        py: 2, 
        mb: 3, 
        borderBottom: '2px solid #964900' 
      }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 16, color: '#964900' }}>
              Hãy hoàn tất đơn hàng ngay!
            </Typography>
            <Typography sx={{ fontFamily: 'Inter', fontSize: 13, color: '#964900', opacity: 0.8 }}>
              Giá sản phẩm gần hết hạn có thể thay đổi. Hoàn tất đơn hàng để bảo đảm giá hiện tại.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Container */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 28, color: '#181D17' }}>
            Giỏ hàng
          </Typography>
        </Box>

        {/* Error & Success Alerts */}
        {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Inter' }}>{error}</Alert>}
        {orderSuccess && (
          <Alert severity="success" sx={{ 
            mb: 2, 
            backgroundColor: '#E8F5E9', 
            color: '#0D631B', 
            border: '1px solid #0D631B',
            fontFamily: 'Inter'
          }}>
            ✓ Đơn hàng {orderCode} đã được tạo thành công!
          </Alert>
        )}

        {/* 2-Column Layout */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Column: Cart Items (70%) */}
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            {/* Select All Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              backgroundColor: '#F7FBF0', 
              p: 2, 
              borderRadius: 1,
              mb: 3
            }}>
              <Checkbox
                checked={selectedItems.length === cart.length && cart.length > 0}
                indeterminate={selectedItems.length > 0 && selectedItems.length < cart.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    selectAllItems();
                  } else {
                    unselectAllItems();
                  }
                }}
                sx={{ color: '#0D631B', '&.Mui-checked': { color: '#0D631B' } }}
              />
              <Typography sx={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#707A6C' }}>
                Chọn tất cả ({selectedItems.length}/{cart.length})
              </Typography>
            </Box>

            {/* Cart Items List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {cart.map((item) => (
                <Paper
                  key={item.product_id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderColor: '#0D631B' }
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedItems.includes(item.product_id)}
                    onChange={() => toggleSelectItem(item.product_id)}
                    sx={{ color: '#0D631B', '&.Mui-checked': { color: '#0D631B' }, mt: 0.5 }}
                  />

                  {/* Image */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      flexShrink: 0,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    {item.product?.images?.[0] && (
                      <img
                        src={getImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, color: '#181D17' }}>
                          {item.product?.name}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#707A6C', mt: 0.5 }}>
                          HSD: {item.product?.expiryDate 
                            ? new Date(item.product.expiryDate).toLocaleDateString('vi-VN') 
                            : 'N/A'}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontFamily: 'Myriad Condensed', fontSize: 16, fontWeight: 700, color: '#964900' }}>
                        {Math.round(item.subtotal || 0).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#707A6C' }}>
                        Tồn kho: <span style={{ fontWeight: 600, color: '#181D17' }}>{item.product?.stockQuantity || 0}</span>
                      </Typography>

                      {/* Quantity controls */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#F7FBF0', p: 1, borderRadius: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.product_id, -1)}
                          disabled={item.quantity <= 1 || updatingItemId === item.product_id}
                          sx={{ color: '#0D631B', '&:hover': { backgroundColor: 'rgba(13, 99, 27, 0.08)' } }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onBlur={(e) => handleQuantityBlur(item.product_id, e.target.value)}
                          disabled={updatingItemId === item.product_id}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          sx={{ width: 50, '& .MuiOutlinedInput-root': { fontSize: 12 } }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.product_id, 1)}
                          disabled={updatingItemId === item.product_id}
                          sx={{ color: '#0D631B', '&:hover': { backgroundColor: 'rgba(13, 99, 27, 0.08)' } }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Delete button */}
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.product_id)}
                        sx={{ color: '#e74c3c', '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.08)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Inline Checkout Form - Address & Delivery Selection */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#FFF5F0', border: '2px solid #FFDCC6' }}>
              <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 18, color: '#181D17', mb: 2 }}>
                Địa chỉ giao hàng
              </Typography>

              {orderError && <Alert severity="error" sx={{ mb: 2 }}>{orderError}</Alert>}

              {loadingAddresses ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : selectedAddress ? (
                <Box sx={{ 
                  p: 2, 
                  mb: 2, 
                  backgroundColor: 'white', 
                  border: '2px solid #0D631B',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}>
                  <Box>
                    <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 14, color: '#181D17', mb: 0.5 }}>
                      {selectedAddress.label}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#40493D' }}>
                      {selectedAddress.full_name} • {selectedAddress.phone_number}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#40493D', mt: 0.5 }}>
                      {selectedAddress.street_address}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#40493D' }}>
                      {selectedAddress.ward && `${selectedAddress.ward}, `}
                      {selectedAddress.district}, {selectedAddress.city}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    onClick={() => setShowAddressModal(true)}
                    sx={{ color: '#0D631B', textTransform: 'none' }}
                  >
                    Thay đổi
                  </Button>
                </Box>
              ) : (
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/profile')}
                  sx={{ mb: 2, color: '#0D631B', borderColor: '#0D631B', fontWeight: 600 }}
                  startIcon={<LocationOnIcon />}
                >
                  Thêm Địa Chỉ
                </Button>
              )}

              {/* Delivery Method Selection */}
              <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 16, color: '#181D17', mb: 2, mt: 3 }}>
                Phương thức giao hàng
              </Typography>

              {loadingMethods ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {deliveryMethods.map((method) => (
                    <Box
                      key={method.id}
                      onClick={() => setSelectedDeliveryMethod(method)}
                      sx={{
                        p: 2,
                        border: selectedDeliveryMethod?.id === method.id ? '2px solid #0D631B' : '1px solid #BFCABA',
                        borderRadius: '8px',
                        backgroundColor: selectedDeliveryMethod?.id === method.id ? 'rgba(13, 99, 27, 0.05)' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#181D17' }}>
                          {method.name}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#707A6C', mt: 0.5 }}>
                          {method.description}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 14, color: '#0D631B' }}>
                        {Math.round(method.base_price).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Right Column: Order Summary (30%) - Sticky */}
          <Box sx={{ 
            width: '30%',
            position: 'sticky',
            top: 20,
            height: 'fit-content'
          }}>
            <Paper sx={{ p: 3, backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ fontFamily: 'Myriad Condensed', fontSize: 18, fontWeight: 700, color: '#181D17', mb: 2 }}>
                Tóm tắt đơn hàng
              </Typography>

              {/* Price Breakdown */}
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#F7FBF0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#707A6C' }}>
                    Tạm tính:
                  </Typography>
                  <Typography sx={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#181D17' }}>
                    {Math.round(selectedTotal).toLocaleString('vi-VN')} ₫
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#707A6C' }}>
                    Phí vận chuyển:
                  </Typography>
                  <Typography sx={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#181D17' }}>
                    {Math.round(shippingFee).toLocaleString('vi-VN')} ₫
                  </Typography>
                </Box>
              </Box>

              {/* Total */}
              <Box sx={{ py: 2, borderTop: '2px solid #e0e0e0', borderBottom: '2px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontFamily: 'Myriad Condensed', fontSize: 16, fontWeight: 700, color: '#181D17' }}>
                  Tổng tiền:
                </Typography>
                <Typography sx={{ fontFamily: 'Myriad Condensed', fontSize: 18, fontWeight: 700, color: '#0D631B' }}>
                  {Math.round(totalWithShipping).toLocaleString('vi-VN')} ₫
                </Typography>
              </Box>

              {/* Items Count Badge */}
              <Box sx={{ p: 2, backgroundColor: '#E8F5E9', borderRadius: 1, mb: 3, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: 'Myriad Condensed', fontSize: 18, fontWeight: 700, color: '#0D631B' }}>
                  {selectedItems.length} sản phẩm
                </Typography>
              </Box>

              {/* Payment Methods */}
              <Typography sx={{ fontFamily: 'Myriad Condensed', fontSize: 18, fontWeight: 700, color: '#181D17', mb: 2 }}>
               Phương Thức Thanh Toán
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ mb: 3 }}
              >
                {[
                  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
                  { value: 'momo', label: 'Ví MoMo' },
                  { value: 'zalopay', label: 'ZaloPay' },
                ].map((method) => (
                  <FormControlLabel
                    key={method.value}
                    value={method.value}
                    control={<Radio sx={{ color: '#0D631B', '&.Mui-checked': { color: '#0D631B' } }} />}
                    label={<Typography sx={{ fontFamily: 'Inter', fontSize: 12 }}>{method.label}</Typography>}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </RadioGroup>

              {/* Savings Info */}
              <Box sx={{ p: 2, backgroundColor: '#FFF5F0', borderRadius: 1, border: '1px dashed #964900', mb: 2 }}>
                <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#707A6C' }}>
                  Bạn tiết kiệm {selectedTotal > 0 ? Math.floor(selectedTotal * 0.2) : 0}₫ với giá gần hết hạn!
                </Typography>
              </Box>

              {/* Checkout Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={selectedItems.length === 0 || loading || !selectedAddress || !selectedDeliveryMethod}
                onClick={handleCheckout}
                sx={{
                  backgroundColor: '#0D631B',
                  color: 'white',
                  fontFamily: 'Myriad Condensed',
                  fontSize: 16,
                  fontWeight: 700,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 1,
                  boxShadow: '0 4px 12px rgba(13, 99, 27, 0.2)',
                  '&:hover': { backgroundColor: '#0a4d15', boxShadow: '0 6px 16px rgba(13, 99, 27, 0.3)' },
                  '&:disabled': { backgroundColor: '#ccc', boxShadow: 'none' },
                  mb: 2
                }}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
              </Button>

              {/* Continue Shopping Button */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/')}
                sx={{
                  color: '#0D631B',
                  borderColor: '#0D631B',
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: 600,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(13, 99, 27, 0.05)' }
                }}
              >
                ← Tiếp Tục Mua Sắm
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Address Management Modal */}
      <AddressManagementModal 
        open={showAddressModal} 
        onClose={() => setShowAddressModal(false)}
        onAddressSelect={handleAddressSelect}
        onAddressChange={fetchAddresses}
      />
    </Box>
  );
}
