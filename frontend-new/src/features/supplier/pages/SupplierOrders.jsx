import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../../services/api';

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // This would need a backend endpoint to get supplier's orders
      const response = await api.get('/orders/supplier');
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setMessage({ type: 'error', text: 'Lỗi khi tải danh sách đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return statusColors[status] || 'default';
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number?.toString().includes(searchTerm) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#964900', fontSize: '12px', lineHeight: '16px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        ĐƠN HÀNG
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#181D17', mb: 1, fontSize: '36px', lineHeight: '40px', letterSpacing: '-0.9px' }}>
        Quản lý đơn hàng
      </Typography>
      <Typography variant="body2" sx={{ color: '#40493D', fontSize: '16px', lineHeight: '24px', mb: 3 }}>
        Theo dõi và quản lý tất cả đơn hàng
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Tìm kiếm theo số đơn hàng hoặc tên khách hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
          }}
          sx={{ flex: 1 }}
          size="small"
        />
      </Box>

      {/* Orders Table */}
      <Card sx={{ borderRadius: '12px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F1F5EB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Số đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Khách hàng</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Ngày
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Số tiền
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Trạng thái
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} sx={{ borderTop: '1px solid #EBEFE5', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#2d5016' }}>
                        #{order.order_number || `ORD-${order.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {order.customer_name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#2d5016' }}>
                        ${order.total_amount?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={order.status || 'pending'}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOpenDetailDialog(true);
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 18, color: '#2d5016' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Không tìm thấy đơn hàng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Chi tiết đơn hàng</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#999' }}>Số đơn hàng</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  #{selectedOrder.order_number || `ORD-${selectedOrder.id}`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#999' }}>Khách hàng</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedOrder.customer_name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#999' }}>Ngày đặt hàng</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#999' }}>Số tiền</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#2d5016' }}>
                  ${selectedOrder.total_amount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#999' }}>Trạng thái</Typography>
                <Chip
                  label={selectedOrder.status || 'pending'}
                  color={getStatusColor(selectedOrder.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
