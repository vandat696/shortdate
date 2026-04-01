import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const steps = ['Đã đặt hàng', 'Chuẩn Bị Hàng', 'Đang Giao Hàng', 'Đã Giao'];

function stepIndex(status) {
  if (!status) return 0;
  if (status === 'pending') return 0;
  if (status === 'confirmed') return 1;
  if (status === 'shipped') return 2;
  if (status === 'delivered') return 3;
  return 0;
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error('Vui lòng đăng nhập để xem đơn hàng');
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Không thể lấy đơn hàng');
        setOrder(data.order);
        setItems(data.items || []);
      } catch (e) {
        setError(e?.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [orderId, token]);

  const activeStep = useMemo(() => stepIndex(order?.status), [order?.status]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Theo Dõi Đơn Hàng</Typography>
          <Typography color="error">{error || 'Không tìm thấy đơn hàng'}</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>
            Quay Lại Trang Chủ
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Đơn Hàng • #{orderId}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Theo dõi đơn hàng
              </Typography>

              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                {items.map((it) => (
                  <Box key={it.productId} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{it.productName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {it.quantity}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900 }}>
                      {(it.totalPrice || 0).toLocaleString('vi-VN')}đ
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Subtotal: ${(order.subtotal || 0).toLocaleString('vi-VN')}đ`} />
                <Chip label={`Delivery: ${(order.shippingFee || 0).toLocaleString('vi-VN')}đ`} />
                <Chip color="primary" label={`Total: ${(order.totalAmount || 0).toLocaleString('vi-VN')}đ`} />
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Delivery Address</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }} color="text.secondary">
                {order.deliveryAddress || '—'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Button fullWidth variant="contained" onClick={() => navigate(`/orders/${orderId}`)}>
                View Details
              </Button>
              <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/')}>
                Continue shopping
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

