import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { pricingPackageService, productService } from '../../../services/api';

export default function ManagePackageItems({ packageId }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
  });

  // Load items and products
  useEffect(() => {
    loadData();
  }, [packageId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load package details with items
      const pkgResponse = await pricingPackageService.getPackageDetail(packageId);
      setItems(pkgResponse.data.items || []);

      // Load supplier's products
      const prodResponse = await productService.getAll();
      setProducts(prodResponse.data.products || []);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode = 'add', item = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        product_id: item.id,
        quantity: item.quantity,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        product_id: '',
        quantity: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({
      product_id: '',
      quantity: 1,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) : value,
    });
  };

  const handleSave = async () => {
    if (!formData.product_id || formData.quantity <= 0) {
      setError('Vui lòng chọn sản phẩm và nhập số lượng > 0');
      return;
    }

    try {
      if (dialogMode === 'add') {
        await pricingPackageService.addItemToPackage(
          packageId,
          formData.product_id,
          formData.quantity
        );
      } else if (dialogMode === 'edit') {
        await pricingPackageService.updateItemQuantity(
          packageId,
          formData.product_id,
          formData.quantity
        );
      }

      setError('');
      await loadData();
      handleCloseDialog();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Có lỗi xảy ra';
      setError(errMsg);
      console.error('Error saving item:', err);
    }
  };

  const handleDeleteItem = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi gói?')) {
      return;
    }

    try {
      await pricingPackageService.removeItemFromPackage(packageId, productId);
      setError('');
      await loadData();
    } catch (err) {
      setError('Không thể xóa sản phẩm');
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          Sản phẩm trong gói ({items.length})
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">
            Chưa có sản phẩm nào. Hãy thêm sản phẩm vào gói!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell align="right">Số lượng</TableCell>
                <TableCell align="right">Giá hiện tại</TableCell>
                <TableCell align="center">Hạn sử dụng</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2">{item.name}</Typography>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {item.current_price?.toLocaleString('vi-VN')}₫
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="textSecondary">
                      {item.expiry_date 
                        ? new Date(item.expiry_date).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog('edit', item)}
                      title="Chỉnh sửa"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Xóa"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Thêm sản phẩm vào gói' : 'Cập nhật sản phẩm'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }} size="small">
            <InputLabel>Chọn sản phẩm</InputLabel>
            <Select
              name="product_id"
              value={formData.product_id}
              onChange={handleInputChange}
              label="Chọn sản phẩm"
              disabled={dialogMode === 'edit'}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} ({product.current_price?.toLocaleString('vi-VN')}₫)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Số lượng"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {dialogMode === 'add' ? 'Thêm' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
