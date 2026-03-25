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
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const userType = localStorage.getItem('userType');

  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });

  const [supplierData, setSupplierData] = useState({
    company_name: '',
    tax_id: '',
    warehouse_address: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    banner_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const user = response.data.user;

      setPersonalData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });

      // Nếu là Supplier, lấy thêm supplier info
      if (userType === 'supplier' && response.data.supplier_details) {
        const supplier = response.data.supplier_details;
        setSupplierData({
          company_name: supplier.company_name || '',
          tax_id: supplier.tax_id || '',
          warehouse_address: supplier.warehouse_address || '',
          contact_phone: supplier.contact_phone || '',
          contact_email: supplier.contact_email || '',
          description: supplier.description || '',
          banner_url: supplier.banner_url || ''
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi tải thông tin'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
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
        text: err.response?.data?.error || 'Lỗi khi cập nhật'
      });
    } finally {
      setSaving(false);
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
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Tài Khoản Của Tôi
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Card>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Thông tin cá nhân" />
          {userType === 'supplier' && <Tab label="Thông tin cửa hàng" />}
        </Tabs>

        <CardContent>
          {/* Tab: Thông Tin Cá Nhân */}
          <TabPanel value={tabValue} index={0}>
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email*"
                  type="email"
                  value={personalData.email}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
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
                    src={personalData.avatar_url}
                    alt="Avatar preview"
                    sx={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  onClick={handleSavePersonal}
                  fullWidth
                >
                  {saving ? <CircularProgress size={24} /> : 'Lưu thông tin cá nhân'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab: Thông Tin Cửa Hàng (Supplier) */}
          {userType === 'supplier' && (
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên cửa hàng*"
                    name="company_name"
                    value={supplierData.company_name}
                    onChange={handleSupplierChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số giấy phép kinh doanh / Mã số thuế"
                    name="tax_id"
                    value={supplierData.tax_id}
                    onChange={handleSupplierChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ kho hàng"
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả về cửa hàng"
                    name="description"
                    value={supplierData.description}
                    onChange={handleSupplierChange}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL hình ảnh đại diện cửa hàng"
                    name="banner_url"
                    value={supplierData.banner_url}
                    onChange={handleSupplierChange}
                    helperText="Nhập đường link ảnh từ Internet"
                  />
                </Grid>

                {supplierData.banner_url && (
                  <Grid item xs={12}>
                    <Box
                      component="img"
                      src={supplierData.banner_url}
                      alt="Banner preview"
                      sx={{ maxWidth: '300px', borderRadius: '8px', height: 'auto' }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    onClick={handleSaveSupplier}
                    fullWidth
                  >
                    {saving ? <CircularProgress size={24} /> : 'Lưu thông tin cửa hàng'}
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
