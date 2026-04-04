import { Box, Typography, CircularProgress, Alert, Card, CardMedia, IconButton } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getSupplierDistance } from '../../../utils/distanceUtils';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Custom icon cho user location từ MUI
const userIcon = L.divIcon({
  html: `<div style="background: rgb(54, 104, 185); border-radius: 50%; width: 16px; height: 16px; margin: 0; padding: 0; display: block;"></div>`,
  iconSize: [16, 16],
  popupAnchor: [0, -8],
  className: ''
});

// Custom icon cho shops từ MUI
const shopIcon = L.divIcon({
  html: `<div style="background: radial-gradient(circle, white 8%, #EE4D47 50%); border: 3px solid white; border-radius: 50%; width: 26px; height: 26px; margin: 0; padding: 0; display: block; box-shadow: 0 0 0 2px #EE4D47, 0 3px 8px rgba(238, 77, 71, 0.4);"></div>`,
  iconSize: [26, 26],
  popupAnchor: [0, -13],
  className: ''
});

export default function NearYouMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [productCarouselIndex, setProductCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        // Lấy từ localStorage trước
        const storedLoc = localStorage.getItem('userLocation');
        if (storedLoc) {
          const parsed = JSON.parse(storedLoc);
          setUserLocation(parsed);
          await fetchNearbyShops(parsed);
          return;
        }

        // Nếu không, fetch từ API
        if (token) {
          const response = await axios.get(
            'http://localhost:5000/api/auth/location',
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data?.location?.latitude && response.data?.location?.longitude) {
            const loc = {
              lat: response.data.location.latitude,
              lng: response.data.location.longitude,
              address: response.data.location.address
            };
            setUserLocation(loc);
            localStorage.setItem('userLocation', JSON.stringify(loc));
            await fetchNearbyShops(loc);
          }
        }
      } catch (err) {
        console.error('Error loading location:', err);
        setError('Không thể tải vị trí của bạn');
      } finally {
        setLoading(false);
      }
    };

    loadUserLocation();
    // Reset carousel when products change
    setProductCarouselIndex(0);
  }, [token]);

  const fetchNearbyShops = async (userLoc) => {
    try {
      // Fetch tất cả suppliers/shops
      const response = await axios.get(
        'http://localhost:5000/api/products/all?limit=1000',
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const products = response.data?.products || [];

      // Extract unique suppliers với location
      const suppliersMap = new Map();
      const productsArray = [];

      products.forEach(product => {
        if (product.supplier_name && product.supplier_latitude && product.supplier_longitude) {
          const key = product.supplier_id;
          if (!suppliersMap.has(key)) {
            const distance = getSupplierDistance(
              userLoc,
              product.supplier_latitude,
              product.supplier_longitude
            );
            suppliersMap.set(key, {
              id: product.supplier_id,
              name: product.supplier_name,
              lat: parseFloat(product.supplier_latitude),
              lng: parseFloat(product.supplier_longitude),
              distance,
              productsCount: 1
            });
          } else {
            const supplier = suppliersMap.get(key);
            supplier.productsCount += 1;
          }
          
          // Collect products from nearby shops
          productsArray.push({
            ...product,
            supplier_distance: getSupplierDistance(
              userLoc,
              product.supplier_latitude,
              product.supplier_longitude
            )
          });
        }
      });

      // Convert to array và sort by distance
      const suppliersList = Array.from(suppliersMap.values())
        .sort((a, b) => {
          const aDist = parseFloat(a.distance) || Infinity;
          const bDist = parseFloat(b.distance) || Infinity;
          return aDist - bDist;
        });

      // Sort products by supplier distance, then by discounted price
      const sortedProducts = productsArray
        .sort((a, b) => {
          const aDist = parseFloat(a.supplier_distance) || Infinity;
          const bDist = parseFloat(b.supplier_distance) || Infinity;
          if (aDist !== bDist) return aDist - bDist;
          return b.current_price - a.current_price;
        })
        .slice(0, 12); // Lấy 12 sản phẩm gần nhất

      setSuppliers(suppliersList);
      setNearbyProducts(sortedProducts);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Không thể tải danh sách shops');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
        <CircularProgress sx={{ color: '#0D631B' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!userLocation) {
    return (
      <Alert severity="info">
        Vui lòng cập nhật vị trí của bạn ở trang Trang Cá Nhân để xem các shops gần đó
      </Alert>
    );
  }

  const mapCenter = [userLocation.lat, userLocation.lng];

  return (
    <Box sx={{ width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }}>
      {/* Map Container */}
      <Box sx={{ height: '500px', width: '100%', mb: 2 }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* User Location Marker */}
          <Marker position={mapCenter} icon={userIcon}>
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '12px', color: '#181D17' }}>
                  📍 Vị trí của bạn
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                  {userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                </Typography>
              </Box>
            </Popup>
          </Marker>

          {/* Shop Markers */}
          {suppliers.map(shop => (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lng]}
              icon={shopIcon}
            >
              <Popup>
                <Box sx={{ p: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#181D17', mb: 0.5 }}>
                    {shop.name}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#0D631B', fontWeight: 600, mb: 0.5 }}>
                    📍 {shop.distance}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', color: '#666' }}>
                    {shop.productsCount} sản phẩm
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Nearby Shops List */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <StoreIcon sx={{ fontSize: '18px', color: '#0D631B' }} />
          <Typography sx={{ fontFamily: '"Manrope","Inter",system-ui,sans-serif', fontWeight: 700, fontSize: '14px', color: '#181D17', textTransform: 'uppercase' }}>
            {suppliers.length} Shops gần bạn
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {suppliers.slice(0, 5).map(shop => (
            <Box
              key={shop.id}
              sx={{
                p: 2,
                backgroundColor: '#F7FBF0',
                borderRadius: '12px',
                border: '1px solid rgba(13, 99, 27, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#181D17', mb: 0.5 }}>
                  {shop.name}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                  {shop.productsCount} sản phẩm
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '12px', color: '#0D631B', whiteSpace: 'nowrap' }}>
                {shop.distance}
              </Typography>
            </Box>
          ))}
        </Box>

        {suppliers.length > 5 && (
          <Typography sx={{ fontSize: '11px', color: '#999', mt: 1, textAlign: 'center' }}>
            +{suppliers.length - 5} shops khác...
          </Typography>
        )}
      </Box>

      {/* Nearby Products List */}
      {nearbyProducts.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CardGiftcardIcon sx={{ fontSize: '18px', color: '#0D631B' }} />
              <Typography sx={{ fontFamily: '"Manrope","Inter",system-ui,sans-serif', fontWeight: 700, fontSize: '14px', color: '#181D17', textTransform: 'uppercase' }}>
                Sản phẩm lân cận
              </Typography>
            </Box>
            {nearbyProducts.length > 5 && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setProductCarouselIndex(Math.max(0, productCarouselIndex - 1))}
                  disabled={productCarouselIndex === 0}
                  sx={{ color: '#0D631B', '&:disabled': { color: '#ddd' } }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setProductCarouselIndex(Math.min(nearbyProducts.length - 5, productCarouselIndex + 1))}
                  disabled={productCarouselIndex >= nearbyProducts.length - 5}
                  sx={{ color: '#0D631B', '&:disabled': { color: '#ddd' } }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, 
              gap: 1.5,
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            {nearbyProducts.slice(productCarouselIndex, productCarouselIndex + 5).map((product) => (
              <Card
                key={`${product.id}-${productCarouselIndex}`}
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #E0E4DA',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {(product.thumbnail_url || product.image_url) && (
                  <CardMedia
                    component="img"
                    height="100"
                    image={`http://localhost:5000${product.thumbnail_url || product.image_url}`}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '11px', color: '#181D17', mb: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </Typography>
                  <Typography sx={{ fontSize: '9px', color: '#666', mb: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <StoreIcon sx={{ fontSize: '9px', mr: 0.25, verticalAlign: 'middle', color: '#0D631B' }} />
                    {product.supplier_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.25 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '11px', color: '#0D631B' }}>
                      {product.current_price?.toLocaleString()}đ
                    </Typography>
                    {product.original_price > product.current_price && (
                      <Typography sx={{ fontSize: '8px', color: '#999', textDecoration: 'line-through' }}>
                        {product.original_price?.toLocaleString()}đ
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '8px', color: '#999' }}>
                      <LocationOnIcon sx={{ fontSize: '8px', mr: 0.2, verticalAlign: 'middle' }} />
                      {product.supplier_distance}
                    </Typography>
                    {product.original_price > product.current_price && (
                      <Typography sx={{ fontSize: '8px', fontWeight: 700, color: '#EE4D47', backgroundColor: '#FEE8E7', px: 0.5, py: 0.1, borderRadius: '2px' }}>
                        -{Math.round(((product.original_price - product.current_price) / product.original_price) * 100)}%
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
