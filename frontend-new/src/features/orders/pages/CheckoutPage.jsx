import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardMedia,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart.jsx';
import LocationPicker from '../../../components/common/LocationPicker';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function formatMMSS(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cart, fetchCart, clearCart, getSelectedItems } = useCart();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryMethod, setDeliveryMethod] = useState('express');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // PDF: “Complete order in 05:00 minutes to secure this price and inventory”
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  const selectedItems = getSelectedItems();

  const computed = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const expressFee = Math.ceil(subtotal * 0.05);
    const standardFee = Math.max(expressFee, 5000);
    const shippingFee = deliveryMethod === 'express' ? expressFee : standardFee;
    return { subtotal, shippingFee, grandTotal: subtotal + shippingFee };
  }, [selectedItems, deliveryMethod]);

  const placeOrder = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
          items: selectedItems.map(item => ({
            productId: item.product_id,
            quantity: item.quantity
          }))
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Không thể tạo đơn hàng');

      await clearCart();
      navigate(`/orders/${data.order.id}/track`);
    } catch (e) {
      setError(e?.message || 'Lỗi không xác định');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>Bạn cần đăng nhập để thanh toán</Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>Đăng nhập</Button>
        </Paper>
      </Container>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>Vui lòng chọn sản phẩm để thanh toán</Typography>
          <Button variant="contained" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      bgcolor: '#F7FBF0',
      overflowX: 'hidden',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px 24px',
        width: '100%',
        bgcolor: '#F7FBF0',
        borderBottom: 'none'
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1280px',
          mx: 'auto'
        }}>
          <Typography sx={{ 
            fontFamily: 'Myriad Condensed',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '32px',
            color: '#0D631B',
            letterSpacing: '-1.2px'
          }}>
            ShortDate
          </Typography>
          <Box sx={{ display: 'flex', gap: '24px' }}>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '14px',
              color: '#181D17',
              cursor: 'pointer'
            }}>
              Trang Chủ
            </Typography>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '14px',
              color: '#181D17',
              cursor: 'pointer'
            }}>
              Sản Phẩm
            </Typography>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '14px',
              color: '#181D17',
              cursor: 'pointer'
            }}>
              Giỏ Hàng
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '17px', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ width: '19px', height: '19px', bgcolor: '#0D631B' }} />
              <Box sx={{ 
                position: 'absolute',
                right: '-6.63px',
                top: '-7.6px',
                width: '17.54px',
                height: '18.05px',
                bgcolor: '#964900',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700
              }}>
                3
              </Box>
            </Box>
            <Box sx={{ width: '19px', height: '19px', bgcolor: '#0D631B' }} />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '48px 24px 96px',
        gap: '32px',
        width: '100%',
        flex: 1
      }}>
        {/* Urgency Messaging */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 24px',
            gap: '12px',
            bgcolor: '#FFDCC6',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '9999px',
            maxWidth: '543px'
          }}>
            <Box sx={{ width: '18px', height: '21px', bgcolor: '#964900' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Typography sx={{ 
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '14px',
                color: '#311300'
              }}>
                Hoàn tất trong
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Liberation Mono',
                fontWeight: 600,
                fontSize: '18px',
                color: '#311300'
              }}>
                {formatMMSS(secondsLeft)}
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '14px',
                color: '#311300'
              }}>
                để bảo đảm giá và tồn kho
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Container */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 378.67px',
          gap: '32px',
          width: '100%',
          maxWidth: '1232px',
          mx: 'auto'
        }}>
          {/* Left Column: Cart & Checkout Form */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}>
            {/* Cart List Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                <Box>
                  <Typography sx={{ 
                    fontFamily: 'Myriad Condensed',
                    fontWeight: 800,
                    fontSize: '30px',
                    lineHeight: '36px',
                    color: '#181D17',
                    letterSpacing: '-0.75px'
                  }}>
                    Lựa Chọn Của Bạn
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#0D631B'
                }}>
                  {selectedItems.length} sản phẩm
                </Typography>
              </Box>

              <Stack spacing={3}>
                {selectedItems.map((item) => (
                  <Box key={item.product_id} sx={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: '16px',
                    gap: '24px',
                    bgcolor: '#FFFFFF',
                    borderRadius: '12px'
                  }}>
                    {/* Product Image */}
                    <Box sx={{ 
                      width: '128px',
                      height: '128px',
                      borderRadius: '8px',
                      bgcolor: '#E8E8E8',
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: '100%',
                        height: '100%',
                        bgcolor: '#DDD'
                      }} />
                      {/* Discount Badge */}
                      <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '4px 8px',
                        bgcolor: 'rgba(252, 130, 12, 0.85)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: '0px 0px 0px 8px',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        -15%
                      </Box>
                    </Box>

                    {/* Product Details */}
                    <Box sx={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '20px'
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography sx={{ 
                            fontFamily: 'Myriad Condensed',
                            fontWeight: 700,
                            fontSize: '18px',
                            lineHeight: '22px',
                            color: '#181D17',
                            mb: 1
                          }}>
                            {item.product?.name || `Sản phẩm #${item.product_id}`}
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#707A6C'
                          }}>
                            {item.product?.supplier || 'ShortDate'}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end'
                        }}>
                          <Typography sx={{ 
                            fontFamily: 'Inter',
                            fontWeight: 700,
                            fontSize: '18px',
                            color: '#181D17'
                          }}>
                            {Math.round(item.subtotal || 0).toLocaleString('vi-VN')}đ
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#707A6C',
                            textDecoration: 'line-through'
                          }}>
                            {Math.round((item.subtotal || 0) * 1.18).toLocaleString('vi-VN')}đ
                          </Typography>
                        </Box>
                      </Box>

                      {/* Quantity Selector */}
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: '4px',
                          gap: 0,
                          width: '112px',
                          height: '40px',
                          bgcolor: '#EBEFE5',
                          borderRadius: '8px'
                        }}>
                          <IconButton sx={{ width: '32px', height: '32px', borderRadius: '6px', color: '#0D631B' }}>
                            −
                          </IconButton>
                          <Typography sx={{ 
                            flex: 1,
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#181D17'
                          }}>
                            {item.quantity}
                          </Typography>
                          <IconButton sx={{ width: '32px', height: '32px', borderRadius: '6px', color: '#0D631B' }}>
                            +
                          </IconButton>
                        </Box>
                        <IconButton sx={{ color: '#707A6C' }}>
                          🗑
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Checkout Form Section */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '32px',
              gap: '32px',
              bgcolor: '#F1F5EB',
              borderRadius: '32px'
            }}>
              {/* Address Selector */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <LocationOnIcon sx={{ color: '#0D631B', fontSize: '20px' }} />
                  <Typography sx={{ 
                    fontFamily: 'Myriad Condensed',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#181D17'
                  }}>
                    Địa Chỉ Giao Hàng
                  </Typography>
                </Box>

                {showMapPicker ? (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <LocationPicker 
                      onLocationSelected={(location) => {
                        setSelectedLocation(location);
                        setShippingAddress(location.address);
                        setShowMapPicker(false);
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Selected Address */}
                    <Box sx={{ 
                      padding: '16px',
                      bgcolor: '#FFFFFF',
                      border: '2px solid #0D631B',
                      borderRadius: '12px',
                      position: 'relative'
                    }}>
                      <Typography sx={{ 
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#181D17',
                        mb: 1
                      }}>
                        📍 {selectedLocation ? 'Vị Trí Đã Chọn' : 'Nhà'}
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#40493D',
                        mb: 0.5
                      }}>
                        {selectedLocation?.address || '123 Green Lane, Eco District'}
                      </Typography>
                      {selectedLocation && (
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '10px',
                          color: '#999'
                        }}>
                          {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </Typography>
                      )}
                      {!selectedLocation && (
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#40493D'
                        }}>
                          Quận 1, TP.HCM
                        </Typography>
                      )}
                      <Box sx={{ 
                        position: 'absolute',
                        right: '17px',
                        top: '17px',
                        width: '18px',
                        height: '18px',
                        bgcolor: '#0D631B',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{ width: '6px', height: '6px', bgcolor: 'white', borderRadius: '50%' }} />
                      </Box>
                    </Box>

                    {/* Add Address Button */}
                    <Button 
                      variant="outlined" 
                      onClick={() => setShowMapPicker(true)}
                      sx={{ 
                        borderStyle: 'dashed',
                        borderColor: '#BFCABA',
                        borderRadius: '12px',
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#0D631B',
                        textTransform: 'none',
                        fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    📍 Thêm Địa Chỉ
                  </Button>
                </Box>
            )}
              </Box>

              {/* Delivery Method */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <LocalShippingIcon sx={{ color: '#0D631B', fontSize: '20px' }} />
                  <Typography sx={{ 
                    fontFamily: 'Myriad Condensed',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#181D17'
                  }}>
                    Phương Thức Giao Hàng
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  {/* Express Option */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    bgcolor: '#FFFFFF',
                    border: deliveryMethod === 'express' ? '1px solid #0D631B' : '1px solid rgba(191, 202, 186, 0.15)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    onClick: () => setDeliveryMethod('express')
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Box sx={{ 
                        width: '40px',
                        height: '40px',
                        bgcolor: '#FFDCC6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        🚀
                      </Box>
                      <Box>
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#181D17'
                        }}>
                          Giao Hỏa Tốc
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#40493D'
                        }}>
                          Giao trong 2-4 giờ (Nội thành)
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#0D631B',
                          mt: 0.5
                        }}>
                          +25.000đ
                        </Typography>
                      </Box>
                    </Box>
                    <Radio checked={deliveryMethod === 'express'} />
                  </Box>

                  {/* Standard Option */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    bgcolor: '#FFFFFF',
                    opacity: 0.6,
                    border: '1px solid rgba(191, 202, 186, 0.15)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Box sx={{ 
                        width: '40px',
                        height: '40px',
                        bgcolor: '#E0E4DA',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        📦
                      </Box>
                      <Box>
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#181D17'
                        }}>
                          Giao Nhanh
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#40493D'
                        }}>
                          Giao trong 1-2 ngày (Toàn quốc)
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Inter',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#707A6C',
                          mt: 0.5
                        }}>
                          +15.000đ
                        </Typography>
                      </Box>
                    </Box>
                    <Radio checked={false} />
                  </Box>
                </Stack>
              </Box>

              {/* Payment Methods */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <PaymentIcon sx={{ color: '#0D631B', fontSize: '20px' }} />
                  <Typography sx={{ 
                    fontFamily: 'Myriad Condensed',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#181D17'
                  }}>
                    Phương Thức Thanh Toán
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '12px'
                }}>
                  {[
                    { value: 'cod', label: '💳', name: 'COD' },
                    { value: 'momo', label: '📱', name: 'MoMo' },
                    { value: 'zalopay', label: '⚡', name: 'ZaloPay' },
                    { value: 'vnpay', label: '🏦', name: 'VNPay' },
                    { value: 'visa', label: '💳', name: 'Thẻ' }
                  ].map((method) => (
                    <Button 
                      key={method.value}
                      variant={paymentMethod === method.value ? 'contained' : 'outlined'}
                      onClick={() => setPaymentMethod(method.value)}
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        height: '65px',
                        borderRadius: '12px',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: paymentMethod === method.value ? 'white' : '#181D17',
                        border: paymentMethod === method.value ? 'none' : '2px solid #0D631B',
                        bgcolor: paymentMethod === method.value ? '#0D631B' : 'white',
                        '&:first-of-type': {
                          borderColor: paymentMethod === method.value ? 'transparent' : '#0D631B',
                          borderWidth: paymentMethod === method.value ? '2px' : '2px'
                        }
                      }}
                    >
                      <Box sx={{ fontSize: '20px' }}>{method.label}</Box>
                      {method.name}
                    </Button>
                  ))}
                </Box>
              </Box>

              {error && (
                <Typography color="error" sx={{ fontFamily: 'Inter', fontSize: '14px' }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right Column: Order Summary */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Order Summary Card */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '32px',
              gap: '32px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(191, 202, 186, 0.1)',
              boxShadow: '0px 32px 64px rgba(24, 29, 23, 0.04)',
              borderRadius: '32px'
            }}>
              <Typography sx={{ 
                fontFamily: 'Myriad Condensed',
                fontWeight: 800,
                fontSize: '24px',
                lineHeight: '32px',
                color: '#181D17'
              }}>
                Tóm Tắt Đơn Hàng
              </Typography>

              <Stack spacing={1.5} sx={{ width: '100%' }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#40493D'
                  }}>
                    Tổng sản phẩm
                  </Typography>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#40493D'
                  }}>
                    {Math.round(computed.subtotal).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#40493D'
                  }}>
                    Phí giao hàng
                  </Typography>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#40493D'
                  }}>
                    {Math.round(computed.shippingFee).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>

                {/* Savings Display */}
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  bgcolor: 'rgba(46, 125, 50, 0.1)',
                  border: '1px solid rgba(13, 99, 27, 0.2)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box sx={{ 
                      width: '10px',
                      height: '10px',
                      bgcolor: '#0D631B',
                      borderRadius: '50%'
                    }} />
                    <Typography sx={{ 
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#0D631B'
                    }}>
                      Bạn tiết kiệm
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 900,
                    fontSize: '16px',
                    color: '#0D631B'
                  }}>
                    128.750đ
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(191, 202, 186, 0.15)', my: 2 }} />

                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  pt: 2
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                    color: '#707A6C'
                  }}>
                    TỔNG CỘNG
                  </Typography>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 900,
                    fontSize: '36px',
                    lineHeight: '36px',
                    letterSpacing: '-1.8px',
                    color: '#181D17'
                  }}>
                    {Math.round(computed.grandTotal).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
              </Stack>

              {/* Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={placeOrder}
                disabled={submitting || secondsLeft === 0}
                sx={{ 
                  padding: '20px 0px',
                  gap: '12px',
                  bgcolor: '#0D631B',
                  color: 'white',
                  fontFamily: 'Myriad Condensed',
                  fontWeight: 800,
                  fontSize: '20px',
                  borderRadius: '16px',
                  boxShadow: '0px 10px 15px -3px rgba(13, 99, 27, 0.2), 0px 4px 6px -4px rgba(13, 99, 27, 0.2)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#0D631B'
                  }
                }}
              >
                🛒 Đặt Hàng Ngay
              </Button>
            </Box>

            {/* Recent Activity Card */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              gap: '24px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(191, 202, 186, 0.15)',
              borderLeft: '1px solid rgba(191, 202, 186, 0.15)',
              boxShadow: '0px 32px 64px rgba(24, 29, 23, 0.04)',
              borderRadius: '24px'
            }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Box sx={{ width: '18px', height: '18px', bgcolor: '#0D631B' }} />
                <Typography sx={{ 
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#181D17'
                }}>
                  Gần Đây
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ width: '100%' }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '12px',
                  gap: '12px',
                  bgcolor: '#EBEFE5',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ width: '10px', height: '12px', bgcolor: '#0D631B' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ 
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: '#0D631B'
                    }}>
                      Fresh Veggie Box
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '10px',
                      color: '#0D631B',
                      opacity: 0.7
                    }}>
                      Giao hôm qua
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: '#0D631B'
                  }}>
                    125.000đ
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '12px',
                  gap: '12px'
                }}>
                  <Box sx={{ width: '12px', height: '11px', bgcolor: '#181D17' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ 
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: '#181D17'
                    }}>
                      Danh Sách Lưu (12)
                    </Typography>
                  </Box>
                  <Box sx={{ width: '4px', height: '6px', bgcolor: '#181D17' }} />
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        bgcolor: '#EBEFE5',
        borderRadius: '32px 32px 0px 0px',
        mt: 'auto'
      }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
          padding: '48px 32px 27px',
          width: '100%'
        }}>
          {/* Brand */}
          <Box>
            <Typography sx={{ 
              fontFamily: 'Myriad Condensed',
              fontWeight: 700,
              fontSize: '18px',
              color: '#0D631B',
              mb: 2
            }}>
              ShortDate
            </Typography>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '12px',
              color: '#475569',
              letterSpacing: '0.3px',
              textTransform: 'uppercase'
            }}>
              © 2024 ShortDate. Mỗi miếng đều có ý nghĩa.
            </Typography>
          </Box>

          {/* Policies */}
          <Box>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '10px',
              color: '#0D631B',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mb: 2
            }}>
              Chính Sách
            </Typography>
            <Stack spacing={1}>
              <Typography sx={{ 
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                color: '#475569',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}>
                Chính Sách Giao Hàng
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                color: '#475569',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}>
                Quyền Riêng Tư
              </Typography>
            </Stack>
          </Box>

          {/* Company */}
          <Box>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '10px',
              color: '#0D631B',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mb: 2
            }}>
              Công Ty
            </Typography>
            <Stack spacing={1}>
              <Typography sx={{ 
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                color: '#475569',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}>
                Về Chúng Tôi
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                color: '#475569',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}>
                Điều Khoản Dịch Vụ
              </Typography>
            </Stack>
          </Box>

          {/* Support */}
          <Box>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '10px',
              color: '#0D631B',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mb: 2
            }}>
              Hỗ Trợ
            </Typography>
            <Typography sx={{ 
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '12px',
              color: '#475569',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}>
              Liên Hệ Chúng Tôi
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

