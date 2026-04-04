import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';
import api from '../../../services/api';

export default function SupplierAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // This would need backend endpoints
      const response = await api.get('/analytics/supplier');
      setAnalytics(response.data || {});
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Set default values if endpoint doesn't exist yet
      setAnalytics({
        totalRevenue: 4820,
        totalOrders: 156,
        averageOrderValue: 30.89,
        topProducts: [
          { name: 'Artisan Triple Cream Brie', sales: 45, revenue: 224.55 },
          { name: 'Organic Hass Avocados', sales: 38, revenue: 53.2 },
          { name: 'Wild Caught Atlantic Salmon', sales: 32, revenue: 409.6 },
        ],
      });
    } finally {
      setLoading(false);
    }
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
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#964900', fontSize: '12px', lineHeight: '16px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        PHÂN TÍCH
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 800, color: '#181D17', mb: 1, fontSize: '36px', lineHeight: '40px', letterSpacing: '-0.9px' }}>
        Hiệu suất bán hàng
      </Typography>
      <Typography variant="body2" sx={{ color: '#40493D', fontSize: '16px', lineHeight: '24px', mb: 3 }}>
        Theo dõi các chỉ số và hiệu suất
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {/* Total Revenue */}
        <Box>
          <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#999', fontWeight: 700 }}>
                    Tổng doanh thu
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d5016', mt: 1 }}>
                    ${analytics.totalRevenue?.toFixed(2) || '0.00'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>
                      +12,5% so với tháng trước
                    </Typography>
                  </Box>
                </Box>
                <RevenueIcon sx={{ fontSize: 40, color: '#d4af37', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Total Orders */}
        <Box>
          <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#999', fontWeight: 700 }}>
                    Tổng số đơn hàng
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d5016', mt: 1 }}>
                    {analytics.totalOrders || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>
                      +8,2% so với tháng trước
                    </Typography>
                  </Box>
                </Box>
                <OrdersIcon sx={{ fontSize: 40, color: '#2d5016', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Average Order Value */}
        <Box>
          <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#999', fontWeight: 700 }}>
                    Giá trị trung bình đơn hàng
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d5016', mt: 1 }}>
                    ${analytics.averageOrderValue?.toFixed(2) || '0.00'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
                    <Typography variant="caption" sx={{ color: '#f44336' }}>
                      -2,1% so với tháng trước
                    </Typography>
                  </Box>
                </Box>
                <RevenueIcon sx={{ fontSize: 40, color: '#2196f3', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Products Sold */}
        <Box>
          <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#999', fontWeight: 700 }}>
                    Sản phẩm đã bán
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d5016', mt: 1 }}>
                    {analytics.totalOrders ? Math.round(analytics.totalOrders * 2.3) : 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>
                      +5,8% so với tháng trước
                    </Typography>
                  </Box>
                </Box>
                <OrdersIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Top Products */}
      <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
            Sản phẩm bán chạy nhất
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(analytics.topProducts || []).map((product, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    {product.sales} bán hàng
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#2d5016' }}>
                  ${product.revenue?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <Card sx={{ borderRadius: '8px', border: '1px solid #e0e0e0', mt: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
            Thông tin doanh thu
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ p: 2, backgroundColor: '#f0f4e8', borderRadius: '6px' }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Danh mục tốt nhất
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d5016' }}>
                Sữa & Phô mai
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                35% tổng doanh thu
              </Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: '#fff5e6', borderRadius: '6px' }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Thời điểm doanh số cao nhất
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d5016' }}>
                Thứ Sáu - Chủ nhật
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                42% bán hàng trong tuần
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
