import { Box, Typography, Card, CircularProgress } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { getSupplierDistance } from '../../../utils/distanceUtils';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

export default function SupplierInfoCard({ 
  supplierName, 
  supplierLatitude, 
  supplierLongitude,
  supplierAddress 
}) {
  const [distance, setDistance] = useState('Không xác định');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Lấy user location từ localStorage
    try {
      const loc = localStorage.getItem('userLocation');
      if (loc) {
        const parsed = JSON.parse(loc);
        setUserLocation(parsed);
        
        // Tính khoảng cách
        if (supplierLatitude && supplierLongitude) {
          const dist = getSupplierDistance(
            parsed,
            supplierLatitude,
            supplierLongitude
          );
          setDistance(dist);
        }
      }
    } catch (err) {
      console.error('Error getting user location:', err);
    }
  }, [supplierLatitude, supplierLongitude]);

  // Nếu không có thông tin supplier
  if (!supplierName || !supplierLatitude || !supplierLongitude) {
    return null;
  }

  const mapCenter = { lat: parseFloat(supplierLatitude), lng: parseFloat(supplierLongitude) };

  return (
    <Card
      sx={{
        width: '100%',
        p: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        mb: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <StoreIcon sx={{ fontSize: '24px', color: '#0D631B' }} />
        <Typography
          sx={{
            fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
            fontWeight: 800,
            fontSize: '20px',
            lineHeight: '28px',
            color: '#181D17',
          }}
        >
          Thông tin cửa hàng
        </Typography>
      </Box>

      {/* Shop Name */}
      <Typography
        sx={{
          fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '24px',
          color: '#0D631B',
          mb: 2,
        }}
      >
        {supplierName}
      </Typography>

      {/* Distance */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LocationOnIcon sx={{ fontSize: '16px', color: '#0D631B' }} />
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#0D631B',
          }}
        >
          {distance}
        </Typography>
      </Box>

      {/* Map */}
      <Box
        sx={{
          mb: 3,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          height: '300px',
          backgroundColor: '#F0F0F0',
        }}
      >
        {supplierLatitude && supplierLongitude ? (
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={mapCenter} />
          </MapContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Address */}
      {supplierAddress && (
        <Box sx={{ p: 3, backgroundColor: '#F7FBF0', borderRadius: '12px' }}>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              textTransform: 'uppercase',
              color: '#707A6C',
              mb: 1,
            }}
          >
            Địa chỉ
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter",system-ui,sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#181D17',
            }}
          >
            {supplierAddress}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
