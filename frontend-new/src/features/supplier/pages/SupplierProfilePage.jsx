import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import LocationPicker from '../../../components/common/LocationPicker';

export default function SupplierProfilePage() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');

  // Redirect if not supplier
  useEffect(() => {
    if (userType !== 'supplier' || !token) {
      navigate('/');
    }
  }, [userType, token, navigate]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [message, setMessage] = useState('');

  // Store Information State
  const [supplierData, setSupplierData] = useState({
    company_name: '',
    tax_id: '',
    warehouse_address: '',
    contact_phone: '',
    contact_email: ''
  });

  // Location State
  const [supplierLocation, setSupplierLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSupplierData();
      fetchLocation();
    }
  }, [token]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const supplierDetails = response.data.supplier_details;

      if (supplierDetails) {
        setSupplierData({
          company_name: supplierDetails.company_name || '',
          tax_id: supplierDetails.tax_id || '',
          warehouse_address: supplierDetails.warehouse_address || '',
          contact_phone: supplierDetails.contact_phone || '',
          contact_email: supplierDetails.contact_email || ''
        });
      }
    } catch (err) {
      console.error('Error fetching supplier data:', err);
      setMessage({
        type: 'error',
        text: 'Lỗi khi tải thông tin'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocation = async () => {
    try {
      setLoadingLocation(true);
      const response = await api.get('/auth/supplier-location');
      if (response.data?.location) {
        setSupplierLocation(response.data.location);
      }
    } catch (err) {
      console.error('Error fetching supplier location:', err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSupplier = async () => {
    try {
      setSaving(true);
      await api.put('/auth/supplier-profile', supplierData);
      setMessage({
        type: 'success',
        text: 'Cập nhật thông tin cửa hàng thành công'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi cập nhật thông tin cửa hàng'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSelected = async (location) => {
    try {
      setSavingLocation(true);
      const response = await api.put('/auth/supplier-location', {
        latitude: location.lat,
        longitude: location.lng,
        address: location.address
      });
      
      setSupplierLocation(response.data.location);
      setShowLocationPicker(false);
      setMessage({
        type: 'success',
        text: 'Cập nhật vị trí thành công'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi lưu vị trí'
      });
    } finally {
      setSavingLocation(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 3, bgcolor: '#F7FBF0' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Thông tin cửa hàng
          </Typography>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none', mb: 4 }}>
          <CardContent>
            {/* Thông Tin Cửa Hàng */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
                Thông tin cơ bản
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên cửa hàng*"
                    name="company_name"
                    value={supplierData.company_name}
                    onChange={handleSupplierChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mã số thuế*"
                    name="tax_id"
                    value={supplierData.tax_id}
                    onChange={handleSupplierChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ kho hàng*"
                    name="warehouse_address"
                    value={supplierData.warehouse_address}
                    onChange={handleSupplierChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại liên hệ"
                    name="contact_phone"
                    value={supplierData.contact_phone}
                    onChange={handleSupplierChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email liên hệ"
                    name="contact_email"
                    value={supplierData.contact_email}
                    onChange={handleSupplierChange}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                disabled={saving}
                onClick={handleSaveSupplier}
                sx={{
                  mt: 3,
                  backgroundColor: '#0D631B',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#0B5717' },
                  '&:disabled': { backgroundColor: '#0D631B', opacity: 0.6, color: '#FFFFFF' },
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  py: 2,
                  borderRadius: '8px'
                }}
              >
                {saving ? <CircularProgress size={20} sx={{ mr: 1, color: '#FFFFFF' }} /> : 'Lưu thông tin cửa hàng'}
              </Button>
            </Box>

            {/* Divider */}
            <Box sx={{ borderTop: '1px solid #BFCABA', my: 4 }} />

            {/* Vị Trí Cửa Hàng */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
                📍 Vị trí cửa hàng
              </Typography>

              {loadingLocation ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : supplierLocation && supplierLocation.latitude ? (
                <Card sx={{ backgroundColor: 'transparent', border: '2px solid #0D631B', borderRadius: '12px', mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 16, color: '#181D17', mb: 1 }}>
                          📍 {supplierLocation.company_name ? supplierLocation.company_name : 'Vị trí cửa hàng'}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#40493D', mb: 0.5 }}>
                          {supplierLocation.supplier_address ? supplierLocation.supplier_address : 'Không có địa chỉ'}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#999' }}>
                          Tọa độ: {Number(supplierLocation.latitude)?.toFixed(6) || '0'}, {Number(supplierLocation.longitude)?.toFixed(6) || '0'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Typography sx={{ textAlign: 'center', py: 3, color: '#707A6C', mb: 2 }}>
                  Chưa có vị trí. Vui lòng chọn vị trí chi nhánh trên bản đồ.
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowLocationPicker(true)}
                sx={{
                  backgroundColor: '#0D631B',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#0B5717' },
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  py: 2,
                  borderRadius: '8px'
                }}
              >
                {supplierLocation && supplierLocation.latitude ? '🔄 Cập nhật vị trí' : '📍 Chọn vị trí trên bản đồ'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Location Picker Dialog */}
      <Dialog
        open={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Myriad Condensed', fontWeight: 700, fontSize: 18, color: '#181D17' }}>
          📍 Chọn vị trí cửa hàng trên bản đồ
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {savingLocation ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <LocationPicker
              onLocationSelected={handleLocationSelected}
              initialLocation={
                supplierLocation?.latitude && supplierLocation?.longitude 
                  ? { lat: supplierLocation.latitude, lng: supplierLocation.longitude, address: supplierLocation.supplier_address } 
                  : null
              }
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowLocationPicker(false)}
            sx={{ color: '#707A6C', textTransform: 'none' }}
          >
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
