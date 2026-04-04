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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api, { getImageUrl } from '../../../services/api';
import LocationPicker from '../../../components/common/LocationPicker';
import axios from 'axios';


export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });

  // Store Information State (for suppliers)
  const [supplierData, setSupplierData] = useState({
    company_name: '',
    tax_id: '',
    warehouse_address: '',
    contact_phone: '',
    contact_email: ''
  });
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Address Management State
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    label: '',
    full_name: '',
    phone_number: '',
    street_address: '',
    ward: '',
    district: '',
    city: '',
    postal_code: '',
    is_default: false,
  });
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Location State
  const [userLocation, setUserLocation] = useState(null);
  const [supplierLocation, setSupplierLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!token || !userType) {
      navigate('/login');
      return;
    }
    
    fetchProfile();
    fetchAddresses();
    fetchLocation();
  }, [token, userType, navigate]);

  const fetchProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const user = response.data.user;
      const supplierDetails = response.data.supplier_details;

      setPersonalData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar_url: user?.avatar_url || ''
      });

      // Load supplier details if available
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
      console.error('Error fetching profile:', err);
      setMessage({
        type: 'error',
        text: 'Lỗi khi tải thông tin'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!token) return;
    
    try {
      setLoadingAddresses(true);
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch user/supplier location
  const fetchLocation = async () => {
    if (!token) return;
    
    try {
      setLoadingLocation(true);
      if (userType === 'supplier') {
        try {
          const response = await api.get('/auth/supplier-location');
          if (response.data?.location) {
            setSupplierLocation(response.data.location);
          }
        } catch (err) {
          console.error('Error fetching supplier location:', err);
        }
      } else {
        try {
          const response = await api.get('/auth/location');
          if (response.data?.location) {
            setUserLocation(response.data.location);
            // Lưu user location vào localStorage cho ProductCard sử dụng
            localStorage.setItem('userLocation', JSON.stringify({
              lat: response.data.location.latitude,
              lng: response.data.location.longitude
            }));
          }
        } catch (err) {
          console.error('Error fetching user location:', err);
        }
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  // Save location (for both users and suppliers)
  const handleLocationSelected = async (location) => {
    try {
      setSavingLocation(true);
      const endpoint = userType === 'supplier' ? '/auth/supplier-location' : '/auth/location';
      const response = await api.put(endpoint, {
        latitude: location.lat,
        longitude: location.lng,
        address: location.address
      });
      
      if (userType === 'supplier') {
        setSupplierLocation(response.data.location);
      } else {
        setUserLocation(response.data.location);
        // Lưu user location vào localStorage cho ProductCard sử dụng
        localStorage.setItem('userLocation', JSON.stringify({
          lat: response.data.location.latitude,
          lng: response.data.location.longitude
        }));
      }
      
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

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await axios.put(`${API_BASE_URL}/addresses/${editingAddress.id}`, addressFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({
          type: 'success',
          text: 'Cập nhật địa chỉ thành công'
        });
      } else {
        await axios.post(`${API_BASE_URL}/addresses`, addressFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({
          type: 'success',
          text: 'Thêm địa chỉ mới thành công'
        });
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi lưu địa chỉ'
      });
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({
        type: 'success',
        text: 'Xóa địa chỉ thành công'
      });
      fetchAddresses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Lỗi khi xóa địa chỉ'
      });
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.patch(`${API_BASE_URL}/addresses/${addressId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAddresses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Lỗi khi cập nhật địa chỉ mặc định'
      });
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      label: '',
      full_name: '',
      phone_number: '',
      street_address: '',
      ward: '',
      district: '',
      city: '',
      postal_code: '',
      is_default: false,
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonal = async () => {
    try {
      setSaving(true);
      await api.put('/auth/profile', personalData);
      setMessage({
        type: 'success',
        text: 'Cập nhật thông tin cá nhân thành công'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi cập nhật'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSupplier = async () => {
    try {
      setSavingSupplier(true);
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
      setSavingSupplier(false);
    }
  };

  if (!token || !userType || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 3, overflowX: 'hidden', bgcolor: '#F7FBF0', overflow: 'hidden' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Trang cá nhân
          </Typography>
        </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <CardContent>
          {/* Thông Tin Cá Nhân */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
              Thông tin cá nhân
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên*"
                  name="first_name"
                  value={personalData.first_name}
                  onChange={handlePersonalChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ*"
                  name="last_name"
                  value={personalData.last_name}
                  onChange={handlePersonalChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email*"
                  type="email"
                  value={personalData.email}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={personalData.phone}
                  onChange={handlePersonalChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL Ảnh đại diện"
                  name="avatar_url"
                  value={personalData.avatar_url}
                  onChange={handlePersonalChange}
                  helperText="Nhập đường link ảnh từ Internet"
                />
              </Grid>

              {personalData.avatar_url && (
                <Grid item xs={12}>
                  <Box
                    component="img"
                    src={getImageUrl(personalData.avatar_url)}
                    alt="Avatar preview"
                    sx={{ maxWidth: '150px', borderRadius: '8px' }}
                  />
                </Grid>
              )}
            </Grid>
            
            <Button
              variant="contained"
              fullWidth
              disabled={saving}
              onClick={handleSavePersonal}
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
              {saving ? <CircularProgress size={20} sx={{ mr: 1, color: '#FFFFFF' }} /> : 'Lưu thông tin'}
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ borderTop: '1px solid #BFCABA', my: 4 }} />

          {/* Địa Chỉ Giao Hàng */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
              Địa chỉ giao hàng
            </Typography>

            {loadingAddresses ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : addresses.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 3, color: '#707A6C' }}>
                Bạn chưa có địa chỉ nào. Vui lòng thêm một địa chỉ mới.
              </Typography>
            ) : (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {addresses.map((address) => (
                  <Grid item xs={12} key={address.id}>
                    <Card
                      sx={{
                        backgroundColor: 'transparent',
                        border: address.is_default ? '2px solid #0D631B' : '1px solid #BFCABA',
                        borderRadius: '12px',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#181D17' }}>
                                {address.label}
                              </Typography>
                              {address.is_default && (
                                <Chip label="Mặc định" size="small" sx={{ backgroundColor: '#0D631B', color: '#FFFFFF' }} />
                              )}
                            </Box>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#40493D', mb: 0.5 }}>
                              👤 {address.full_name} • 📞 {address.phone_number}
                            </Typography>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#40493D', mb: 0.3 }}>
                              {address.street_address}
                            </Typography>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#40493D' }}>
                              {address.ward && `${address.ward}, `}
                              {address.district}, {address.city} {address.postal_code && `- ${address.postal_code}`}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditAddress(address)}
                              title="Chỉnh sửa"
                              sx={{ color: '#707A6C' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAddress(address.id)}
                              title="Xóa"
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
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                resetAddressForm();
                setShowAddressForm(true);
              }}
              sx={{
                backgroundColor: '#964900',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#7A3700' },
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                py: 2,
                borderRadius: '8px',
                mt: 2
              }}
            >
              Thêm địa chỉ
            </Button>
          </Box>

          {/* Divider */}
          {userType === 'supplier' && <Box sx={{ borderTop: '1px solid #BFCABA', my: 4 }} />}

          {/* Thông Tin Cửa Hàng (chỉ hiển thị cho suppliers) */}
          {userType === 'supplier' && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
                Thông tin cửa hàng
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
                    type="email"
                    value={supplierData.contact_email}
                    onChange={handleSupplierChange}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                disabled={savingSupplier}
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
                {savingSupplier ? <CircularProgress size={20} sx={{ mr: 1, color: '#FFFFFF' }} /> : 'Lưu thông tin cửa hàng'}
              </Button>
            </Box>
          )}

          {/* Divider */}
          <Box sx={{ borderTop: '1px solid #BFCABA', my: 4 }} />

          {/* Vị Trí (Map Location) */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#181D17' }}>
              📍 Vị trí của {userType === 'supplier' ? 'cửa hàng' : 'bạn'}
            </Typography>

            {loadingLocation ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : userType === 'supplier' ? (
              // For Suppliers
              supplierLocation && supplierLocation.latitude ? (
                <Card sx={{ backgroundColor: 'transparent', border: '2px solid #0D631B', borderRadius: '12px', mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#181D17', mb: 1 }}>
                          📍 {supplierLocation.company_name ? supplierLocation.company_name : 'Vị trí cửa hàng'}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#40493D', mb: 0.5 }}>
                          {supplierLocation.supplier_address ? supplierLocation.supplier_address : 'Không có địa chỉ'}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#999' }}>
                          Tọa độ: {Number(supplierLocation.latitude)?.toFixed(6) || '0'}, {Number(supplierLocation.longitude)?.toFixed(6) || '0'}
                        </Typography>
                      </Box>
                      <Button
                        onClick={() => setShowLocationPicker(true)}
                        sx={{ color: '#0D631B', textTransform: 'none' }}
                      >
                        <EditIcon />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Typography sx={{ textAlign: 'center', py: 3, color: '#707A6C', mb: 2 }}>
                  Chưa có vị trí. Vui lòng chọn vị trí chi nhánh trên bản đồ.
                </Typography>
              )
            ) : (
              // For Buyers
              userLocation && userLocation.latitude ? (
                <Card sx={{ backgroundColor: 'transparent', border: '2px solid #0D631B', borderRadius: '12px', mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#181D17', mb: 1 }}>
                          📍 Vị trí của bạn
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 14, color: '#40493D', mb: 0.5 }}>
                          {userLocation.address ? userLocation.address : 'Không có địa chỉ'}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 12, color: '#999' }}>
                          Tọa độ: {Number(userLocation.latitude)?.toFixed(6) || '0'}, {Number(userLocation.longitude)?.toFixed(6) || '0'}
                        </Typography>
                      </Box>
                      <Button
                        onClick={() => setShowLocationPicker(true)}
                        sx={{ color: '#0D631B', textTransform: 'none' }}
                      >
                        <EditIcon />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Typography sx={{ textAlign: 'center', py: 3, color: '#707A6C', mb: 2 }}>
                  Chưa có vị trí. Vui lòng chọn vị trí trên bản đồ.
                </Typography>
              )
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowLocationPicker(true)}
              sx={{
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
              {userLocation || supplierLocation ? '🔄 Cập nhật vị trí' : '📍 Chọn vị trí trên bản đồ'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Address Form Dialog */}
      <Dialog
        open={showAddressForm}
        onClose={resetAddressForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, color: '#181D17' }}>
          {editingAddress ? '✏️ Chỉnh Sửa Địa Chỉ' : '➕ Thêm Địa Chỉ Mới'}
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nhãn địa chỉ (vd: Nhà, Văn phòng)*"
              name="label"
              value={addressFormData.label}
              onChange={handleAddressFormChange}
              fullWidth
              size="small"
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Họ và tên*"
                name="full_name"
                value={addressFormData.full_name}
                onChange={handleAddressFormChange}
                size="small"
                required
              />
              <TextField
                label="Số điện thoại*"
                name="phone_number"
                value={addressFormData.phone_number}
                onChange={handleAddressFormChange}
                size="small"
                required
              />
            </Box>
            <TextField
              label="Địa chỉ chi tiết*"
              name="street_address"
              value={addressFormData.street_address}
              onChange={handleAddressFormChange}
              fullWidth
              size="small"
              required
              multiline
              rows={2}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Phường/Xã"
                name="ward"
                value={addressFormData.ward}
                onChange={handleAddressFormChange}
                size="small"
              />
              <TextField
                label="Quận/Huyện*"
                name="district"
                value={addressFormData.district}
                onChange={handleAddressFormChange}
                size="small"
                required
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Tỉnh/Thành phố*"
                name="city"
                value={addressFormData.city}
                onChange={handleAddressFormChange}
                size="small"
                required
              />
              <TextField
                label="Mã bưu điện"
                name="postal_code"
                value={addressFormData.postal_code}
                onChange={handleAddressFormChange}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                name="is_default"
                checked={addressFormData.is_default}
                onChange={handleAddressFormChange}
                id="is_default_checkbox"
              />
              <label htmlFor="is_default_checkbox" style={{ cursor: 'pointer', fontSize: '14px', color: '#40493D' }}>
                Đặt làm địa chỉ mặc định
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={resetAddressForm}
            sx={{ color: '#707A6C', textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddressSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#0D631B',
              '&:hover': { backgroundColor: '#0a4d15' },
              textTransform: 'none'
            }}
          >
            {editingAddress ? 'Cập Nhật' : 'Thêm Địa Chỉ'}
          </Button>
        </DialogActions>
      </Dialog>

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
        <DialogTitle sx={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, color: '#181D17' }}>
          📍 Chọn vị trí trên bản đồ
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
                userType === 'supplier'
                  ? supplierLocation?.latitude && supplierLocation?.longitude 
                    ? { lat: supplierLocation.latitude, lng: supplierLocation.longitude, address: supplierLocation.supplier_address } 
                    : null
                  : userLocation?.latitude && userLocation?.longitude 
                    ? { lat: userLocation.latitude, lng: userLocation.longitude, address: userLocation.address } 
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
    </Box>
  );
}
