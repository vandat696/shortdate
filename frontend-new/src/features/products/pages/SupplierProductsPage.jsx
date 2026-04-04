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
  Button,
  Dialog,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Container,
  Grid
} from '@mui/material';
import api from '../../../services/api';
import ProductForm from '../components/ProductForm';

export default function SupplierProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventoryChange, setInventoryChange] = useState('');
  const [message, setMessage] = useState('');
  const [alerts, setAlerts] = useState({
    expiring: [],
    lowStock: []
  });

  useEffect(() => {
    fetchProducts();
    fetchAlerts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/supplier/list');
      setProducts(response.data.products || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi tải danh sách sản phẩm' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const expiring = await api.get('/products/supplier/alerts/expiring?days=7');
      const lowStock = await api.get('/products/supplier/alerts/low-stock');

      setAlerts({
        expiring: expiring.data.products || [],
        lowStock: lowStock.data.products || []
      });
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${productId}`);
        setMessage({ type: 'success', text: 'Xóa sản phẩm thành công' });
        fetchProducts();
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.response?.data?.error || 'Lỗi khi xóa sản phẩm'
        });
      }
    }
  };

  const handleInventoryUpdate = async () => {
    if (!inventoryChange || !selectedProduct) return;

    try {
      await api.patch(`/products/${selectedProduct.id}/inventory`, {
        quantity_change: parseInt(inventoryChange)
      });

      setMessage({ type: 'success', text: 'Cập nhật tồn kho thành công' });
      setOpenInventoryDialog(false);
      setInventoryChange('');
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi cập nhật tồn kho'
      });
    }
  };

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (showForm) {
    return (
      <Box sx={{ width: '100%', py: 3, overflowX: 'hidden', bgcolor: '#F7FBF0', overflow: 'hidden' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowForm(false);
              setEditingProduct(null);
              fetchProducts();
            }}
            sx={{ mb: 2 }}
          >
            ← Quay lại
          </Button>
          <ProductForm
            initialData={editingProduct}
            onSuccess={() => {
              setShowForm(false);
              setEditingProduct(null);
              fetchProducts();
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 3, overflowX: 'hidden', bgcolor: '#F7FBF0', overflow: 'hidden' }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3 }}>
        <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Quản lý sản phẩm
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
        >
          + Thêm sản phẩm mới
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Alerts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {alerts.expiring.length > 0 && (
          <Grid item xs={12} sm={6}>
            <Card sx={{ bgcolor: '#fff3cd' }}>
              <CardContent>
                <Typography color="warning" variant="h6">
                  ⚠️ Sắp hết hạn ({alerts.expiring.length})
                </Typography>
                <Typography variant="body2">
                  {alerts.expiring.map((p) => p.name).join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {alerts.lowStock.length > 0 && (
          <Grid item xs={12} sm={6}>
            <Card sx={{ bgcolor: '#f8d7da' }}>
              <CardContent>
                <Typography color="error" variant="h6">
                  🔴 Tồn kho thấp ({alerts.lowStock.length})
                </Typography>
                <Typography variant="body2">
                  {alerts.lowStock.map((p) => p.name).join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Products Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Sản phẩm</strong></TableCell>
                <TableCell align="right"><strong>Giá</strong></TableCell>
                <TableCell align="center"><strong>Tồn kho</strong></TableCell>
                <TableCell align="center"><strong>HSD</strong></TableCell>
                <TableCell align="center"><strong>Discount</strong></TableCell>
                <TableCell align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">
                      Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const daysLeft = calculateDaysLeft(product.expiry_date);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {product.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {product.current_price.toLocaleString('vi-VN')}đ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${product.stock_quantity} cái`}
                          size="small"
                          color={
                            product.stock_quantity === 0
                              ? 'error'
                              : product.stock_quantity <= (product.min_stock_threshold || 10)
                                ? 'warning'
                                : 'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${daysLeft} ngày`}
                          size="small"
                          color={daysLeft <= 7 ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${product.discount_percentage}%`}
                          size="small"
                          sx={{
                            bgcolor: '#ff9800',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedProduct(product);
                              setOpenInventoryDialog(true);
                            }}
                          >
                            Thay đổi lượng tồn kho
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEdit(product)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(product.id)}
                          >
                            Xóa
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Inventory Update Dialog */}
      <Dialog
        open={openInventoryDialog}
        onClose={() => setOpenInventoryDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cập nhật tồn kho: {selectedProduct?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Tồn kho hiện tại: {selectedProduct?.stock_quantity}
          </Typography>
          <TextField
            fullWidth
            label="Thay đổi số lượng (+ thêm, - giảm)"
            type="number"
            value={inventoryChange}
            onChange={(e) => setInventoryChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleInventoryUpdate}
              fullWidth
            >
              Cập nhật
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenInventoryDialog(false);
                setInventoryChange('');
              }}
              fullWidth
            >
              Hủy
            </Button>
          </Box>
        </Box>
      </Dialog>
      </Box>
    </Box>
  );
}
