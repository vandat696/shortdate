import { Box, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { productService, imageService } from '../../../services/api';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductControls from '../components/ProductControls';
import SupplierInfoCard from '../components/SupplierInfoCard';
import axios from 'axios';

// Helper: Calculate days remaining
function daysLeft(expiryDate) {
  if (!expiryDate) return null;
  const d = new Date(expiryDate);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.ceil((d - t) / (1000 * 60 * 60 * 24));
}

// Helper: Calculate freshness percentage (100% = new, 0% = expired today)
function calculateFreshness(expiryDate) {
  const days = daysLeft(expiryDate);
  if (!days || days < 0) return 0;
  if (days > 30) return 100;
  return Math.max(0, Math.round((days / 30) * 100));
}

// Format date to "MMM DD, YYYY"
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [userZip, setUserZip] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceChartLoading, setPriceChartLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productService.getById(productId);
        const data = response.data?.product || response.data;
        
        console.log('📦 Product data received:', data);
        
        // Fetch all product images
        let allImages = [];
        try {
          const imagesResponse = await imageService.getProductImages(productId);
          allImages = imagesResponse.data?.images || [];
          console.log('🖼️ Product images received:', allImages);
        } catch (err) {
          console.warn('No images found for this product:', err);
        }
        
        // Get user zip code from localStorage
        const storedZip = localStorage.getItem('userZip');
        if (storedZip) {
          setUserZip(storedZip);
        }
        
        // Fetch related products (same category)
        try {
          const relatedResponse = await axios.get(
            `http://localhost:5000/api/products/all?category=${data.category}&limit=8`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          const products = (relatedResponse.data?.products || [])
            .filter(p => p.id !== productId)
            .slice(0, 4);
          setRelatedProducts(products);
          console.log('🔗 Related products:', products);
        } catch (err) {
          console.warn('No related products found:', err);
        }
        
        // Use first image as main image, or fallback to image_url
        const mainImage = allImages.length > 0 ? allImages[0].image_url : data.image_url;
        
        setProduct({
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description,
          current_price: data.current_price,
          original_price: data.original_price,
          image_url: mainImage,
          expiry_date: data.expiry_date,
          stock_quantity: data.stock_quantity,
          supplier_id: data.supplier_id,
          supplier_name: data.supplier_name,
          supplier_latitude: data.supplier_latitude,
          supplier_longitude: data.supplier_longitude,
          freshnessPercentage: calculateFreshness(data.expiry_date),
          allImages: allImages.length > 0 ? allImages : (mainImage ? [{ id: 1, image_url: mainImage }] : []),
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.error || 'Không thể tải sản phẩm này');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch price history
  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!productId) return;
      try {
        setPriceChartLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/pricing/${productId}/with-history`
        );
        const historyData = response.data.history || [];
        
        // Sort by time ascending
        const sortedHistory = historyData.sort((a, b) => 
          new Date(a.changed_at) - new Date(b.changed_at)
        );
        
        // Transform data for chart
        const chartData = sortedHistory.map(item => ({
          date: new Date(item.changed_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
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

    fetchPriceHistory();
  }, [productId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, backgroundColor: '#F7FBF0' }}>
        <CircularProgress sx={{ color: '#0D631B' }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ backgroundColor: '#F7FBF0', py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '24px', mb: 1, color: '#181D17' }}>
            Không tìm thấy sản phẩm
          </Typography>
          <Typography sx={{ color: '#707A6C', mb: 3 }}>
            {error || 'Vui lòng quay lại trang chủ và thử lại'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const discountPercentage = Math.round(((product.original_price - product.current_price) / product.original_price) * 100);

  return (
    <Box sx={{ backgroundColor: '#F7FBF0', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', overflow: 'hidden' }}>
      {/* Main Content Container */}
      <Box sx={{ flex: 1, px: 3, py: 4 }}>
        {/* Fixed 1280px Container */}
        <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
          {/* Breadcrumb */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: '#707A6C',
              }}
            >
              MARKETPLACE / {product.category?.toUpperCase()} / {product.name}
            </Typography>
          </Box>

          {/* Hero Section - 55/45 Split using Grid */}
          <Grid container spacing={6} sx={{ mb: 8 }}>
            {/* Left: Image Gallery (55% - md={6.6}) */}
            <Grid item xs={12} md={6.6}>
              <ProductImageGallery 
                mainImage={product.image_url} 
                allImages={product.allImages}
                discountPercentage={discountPercentage}
              />
            </Grid>

            {/* Right: Product Info (45% - md={5.4}) */}
            <Grid item xs={12} md={5.4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
                {/* Header Info Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Sustainability Badge */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      width: 'fit-content',
                      padding: '2px 8px',
                      backgroundColor: '#A3F69C',
                      borderRadius: '4px',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Inter",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: '10px',
                        lineHeight: '15px',
                        textTransform: 'uppercase',
                        color: '#005312',
                        letterSpacing: '1px',
                      }}
                    >
                      SUSTAINABILITY CHOICE
                    </Typography>
                  </Box>

                  {/* Rating Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '11.67px', height: '11.08px', backgroundColor: '#964900' }} />
                    <Typography
                      sx={{
                        fontFamily: '"Inter",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#964900',
                      }}
                    >
                      4.9 (124 reviews)
                    </Typography>
                  </Box>

                  {/* Product Name */}
                  <Typography
                    sx={{
                      fontFamily: '"Manrope",system-ui,sans-serif',
                      fontWeight: 800,
                      fontSize: '36px',
                      lineHeight: '36px',
                      letterSpacing: '-1.8px',
                      color: '#181D17',
                    }}
                  >
                    {product.name}
                  </Typography>

                  {/* Supplier Info */}
                  <Typography
                    sx={{
                      fontFamily: '"Inter",system-ui,sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#40493D',
                    }}
                  >
                    Local Supplier • {product.category || 'Products'}
                  </Typography>
                </Box>

                {/* Pricing Box */}
                <Box sx={{ p: 3, backgroundColor: '#FFFFFF', borderRadius: '24px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                    {/* Price Display */}
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: '"Inter",system-ui,sans-serif',
                          fontWeight: 700,
                          fontSize: '12px',
                          lineHeight: '16px',
                          textTransform: 'uppercase',
                          color: '#964900',
                          letterSpacing: '1.2px',
                          mb: 1,
                        }}
                      >
                        CURRENT SMART-PRICE
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <Typography
                          sx={{
                            fontFamily: '"Manrope",system-ui,sans-serif',
                            fontWeight: 800,
                            fontSize: '48px',
                            lineHeight: '48px',
                            letterSpacing: '-2.4px',
                            color: '#181D17',
                          }}
                        >
                          {product.current_price.toLocaleString('vi-VN')}₫
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"Inter",system-ui,sans-serif',
                            fontWeight: 400,
                            fontSize: '20px',
                            lineHeight: '28px',
                            textDecoration: 'line-through',
                            color: '#707A6C',
                          }}
                        >
                          {product.original_price.toLocaleString('vi-VN')}₫
                        </Typography>
                      </Box>
                    </Box>

                    {/* Discount Badge */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 12px',
                        backgroundColor: '#FFDCC6',
                        borderRadius: '9999px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Manrope",system-ui,sans-serif',
                          fontWeight: 700,
                          fontSize: '18px',
                          lineHeight: '28px',
                          color: '#311300',
                        }}
                      >
                        -{discountPercentage}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Auto-Pricing Info */}
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: 'rgba(46, 125, 50, 0.1)',
                      border: '1px solid rgba(13, 99, 27, 0.05)',
                      borderRadius: '16px',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ width: '16.67px', height: '10px', backgroundColor: '#0D631B', flexShrink: 0 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: '"Manrope",system-ui,sans-serif',
                            fontWeight: 700,
                            fontSize: '12px',
                            lineHeight: '16px',
                            color: '#0D631B',
                          }}
                        >
                          Auto-Pricing Active
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"Inter",system-ui,sans-serif',
                            fontWeight: 400,
                            fontSize: '10px',
                            lineHeight: '12px',
                            color: '#40493D',
                            mt: 0.5,
                          }}
                        >
                          Price drops every 6 hours as the HSD approaches to maximize sustainability.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Freshness Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: '"Manrope",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        lineHeight: '20px',
                        textTransform: 'uppercase',
                        color: '#181D17',
                        letterSpacing: '-0.35px',
                      }}
                    >
                      FRESHNESS INTEGRITY
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Inter",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        lineHeight: '16px',
                        textTransform: 'uppercase',
                        color: '#0D631B',
                      }}
                    >
                      HIGH CONFIDENCE
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box
                    sx={{
                      height: '12px',
                      backgroundColor: '#E0E4DA',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${product.freshnessPercentage}%`,
                        backgroundColor: '#0D631B',
                        boxShadow: '0px 0px 12px rgba(13, 99, 27, 0.3)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>

                  {/* Date Boxes */}
                  <Grid container spacing={2}>
                    {/* Use By Date */}
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#EBEFE5',
                          borderRadius: '16px',
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: '"Inter",system-ui,sans-serif',
                            fontWeight: 400,
                            fontSize: '10px',
                            lineHeight: '15px',
                            textTransform: 'uppercase',
                            color: '#707A6C',
                            letterSpacing: '1px',
                            mb: 1,
                          }}
                        >
                          USE BY DATE
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"Manrope",system-ui,sans-serif',
                            fontWeight: 700,
                            fontSize: '18px',
                            lineHeight: '28px',
                            color: '#181D17',
                          }}
                        >
                          {formatDate(product.expiry_date)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Freshness Status */}
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#EBEFE5',
                          border: '2px solid rgba(13, 99, 27, 0.2)',
                          borderRadius: '16px',
                          textAlign: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                          <Box sx={{ width: '11px', height: '10.5px', backgroundColor: '#0D631B' }} />
                          <Typography
                            sx={{
                              fontFamily: '"Inter",system-ui,sans-serif',
                              fontWeight: 400,
                              fontSize: '10px',
                              lineHeight: '15px',
                              textTransform: 'uppercase',
                              color: '#0D631B',
                              letterSpacing: '1px',
                            }}
                          >
                            GUARANTEED FRESH
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: '"Manrope",system-ui,sans-serif',
                            fontWeight: 700,
                            fontSize: '18px',
                            lineHeight: '22px',
                            color: '#181D17',
                          }}
                        >
                          {daysLeft(product.expiry_date) || 0} Days
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Delivery Info */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: '#F1F5EB',
                    borderRadius: '16px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ width: '22px', height: '16px', backgroundColor: '#0D631B' }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Manrope",system-ui,sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#181D17',
                      }}
                    >
                      🚚 Hyper-Local Delivery
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Inter",system-ui,sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#707A6C',
                      }}
                    >
                      Available for your current zip code: {userZip || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Purchase Controls */}
                <ProductControls 
                  productId={product.id}
                  stock_quantity={product.stock_quantity}
                  onAddToCart={() => {
                    // Optional: Show success message or navigate
                    console.log('Product added to cart from detail page');
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Price History Chart Section */}
          {priceHistory.length > 0 && (
            <Box sx={{ mb: 8 }}>
              <Typography
                sx={{
                  fontFamily: '"Manrope",system-ui,sans-serif',
                  fontWeight: 900,
                  fontSize: '24px',
                  lineHeight: '32px',
                  letterSpacing: '-1.2px',
                  color: '#181D17',
                  mb: 4,
                }}
              >
                Biến động giá theo thời gian
              </Typography>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                {priceChartLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: '#0D631B' }} />
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EBEFE5" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#707A6C' }}
                          stroke="#EBEFE5"
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#707A6C' }}
                          stroke="#EBEFE5"
                          label={{ value: 'Giá (₫)', angle: -90, position: 'insideLeft', fill: '#707A6C' }}
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
                          stroke="#0D631B" 
                          strokeWidth={2}
                          name="Giá hiện tại"
                          dot={{ fill: '#0D631B', r: 4 }}
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
            </Box>
          )}

          {/* Supplier Info Card */}
          <SupplierInfoCard
            supplierName={product.supplier_name}
            supplierLatitude={product.supplier_latitude}
            supplierLongitude={product.supplier_longitude}
            supplierAddress={product.description}
          />

          {/* Related Products Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              sx={{
                fontFamily: '"Manrope",system-ui,sans-serif',
                fontWeight: 900,
                fontSize: '24px',
                lineHeight: '32px',
                letterSpacing: '-1.2px',
                color: '#181D17',
                mb: 4,
              }}
            >
              Near-expiry deals you might like
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.length > 0 ? (
                relatedProducts.map((relatedProduct) => (
                  <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                    <Box
                      onClick={() => navigate(`/products/${relatedProduct.id}`)}
                      sx={{
                        height: '362px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      {/* Product Image */}
                      <Box
                        sx={{
                          height: '200px',
                          backgroundColor: '#F1F5EB',
                          backgroundImage: `url(http://localhost:5000${relatedProduct.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* Discount Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '4px 12px',
                            backgroundColor: 'rgba(252, 130, 12, 0.9)',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#5E2C00',
                          }}
                        >
                          -{Math.round(((relatedProduct.original_price - relatedProduct.current_price) / relatedProduct.original_price) * 100)}%
                        </Box>
                      </Box>
                      
                      {/* Product Info */}
                      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: '"Manrope",system-ui,sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#181D17',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {relatedProduct.name}
                        </Typography>
                        
                        {/* Price */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                          <Typography
                            sx={{
                              fontFamily: '"Manrope",system-ui,sans-serif',
                              fontWeight: 800,
                              fontSize: '18px',
                              color: '#181D17',
                            }}
                          >
                            {relatedProduct.current_price.toLocaleString('vi-VN')}₫
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: '"Inter",system-ui,sans-serif',
                              fontWeight: 400,
                              fontSize: '14px',
                              textDecoration: 'line-through',
                              color: '#707A6C',
                            }}
                          >
                            {relatedProduct.original_price.toLocaleString('vi-VN')}₫
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography sx={{ color: '#707A6C', textAlign: 'center' }}>
                    Không có sản phẩm liên quan
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

