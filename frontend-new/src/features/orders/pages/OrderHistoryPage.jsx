import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Pagination,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', pageSize);
      params.append('offset', (page - 1) * pageSize);

      const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách đơn hàng');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(Math.ceil((data.total || data.orders.length) / pageSize) || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'confirmed': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!token) return null;

  return (
    <Box sx={{ width: '100%', py: 4, overflowX: 'hidden', bgcolor: '#F7FBF0', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#0D631B',
              fontFamily: 'Montserrat',
              mb: 1
            }}
          >
            Lịch sử mua hàng
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: '#666',
              mb: 3
            }}
          >
            Xem tất cả các đơn hàng
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#E8F5E9', border: '1px solid #0D631B' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1, fontWeight: 600 }}>
                  TỔNG ĐƠN HÀNG
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0D631B' }}>
                  {orders.filter(o => !statusFilter || o.status === statusFilter).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#FFF3E0', border: '1px solid #ff9800' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1, fontWeight: 600 }}>
                  ĐANG GIAO
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#ff9800' }}>
                  {orders.filter(o => o.status === 'shipped').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#E8F5E9', border: '1px solid #4caf50' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1, fontWeight: 600 }}>
                  ĐÃ GIAO
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#4caf50' }}>
                  {orders.filter(o => o.status === 'delivered').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#FFF8E1', border: '1px solid #fbc02d' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1, fontWeight: 600 }}>
                  TỔNG CHI TRỊ
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0D631B' }}>
                  {formatCurrency(
                    orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#fff' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#0D631B'
                    }
                  }
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="pending">Chờ xác nhận</MenuItem>
                <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                <MenuItem value="shipped">Đang giao</MenuItem>
                <MenuItem value="delivered">Đã giao</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setStatusFilter('');
                  setPage(1);
                }}
                sx={{
                  borderColor: '#0D631B',
                  color: '#0D631B',
                  '&:hover': {
                    borderColor: '#0D631B',
                    backgroundColor: '#F7FBF0'
                  }
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#0D631B' }} />
          </Box>
        )}

        {/* Table */}
        {!loading && orders.length > 0 && (
          <>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F7FBF0' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#0D631B', fontSize: 13 }}>
                      MÃ ĐƠN HÀNG
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#0D631B', fontSize: 13 }}>
                      TRẠNG THÁI
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0D631B', fontSize: 13 }}>
                      GIÁ TRỊ
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0D631B', fontSize: 13 }}>
                      NGÀY ĐẶT
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#0D631B', fontSize: 13 }}>
                      HÀNH ĐỘNG
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        '&:hover': { backgroundColor: '#f5f5f5' },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0D631B' }}>
                        {order.order_code || `#${order.id}`}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status)}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: '#666' }}>
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          sx={{
                            backgroundColor: '#0D631B',
                            color: '#fff',
                            textTransform: 'none',
                            fontSize: 12,
                            fontFamily: 'Montserrat',
                            '&:hover': {
                              backgroundColor: '#0a4d15'
                            }
                          }}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    '&.Mui-selected': {
                      backgroundColor: '#0D631B',
                      color: '#fff'
                    }
                  }
                }}
              />
            </Box>
          </>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#fff' }}>
            <Typography sx={{ fontSize: 16, color: '#999', mb: 2 }}>
              Chưa có đơn hàng nào
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#bbb', mb: 3 }}>
              {statusFilter ? 'Không có đơn hàng nào trong trạng thái này' : 'Hãy bắt đầu mua sắm để xem lịch sử giao dịch'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: '#0D631B',
                color: '#fff',
                textTransform: 'none',
                fontSize: 13,
                '&:hover': {
                  backgroundColor: '#0a4d15'
                }
              }}
            >
              Quay lại mua sắm
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
