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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { pricingPackageService } from '../../../services/api';
import PricingPackageForm from './PricingPackageForm';

export default function PricingPackageList({ supplierId }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  // Fetch packages
  useEffect(() => {
    loadPackages();
  }, [supplierId]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pricingPackageService.getSupplierPackages(supplierId);
      setPackages(response.data.packages || []);
    } catch (err) {
      setError('Không thể tải danh sách gói giá');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (pkg = null) => {
    if (pkg) {
      setSelectedPackage(pkg);
      setFormMode('edit');
    } else {
      setSelectedPackage(null);
      setFormMode('create');
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedPackage(null);
  };

  const handleSavePackage = async () => {
    await loadPackages();
    handleCloseForm();
  };

  const handleOpenDeleteDialog = (pkg) => {
    setSelectedPackage(pkg);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await pricingPackageService.deletePackage(selectedPackage.id);
      setError('');
      await loadPackages();
      setOpenDeleteDialog(false);
      setSelectedPackage(null);
    } catch (err) {
      setError('Không thể xóa gói giá');
      console.error('Error deleting package:', err);
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
        <Typography variant="h6">Danh sách gói giá</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Tạo gói mới
        </Button>
      </Box>

      {packages.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            Chưa có gói giá nào. Hãy tạo gói giá đầu tiên!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Tên gói</TableCell>
                <TableCell align="right">Giá gốc</TableCell>
                <TableCell align="right">Giá gói</TableCell>
                <TableCell align="right">Tiết kiệm</TableCell>
                <TableCell align="center">Hạn sử dụng</TableCell>
                <TableCell align="center">Tồn kho</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map((pkg) => {
                const totalOriginal = pkg.value?.total_original_value || 0;
                const savings = totalOriginal - (pkg.package_price || 0);
                const savingsPercent = totalOriginal > 0 ? Math.round((savings / totalOriginal) * 100) : 0;

                return (
                  <TableRow key={pkg.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{pkg.package_name}</Typography>
                        {pkg.description && (
                          <Typography variant="caption" color="textSecondary">
                            {pkg.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="textSecondary">
                        {totalOriginal?.toLocaleString('vi-VN')}₫
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {pkg.package_price?.toLocaleString('vi-VN')}₫
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`-${savings?.toLocaleString('vi-VN')}₫ (${savingsPercent}%)`}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {pkg.expiry_date ? new Date(pkg.expiry_date).toLocaleDateString('vi-VN') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={pkg.stock_quantity || 0} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={pkg.is_active ? 'Hoạt động' : 'Tắt'}
                        color={pkg.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(pkg)}
                        title="Chỉnh sửa"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(pkg)}
                        title="Xóa"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          {formMode === 'create' ? 'Tạo gói giá mới' : 'Chỉnh sửa gói giá'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <PricingPackageForm
              packageData={selectedPackage}
              mode={formMode}
              onSave={handleSavePackage}
              onCancel={handleCloseForm}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa gói giá</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa gói giá "{selectedPackage?.package_name}"?
            Tất cả sản phẩm trong gói sẽ được xóa.
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
