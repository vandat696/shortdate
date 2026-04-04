import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Modal,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../../services/api';
import { getImageUrl } from '../../../services/api';

export default function SupplierInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock_quantity: '',
    current_price: '',
    original_price: '',
    expiry_date: '',
    description: '',
    image_url: '',
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceChartLoading, setPriceChartLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/supplier/list');
      const products = response.data.products || response.data || [];
      setProducts(Array.isArray(products) ? products : []);
      if (Array.isArray(products) && products.length > 0) {
        setMessage('');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setMessage({ 
        type: 'warning', 
        text: 'Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!' 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      stock_quantity: '',
      current_price: '',
      original_price: '',
      expiry_date: '',
      description: '',
      image_url: '',
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setOpenProductDialog(true);
  };

  const handleOpenEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      stock_quantity: product.stock_quantity || '',
      current_price: product.current_price || '',
      original_price: product.original_price || '',
      expiry_date: product.expiry_date ? product.expiry_date.split('T')[0] : '',
      description: product.description || '',
      image_url: product.image_url || '',
    });
    setSelectedImages([]);
    setImagePreviews(product.image_url ? [product.image_url] : []);
    setOpenProductDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      const maxFiles = 4;
      const newFiles = Array.from(files).slice(0, maxFiles - selectedImages.length);
      
      if (newFiles.length + selectedImages.length > maxFiles) {
        setMessage({ type: 'warning', text: `Tối đa ${maxFiles} ảnh cho mỗi sản phẩm` });
        return;
      }

      setSelectedImages([...selectedImages, ...newFiles]);

      // Create previews
      const newPreviews = newFiles.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newPreviews).then(previews => {
        setImagePreviews(prev => [...prev, ...previews]);
      });
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const fetchProductImages = async (productId, product) => {
    try {
      const response = await api.get(`/images/${productId}`);
      let images = response.data.images || [];
      
      // Nếu không có ảnh từ product_images table, dùng image_url từ products table
      if (images.length === 0 && product?.image_url) {
        images = [{ id: 'main', image_url: product.image_url }];
      }
      
      setProductImages(images);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error('Error fetching product images:', err);
      // Fallback: dùng image_url từ product
      if (product?.image_url) {
        setProductImages([{ id: 'main', image_url: product.image_url }]);
      } else {
        setProductImages([]);
      }
    }
  };

  const fetchPriceHistory = async (productId) => {
    try {
      setPriceChartLoading(true);
      const response = await api.get(`/pricing/${productId}/with-history`);
      const historyData = response.data.history || [];
      
      // Sắp xếp theo thời gian tăng dần
      const sortedHistory = historyData.sort((a, b) => 
        new Date(a.changed_at) - new Date(b.changed_at)
      );
      
      // Chuyển đổi dữ liệu cho biểu đồ
      const chartData = sortedHistory.map(item => ({
        date: new Date(item.changed_at).toLocaleDateString('vi-VN'),
        timestamp: new Date(item.changed_at).getTime(),
        oldPrice: Number(item.old_price),
        newPrice: Number(item.new_price),
        reason: item.reason,
      }));
      
      setPriceHistory(chartData);
    } catch (error) {
      console.error('Error fetching price history:', error);
      setPriceHistory([]);
    } finally {
      setPriceChartLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    fetchProductImages(product.id, product);
    fetchPriceHistory(product.id);
    setSelectedImageIndex(0);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
    setProductImages([]);
    setPriceHistory([]);
    setSelectedImageIndex(0);
  };

  const handleSaveProduct = async () => {
    try {
      if (!formData.name || !formData.category || !formData.stock_quantity || !formData.current_price) {
        setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
        return;
      }

      const data = {
        name: formData.name,
        category: formData.category,
        product_type: 'dry_product', // Mặc định cho sản phẩm khô
        stock_quantity: parseInt(formData.stock_quantity),
        current_price: parseFloat(formData.current_price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : parseFloat(formData.current_price),
        expiry_date: formData.expiry_date,
        description: formData.description,
      };

      let productId;
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        productId = editingProduct.id;
        setMessage({ type: 'success', text: 'Cập nhật sản phẩm thành công' });
      } else {
        const response = await api.post('/products', data);
        productId = response.data.product?.id;
        setMessage({ type: 'success', text: 'Thêm sản phẩm thành công' });
      }

      // Upload images if selected
      if (selectedImages.length > 0 && productId) {
        try {
          const formDataImg = new FormData();
          selectedImages.forEach(file => {
            formDataImg.append('images', file);
          });
          await api.post(`/images/${productId}/upload`, formDataImg, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setMessage({ type: 'success', text: `Thêm sản phẩm và ${selectedImages.length} ảnh thành công` });
        } catch (imgErr) {
          console.error('Error uploading images:', imgErr);
          setMessage({ type: 'warning', text: 'Sản phẩm đã thêm nhưng ảnh chưa upload. Hãy thử lại.' });
        }
      }

      setOpenProductDialog(false);
      fetchProducts();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Lỗi khi lưu sản phẩm',
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${productId}`);
        setMessage({ type: 'success', text: 'Xóa sản phẩm thành công' });
        fetchProducts();
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.response?.data?.error || 'Lỗi khi xóa sản phẩm',
        });
      }
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
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '12px', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#964900', mb: 1 }}>
          KHO HÀNG
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '36px', letterSpacing: '-0.9px', color: '#181D17', mb: 1 }}>
          Quản lý kho hàng
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '16px', lineHeight: '24px', color: '#40493D' }}>
          Theo dõi và quản lý mức tồn kho của các sản phẩm
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ 
          mb: 3, 
          backgroundColor: message.type === 'error' ? '#FFE8E8' : message.type === 'warning' ? '#FFF8E1' : '#E8F5E9',
          borderLeft: `4px solid ${message.type === 'error' ? '#D32F2F' : message.type === 'warning' ? '#F57C00' : '#4CAF50'}`,
          color: message.type === 'error' ? '#C62828' : message.type === 'warning' ? '#E65100' : '#2E7D32',
        }}>
          {message.text}
        </Alert>
      )}

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <TextField
          placeholder="Tìm kiếm kho hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1.5, color: '#A8A29E' }} />,
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#F1F5EB',
              borderRadius: '9999px',
              border: 'none',
              '& fieldset': { border: 'none' },
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '14px',
              color: '#40493D',
          '&::placeholder': {
                color: '#6B7280',
              },
            },
          }}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            backgroundColor: '#964900',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '14px',
            px: 3,
            py: 1.2,
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#7A3A00' },
            whiteSpace: 'nowrap',
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      {/* Product List View */}
      {filteredProducts.length === 0 ? (
        <Paper sx={{ borderRadius: '12px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff', p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#78716C', mb: 2, fontSize: '18px', fontWeight: 600 }}>
            📦 Chưa có sản phẩm nào
          </Typography>
          <Typography variant="body2" sx={{ color: '#A8A29E', mb: 4 }}>
            Hãy thêm sản phẩm đầu tiên để bắt đầu quản lý kho hàng
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              backgroundColor: '#964900',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '14px',
              px: 3,
              py: 1.2,
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#7A3A00' },
            }}
          >
            Thêm sản phẩm đầu tiên
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2 }}>
          {filteredProducts.map((product) => (
            <Paper
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '100px 1fr 60px', md: '150px 1fr 100px' },
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: '12px',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #EBEFE5',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  borderColor: '#964900',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {/* Ảnh sản phẩm */}
              <Box
                sx={{
                  width: { xs: '100px', md: '150px' },
                  height: { xs: '100px', md: '150px' },
                  flexShrink: 0,
                }}
              >
                {product.image_url ? (
                  <Box
                    component="img"
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#F1F5EB',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#A8A29E',
                      fontSize: '32px',
                    }}
                  >
                    📦
                  </Box>
                )}
              </Box>

              {/* Thông tin sản phẩm */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#181D17', mb: 0.5 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#78716C', display: 'block', mb: 1 }}>
                    {product.category || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Tồn kho</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#181D17' }}>  
                        {product.stock_quantity || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Hạn SD</Typography>
                      <Typography sx={{ fontWeight: 700, color: product.stock_quantity < 10 ? '#BA1A1A' : '#181D17' }}>
                        {product.expiry_date
                          ? new Date(product.expiry_date).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Giá</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#2d5016' }}>
                        ₫{Number(product.current_price).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Nút hành động */}
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditDialog(product);
                  }}
                  sx={{
                    backgroundColor: 'rgba(150, 73, 0, 0.08)',
                    color: '#964900',
                    '&:hover': { backgroundColor: 'rgba(150, 73, 0, 0.16)' },
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(product.id);
                  }}
                  sx={{
                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                    color: '#D32F2F',
                    '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.16)' },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '18px', color: '#181D17' }}>
          {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Image Previews Grid */}
          {imagePreviews.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#181D17' }}>
                Bản xem trước ({imagePreviews.length}/4 ảnh)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {imagePreviews.map((preview, idx) => (
                  <Box key={idx} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      sx={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #EBEFE5',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(idx)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(211, 47, 47, 0.9)',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#BA1A1A' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Image Upload */}
          {imagePreviews.length < 4 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#181D17' }}>
                Tải lên ảnh sản phẩm
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderColor: '#964900',
                  color: '#964900',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': { backgroundColor: 'rgba(150, 73, 0, 0.08)' },
                }}
              >
                Chọn ảnh từ máy ({imagePreviews.length}/4)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </Button>
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                JPG, PNG hoặc WebP • Tối đa 5MB/ảnh • Tối đa 4 ảnh
              </Typography>
            </Box>
          )}

          <TextField
            label="Tên sản phẩm"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Danh mục"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Tồn kho (đơn vị)"
            name="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={handleFormChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Giá hiện tại"
            name="current_price"
            type="number"
            value={formData.current_price}
            onChange={handleFormChange}
            fullWidth
            size="small"
            inputProps={{ step: '0.01' }}
          />
          <TextField
            label="Giá gốc"
            name="original_price"
            type="number"
            value={formData.original_price}
            onChange={handleFormChange}
            fullWidth
            size="small"
            inputProps={{ step: '0.01' }}
          />
          <TextField
            label="Hạn sử dụng"
            name="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={handleFormChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenProductDialog(false)} sx={{ color: '#666' }}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            sx={{ backgroundColor: '#964900', '&:hover': { backgroundColor: '#7A3A00' } }}
          >
            {editingProduct ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Detail Modal */}
      <Modal
        open={!!selectedProduct}
        onClose={handleCloseProductDetail}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <Paper sx={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #EBEFE5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#181D17' }}>
                Chi tiết sản phẩm
              </Typography>
              <IconButton onClick={handleCloseProductDetail}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Content */}
            {selectedProduct && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, p: 3, overflow: 'auto', flex: 1 }}>
                {/* Image Gallery */}
                <Box>
                  {productImages.length > 0 ? (
                    <>
                      <Box
                        component="img"
                        src={getImageUrl(productImages[selectedImageIndex].image_url)}
                        alt="Product"
                        sx={{ 
                          width: { xs: '100%', md: '400px' }, 
                          height: { xs: '300px', md: '400px' }, 
                          objectFit: 'cover', 
                          borderRadius: '8px', 
                          mb: 2 
                        }}
                      />
                      {productImages.length > 1 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                          {productImages.map((img, idx) => (
                            <Box
                              key={idx}
                              component="img"
                              src={getImageUrl(img.image_url)}
                              alt={`Ảnh ${idx + 1}`}
                              onClick={() => setSelectedImageIndex(idx)}
                              sx={{
                                width: '100%',
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: selectedImageIndex === idx ? '2px solid #964900' : '1px solid #EBEFE5',
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: { xs: '100%', md: '400px' },
                        height: { xs: '300px', md: '400px' },
                        backgroundColor: '#F1F5EB',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '60px',
                      }}
                    >
                      📦
                    </Box>
                  )}
                </Box>

                {/* Product Info */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>
                      {selectedProduct.category}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#181D17', mt: 0.5 }}>
                      {selectedProduct.name}
                    </Typography>
                  </Box>

                  {/* Price Info */}
                  <Box sx={{ p: 2, backgroundColor: '#EBEFE5', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#78716C' }}>Giá gốc</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#78716C', textDecoration: 'line-through' }}>
                          ₫{Number(selectedProduct.original_price).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#2d5016' }}>Giá hiện tại</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#2d5016' }}>
                          ₫{Number(selectedProduct.current_price).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Giảm giá {Math.round(((selectedProduct.original_price - selectedProduct.current_price) / selectedProduct.original_price) * 100)}%
                    </Typography>
                  </Box>

                  {/* Stock & Expiry */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#78716C', fontWeight: 700 }}>Tồn kho</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#181D17' }}>
                        {selectedProduct.stock_quantity} đơn vị
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#78716C', fontWeight: 700 }}>Hạn sử dụng</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#181D17' }}>
                        {new Date(selectedProduct.expiry_date).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Typography variant="caption" sx={{ color: '#78716C', fontWeight: 700 }}>Mô tả</Typography>
                    <Typography variant="body2" sx={{ color: '#40493D', mt: 0.5 }}>
                      {selectedProduct.description || 'Không có mô tả'}
                    </Typography>
                  </Box>

                  {/* Price History Chart */}
                  {priceHistory.length > 0 && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #EBEFE5' }}>
                      <Typography variant="caption" sx={{ color: '#78716C', fontWeight: 700, display: 'block', mb: 2 }}>
                        Biểu đồ biến động giá
                      </Typography>
                      {priceChartLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : (
                        <Box sx={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#EBEFE5" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                stroke="#78716C"
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                stroke="#78716C"
                                label={{ value: 'Giá (₫)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip 
                                formatter={(value) => `₫${Number(value).toLocaleString('vi-VN')}`}
                                contentStyle={{ 
                                  backgroundColor: '#fff', 
                                  border: '1px solid #EBEFE5',
                                  borderRadius: '8px'
                                }}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="newPrice" 
                                stroke="#2d5016" 
                                strokeWidth={2}
                                name="Giá mới"
                                dot={{ fill: '#2d5016', r: 4 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="oldPrice" 
                                stroke="#999" 
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                name="Giá cũ"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        handleOpenEditDialog(selectedProduct);
                        handleCloseProductDetail();
                      }}
                      sx={{ borderColor: '#964900', color: '#964900', fontWeight: 700 }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        handleCloseProductDetail();
                      }}
                      sx={{ backgroundColor: '#964900' }}
                    >
                      Đóng
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
}
