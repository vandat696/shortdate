import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddressManagementModal = ({ open, onClose, onAddressSelect, onAddressChange }) => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load addresses on modal open
  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [open]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data);
    } catch (err) {
      setError('Lỗi khi tải địa chỉ');
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      setError('');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      if (onAddressChange) onAddressChange();
    } catch (err) {
      setError('Lỗi khi xóa địa chỉ');
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      await axios.patch(`/api/addresses/${addressId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }))
      );
      if (onAddressChange) onAddressChange();
    } catch (err) {
      setError('Lỗi khi cập nhật địa chỉ mặc định');
      console.error('Error setting default:', err);
    }
  };

  const handleSelectAddress = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', backgroundColor: '#F7FBF0' },
      }}
    >
      <DialogTitle sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '20px', color: '#181D17' }}>
        📍 Chọn Địa Chỉ Giao Hàng
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && addresses.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 3, color: '#40493D' }}>
            Bạn chưa có địa chỉ nào. Vui lòng thêm một địa chỉ mới.
          </Typography>
        ) : (
          !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {addresses.map((address) => (
                <Card
                  key={address.id}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: address.is_default ? '2px solid #0D631B' : '1px solid #BFCABA',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '16px', color: '#181D17' }}>
                        {address.label}
                      </Typography>
                      {address.is_default && (
                        <Chip label="Mặc định" size="small" sx={{ backgroundColor: '#0D631B', color: '#FFFFFF' }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#40493D', mb: 0.5 }}>
                      {address.full_name} • {address.phone_number}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#40493D' }}>
                      {address.street_address}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#40493D' }}>
                      {address.ward && `${address.ward}, `}
                      {address.district}, {address.city}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', pt: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Button
                        size="small"
                        onClick={() => handleSelectAddress(address)}
                        sx={{ color: '#0D631B', fontWeight: 700 }}
                      >
                        Chọn
                      </Button>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        title="Xóa"
                        onClick={() => handleDelete(address.id)}
                        sx={{ color: '#964900' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {!address.is_default && (
                        <IconButton
                          size="small"
                          onClick={() => handleSetDefault(address.id)}
                          title="Đặt làm mặc định"
                          sx={{ color: '#707A6C' }}
                        >
                          <RadioButtonUncheckedIcon fontSize="small" />
                        </IconButton>
                      )}
                      {address.is_default && (
                        <IconButton size="small" sx={{ color: '#0D631B' }}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#707A6C', textTransform: 'none' }}>
          Đóng
        </Button>
        <Button
          onClick={handleAddNew}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#0D631B',
            '&:hover': { backgroundColor: '#0a4d15' },
            textTransform: 'none'
          }}
        >
          Thêm Địa Chỉ Mới
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressManagementModal;
