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
  Alert,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { pricingTierService, productService } from '../../../services/api';
import PricingTierForm from './PricingTierForm';

export default function PricingTierList({ supplierId }) {
  const [tiers, setTiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [formMode, setFormMode] = useState('create');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [supplierId]);

  // Load tiers when product is selected
  useEffect(() => {
    if (selectedProductId) {
      loadTiers();
    }
  }, [selectedProductId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.data.products || []);
      
      // Select first product by default
      if (response.data.products && response.data.products.length > 0) {
        setSelectedProductId(response.data.products[0].id);
      }
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error loading products:', err);
    }
  };

  const loadTiers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pricingTierService.getProductTiers(selectedProductId);
      setTiers(response.data.tiers || []);
    } catch (err) {
      setError('Không thể tải danh sách tầng giá');
      console.error('Error loading tiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (tier = null) => {
    if (tier) {
      setSelectedTier(tier);
      setFormMode('edit');
    } else {
      setSelectedTier(null);
      setFormMode('create');
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTier(null);
  };

  const handleSaveTier = async () => {
    await loadTiers();
    handleCloseForm();
  };

  const handleOpenDeleteDialog = (tier) => {
    setSelectedTier(tier);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await pricingTierService.deleteTier(selectedTier.id);
      setError('');
      await loadTiers();
      setOpenDeleteDialog(false);
      setSelectedTier(null);
    } catch (err) {
      setError('Không thể xóa tầng giá');
      console.error('Error deleting tier:', err);
    }
  };

  if (loading && selectedProductId) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Product Selector */}
      <FormControl sx={{ mb: 3, minWidth: 300 }} size="small">
        <InputLabel>Chọn sản phẩm</InputLabel>
        <Select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          label="Chọn sản phẩm"
        >
          {products.map((product) => (
            <MenuItem key={product.id} value={product.id}>
              {product.name} - {product.current_price?.toLocaleString('vi-VN')}₫
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedProduct && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Danh sách tầng giá</Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedProduct.name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Thêm tầng giá
          </Button>
        </Box>
      )}

      {tiers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            Chưa có tầng giá nào cho sản phẩm này. Hãy tạo tầng giá đầu tiên!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Số lượng</TableCell>
                <TableCell align="right">Đến</TableCell>
                <TableCell align="right">Giá/đơn vị</TableCell>
                <TableCell align="center">Chiết khấu</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.id} hover>
                  <TableCell>
                    Từ {tier.min_quantity}
                  </TableCell>
                  <TableCell align="right">
                    {tier.max_quantity ? `Đến ${tier.max_quantity}` : '∞'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      {tier.tier_price?.toLocaleString('vi-VN')}₫
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {tier.discount_percentage > 0 ? (
                      <Chip
                        label={`-${tier.discount_percentage}%`}
                        color="success"
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {tier.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={tier.is_active ? 'Hoạt động' : 'Tắt'}
                      color={tier.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(tier)}
                      title="Chỉnh sửa"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteDialog(tier)}
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

      {/* Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {formMode === 'create' ? 'Thêm tầng giá mới' : 'Chỉnh sửa tầng giá'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <PricingTierForm
            tierData={selectedTier}
            productId={parseInt(selectedProductId)}
            mode={formMode}
            onSave={handleSaveTier}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa tầng giá</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa tầng giá từ {selectedTier?.min_quantity}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
