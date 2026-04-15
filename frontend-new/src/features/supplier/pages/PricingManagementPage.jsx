import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PricingPackageList from '../components/PricingPackageList';

export default function PricingManagementPage() {
  const navigate = useNavigate();
  const supplierId = localStorage.getItem('userId');

  useEffect(() => {
    // Check if user is supplier
    const userType = localStorage.getItem('userType');
    if (userType !== 'supplier') {
      navigate('/');
    }
  }, [navigate]);

  if (!supplierId) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Vui lòng đăng nhập</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          Quản lý gói giá
        </Typography>
        <Typography color="textSecondary">
          Tạo gói giá cho sản phẩm của bạn
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <PricingPackageList supplierId={parseInt(supplierId)} />
      </Paper>
    </Container>
  );
}
