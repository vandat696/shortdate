import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';

export default function OrderReceipt({ open, onClose, order }) {
  if (!order) return null;

  // Debug items
  console.log('🎯 OrderReceipt items:');
  if (order.items) {
    order.items.forEach((item, idx) => {
      console.log(`  Item ${idx}:`, {
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      });
    });
  } else {
    console.log('  ❌ No items!');
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontFamily: 'Montserrat',
        fontWeight: 700,
        fontSize: 20,
        backgroundColor: '#E8F5E9',
        borderBottom: '2px solid #0D631B'
      }}>
        <Box>
          ✓ Đơn hàng đã được tạo thành công
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        py: 3,
        backgroundColor: '#fafafa'
      }}>
        {/* Receipt Container */}
        <Paper
          sx={{
            p: 4,
            backgroundColor: '#fff',
            fontFamily: 'Montserrat'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography sx={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: '#0D631B',
              mb: 1
            }}>
              PHIẾU THANH TOÁN
            </Typography>
            <Typography sx={{ 
              fontSize: 14, 
              color: '#707A6C',
              mb: 2
            }}>
              ShortDate - Nền tảng bán hàng tươi sống
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          {/* Order Info */}
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#999', mb: 0.5 }}>MÃ ĐƠN HÀNG</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#0D631B' }}>
                {order.orderCode}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#999', mb: 0.5 }}>NGÀY TẠO</Typography>
              <Typography sx={{ fontSize: 14, color: '#333' }}>
                {formatDate(order.createdAt)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#999', mb: 0.5 }}>TRẠNG THÁI</Typography>
              <Typography sx={{ 
                fontSize: 14, 
                fontWeight: 600,
                color: '#fff',
                backgroundColor: '#0D631B',
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: 1
              }}>
                {order.status || 'confirmed'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#999', mb: 0.5 }}>PHƯƠNG THỨC THANH TOÁN</Typography>
              <Typography sx={{ fontSize: 13, color: '#333' }}>
                {order.paymentMethod?.toUpperCase() || 'COD'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Delivery Info */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ 
              fontSize: 12, 
              color: '#999', 
              mb: 1,
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              THÔNG TIN GIAO HÀNG
            </Typography>
            <Box sx={{
              backgroundColor: '#F7FBF0',
              p: 1.5,
              borderRadius: 1,
              borderLeft: '3px solid #0D631B'
            }}>
              <Typography sx={{ fontSize: 14, color: '#333', mb: 0.5 }}>
                📍 {order.deliveryAddress}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#707A6C' }}>
                🚚 {order.deliveryMethod || 'Giao hàng chuẩn'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Items Table */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ 
              fontSize: 12, 
              color: '#999', 
              mb: 1,
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              CHI TIẾT ĐƠN HÀNG
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F7FBF0' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0D631B', fontSize: 12, borderColor: '#ddd' }}>
                      SẢN PHẨM/GÓI
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#0D631B', fontSize: 12, borderColor: '#ddd' }}>
                      SL
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#0D631B', fontSize: 12, borderColor: '#ddd' }}>
                      ĐƠN GIÁ
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#0D631B', fontSize: 12, borderColor: '#ddd' }}>
                      THÀNH TIỀN
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                        <TableCell sx={{ fontSize: 13, color: '#333', borderColor: '#eee' }}>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#0D631B' }}>
                              {item.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#999' }}>
                              {item.type === 'package' ? '[GÓI GIÁ]' : '[SẢN PHẨM]'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: 13, color: '#333', borderColor: '#eee' }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 13, color: '#333', borderColor: '#eee' }}>
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: '#0D631B', borderColor: '#eee' }}>
                          {formatCurrency(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#999', py: 2 }}>
                        Không có sản phẩm
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Cost Summary */}
          <Box sx={{ mb: 3, textAlign: 'right' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 2, mb: 1, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#707A6C' }}>Cộng tiền hàng:</Typography>
              <Box />
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#333', minWidth: 120 }}>
                {formatCurrency(order.subtotal)}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 2, mb: 2, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#707A6C' }}>Phí giao hàng:</Typography>
              <Box />
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#333', minWidth: 120 }}>
                {formatCurrency(order.shippingFee)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 2, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0D631B' }}>TỔNG CỘNG:</Typography>
              <Box />
              <Box sx={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                backgroundColor: '#0D631B',
                p: 1.5,
                borderRadius: 1,
                textAlign: 'right',
                minWidth: 120
              }}>
                {formatCurrency(order.totalAmount)}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: '#999', mb: 2 }}>
              Cảm ơn bạn đã tin tưởng ShortDate!<br />
              Đơn hàng của bạn đang được chuẩn bị gửi đi.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  borderColor: '#0D631B',
                  color: '#0D631B',
                  '&:hover': {
                    borderColor: '#0D631B',
                    backgroundColor: '#F7FBF0'
                  }
                }}
              >
                In Phiếu
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={onClose}
                sx={{
                  backgroundColor: '#0D631B',
                  '&:hover': {
                    backgroundColor: '#0B4E14'
                  }
                }}
              >
                Đóng
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
