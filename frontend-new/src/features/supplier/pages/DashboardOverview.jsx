import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../../services/api';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState({
    highRisk: [],
    expiring: [],
    lowStock: [],
  });
  const [pricingSettings, setPricingSettings] = useState({
    floorPrice: 40,
    maxDiscount: 75,
    autoPricingEnabled: true,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products with risk scores
      const productsRes = await api.get('/products/supplier/list?limit=5');
      setProducts(productsRes.data.products || []);

      // Fetch alerts - handle if endpoint doesn't exist
      try {
        const alertsRes = await api.get('/products/supplier/alerts/high-risk');
        setAlerts({
          highRisk: alertsRes.data.products || [],
          expiring: [],
          lowStock: [],
        });
      } catch (alertErr) {
        console.warn('High-risk alerts endpoint not available:', alertErr);
        setAlerts({
          highRisk: [],
          expiring: [],
          lowStock: [],
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setMessage({ type: 'error', text: 'Lỗi khi tải dữ liệu dashboard' });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPricingToggle = () => {
    setPricingSettings({
      ...pricingSettings,
      autoPricingEnabled: !pricingSettings.autoPricingEnabled,
    });
  };

  const handlePricingSettingsChange = (e) => {
    const { name, value } = e.target;
    setPricingSettings({
      ...pricingSettings,
      [name]: parseInt(value),
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px' }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#964900', fontSize: '12px', lineHeight: '16px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        QUẢN LÝ KHO HÀNG
      </Typography>

      {/* Main Section Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#181D17', mb: 1, fontSize: '36px', lineHeight: '40px', letterSpacing: '-0.9px' }}>
          Quản lý sản phẩm
        </Typography>
        <Typography variant="body2" sx={{ color: '#40493D', fontSize: '16px', lineHeight: '24px' }}>
          Theo dõi tài sản dư thừa và tối ưu hóa thanh lý thông qua công cụ định giá tự động.
        </Typography>
      </Box>

      {/* Alert Section */}
      {alerts.highRisk.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon sx={{ fontSize: 24 }} />}
          sx={{
            mb: 3,
            backgroundColor: '#FFDCC6',
            borderLeft: '4px solid #964900',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#311300' }}>
                {alerts.highRisk.length} Sản phẩm cần chú ý
              </Typography>
              <Typography variant="body2" sx={{ color: '#311300', mt: 0.5, opacity: 0.8 }}>
                {`Sản phẩm có Điểm Rủi Ro > 70 cần giảm giá ngay lập tức hoặc đẩy mạnh quảng cáo.`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#964900',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { backgroundColor: '#7a3900' },
              }}
            >
              Tối ưu tất cả
            </Button>
          </Box>
        </Alert>
      )}

      {/* Pricing Settings Card */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 3 }}>
        <Box>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E7E5E4', backgroundColor: '#fff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#181D17', fontSize: '20px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#181D17', fontSize: '16px', lineHeight: '24px' }}>
                    Auto-Pricing Engine
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pricingSettings.autoPricingEnabled}
                      onChange={handleAutoPricingToggle}
                      color="primary"
                    />
                  }
                  label=""
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    GIÁ SÀN (₫)
                  </Typography>
                  <TextField
                    fullWidth
                    value={pricingSettings.floorPrice}
                    onChange={handlePricingSettingsChange}
                    name="floorPrice"
                    size="small"
                    type="number"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    GIẢM GIÁ TỐI ĐA
                  </Typography>
                  <TextField
                    fullWidth
                    value={pricingSettings.maxDiscount}
                    onChange={handlePricingSettingsChange}
                    name="maxDiscount"
                    size="small"
                    type="number"
                    variant="outlined"
                    slotProps={{
                      input: {
                        endAdornment: '%',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Analytics Card */}
        <Box>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E7E5E4', backgroundColor: '#EBEFE5' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#40493D', mb: 2, fontWeight: 700 }}>
                Tối ưu hóa thông minh
              </Typography>
              <Typography variant="body2" sx={{ color: '#40493D', lineHeight: 1.6 }}>
                AI liên tục kiểm tra hàng 
              </Typography>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px' }}>
                      Phục hồi doanh thu
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d5016' }}>
                      +12.4%
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  so với tháng trước
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Products Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E7E5E4' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#181D17', mb: 2, fontSize: '16px', lineHeight: '24px' }}>
            Chi tiết sản phẩm
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#F1F5EB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', lineHeight: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Sản phẩm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', lineHeight: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Hạn sử dụng
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', lineHeight: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Tồn kho
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', lineHeight: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Cấu trúc giá
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', lineHeight: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Điểm Rủi Ro
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#78716C', fontSize: '10px', lineHeight: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.slice(0, 3).map((product) => (
                  <TableRow key={product.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#181D17' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#78716C' }}>
                          {product.category || 'Chưa phân loại'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" sx={{ color: '#78716C' }}>
                        {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${product.quantity || 0} đơn vị`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="caption" sx={{ color: '#78716C', textDecoration: 'line-through' }}>
                          ${Math.round(Number(product.original_price)).toLocaleString('en-US') || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#181D17' }}>
                          ${Math.round(Number(product.current_price)).toLocaleString('en-US') || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.risk_score || 'N/A'}
                        color={product.risk_score > 70 ? 'error' : 'default'}
                        size="small"
                        sx={{
                          backgroundColor: product.risk_score > 70 ? '#BA1A1A' : '#E7E5E4',
                          color: product.risk_score > 70 ? '#fff' : '#78716C',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <EditIcon sx={{ fontSize: 18, color: '#999', cursor: 'pointer' }} />
                        <DeleteIcon sx={{ fontSize: 18, color: '#999', cursor: 'pointer' }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, textAlign: 'center', color: '#999' }}>
            <Typography variant="caption">
              Hiển thị 3 trong {products.length} sản phẩm trong kho hàng
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Card */}
      <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0', mt: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#2d5016',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              mr: 2,
            }}
          >
            Xem tất cả sản phẩm
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#2d5016',
              color: '#2d5016',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Xem phân tích
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
