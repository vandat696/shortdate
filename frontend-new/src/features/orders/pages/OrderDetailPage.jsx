import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { getImageUrl } from '../../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        if (!token) {
          setError('Vui lòng đăng nhập để xem đơn hàng');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Không thể lấy thông tin đơn hàng');
        }

        const data = await response.json();
        setOrder(data.order);
        setItems(data.items || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'shipped': '#9c27b0',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colors[status] || '#999';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'momo': 'Ví MoMo',
      'zalopay': 'ZaloPay',
      'vnpay': 'VNPay',
      'atm': 'Thẻ ATM nội địa',
      'visa': 'Thẻ Visa/Mastercard'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Về trang chủ
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Không tìm thấy đơn hàng</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Chi Tiết Đơn Hàng
          </Typography>
          <Button variant="contained" onClick={() => window.print()}>
            In Hóa Đơn
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary">Mã Đơn Hàng</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                #{order.id}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary">Trạng Thái</Typography>
              <Box sx={{
                display: 'inline-block',
                backgroundColor: getStatusColor(order.status),
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mt: 0.5,
                fontWeight: 600
              }}>
                {getStatusText(order.status)}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary">Ngày Đặt</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary">Thanh Toán</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                {getPaymentMethodText(order.paymentMethod)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Thông tin khách hàng */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Thông Tin Khách Hàng
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">Tên</Typography>
                <Typography variant="body2">{order.buyerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Email</Typography>
                <Typography variant="body2">{order.buyerEmail}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Địa Chỉ Giao Hàng
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {order.deliveryAddress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Danh sách sản phẩm */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, p: 2 }}>
          Chi Tiết Sản Phẩm
        </Typography>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Sản Phẩm</strong></TableCell>
              <TableCell align="right"><strong>Giá</strong></TableCell>
              <TableCell align="center"><strong>Số Lượng</strong></TableCell>
              <TableCell align="right"><strong>Tổng Tiền</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.productImage && (
                      <Box
                        component="img"
                        src={getImageUrl(item.productImage)}
                        sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                      />
                    )}
                    <Typography variant="body2">{item.productName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {item.unitPrice.toLocaleString('vi-VN')} ₫
                </TableCell>
                <TableCell align="center">
                  {item.quantity}
                </TableCell>
                <TableCell align="right">
                  <strong>{item.totalPrice.toLocaleString('vi-VN')} ₫</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tóm tắt tiền */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Grid container spacing={2} sx={{ maxWidth: 400 }}>
            <Grid item xs={8}>
              <Typography>Tạm tính:</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography>{order.subtotal?.toLocaleString('vi-VN') || '0'} ₫</Typography>
            </Grid>

            <Grid item xs={8}>
              <Typography>Phí vận chuyển:</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography>{order.shippingFee?.toLocaleString('vi-VN') || '0'} ₫</Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={8}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tổng Tiền:
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {order.totalAmount?.toLocaleString('vi-VN') || '0'} ₫
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Nút hành động */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Quay Lại Trang Chủ
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/profile')}
        >
          Xem Tất Cả Đơn Hàng
        </Button>
      </Box>
    </Container>
  );
}
