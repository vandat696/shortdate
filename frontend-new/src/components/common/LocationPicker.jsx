import { useEffect, useRef, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function LocationPicker({ onLocationSelected, initialLocation = null }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || {
    lat: 10.7769,
    lng: 106.6906,
    address: 'TP. Hồ Chí Minh'
  });
  const [loading, setLoading] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  // Initialize map
  useEffect(() => {
    // Skip if map is already initialized or container not ready
    if (map.current || !mapContainer.current) return;

    try {
      map.current = L.map(mapContainer.current).setView(
        [selectedLocation.lat, selectedLocation.lng],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);

      // Add marker
      marker.current = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(map.current);

      // Handle map click
      map.current.on('click', (e) => {
        updateMarker(e.latlng.lat, e.latlng.lng);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const updateMarker = async (lat, lng) => {
    if (marker.current) {
      marker.current.setLatLng([lat, lng]);
    } else {
      marker.current = L.marker([lat, lng]).addTo(map.current);
    }

    // Get address from coordinates (reverse geocoding)
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      
      const newLocation = {
        lat,
        lng,
        address: data.address?.city || data.address?.town || data.address?.town_name || 
                data.address?.county || data.address?.province || 'Không xác định'
      };
      
      setSelectedLocation(newLocation);
      setAddressInput(newLocation.address);
      onLocationSelected(newLocation);
    } catch (error) {
      console.error('Error getting address:', error);
      const newLocation = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
      setSelectedLocation(newLocation);
      onLocationSelected(newLocation);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            if (map.current) {
              map.current.setView([latitude, longitude], 13);
            }
            await updateMarker(latitude, longitude);
          } catch (error) {
            console.error('Error updating marker:', error);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('Không thể lấy vị trí. Vui lòng kiểm tra quyền');
        }
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#181D17' }}>
        📍 Chọn Vị Trí
      </Typography>

      {/* Map Container */}
      <Box
        ref={mapContainer}
        sx={{
          width: '100%',
          height: 400,
          borderRadius: '12px',
          border: '1px solid #EBEFE5',
          overflow: 'hidden',
          position: 'relative',
        }}
      />

      {/* Location Info */}
      <Paper sx={{ p: 2, backgroundColor: '#EBEFE5' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#181D17', mb: 1 }}>
          Vị trí đã chọn:
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#707A6C', mb: 1 }}>
          {selectedLocation?.address || 'Chưa chọn vị trí'}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#999' }}>
          Tọa độ: {Number(selectedLocation?.lat)?.toFixed(4) || '0'}, {Number(selectedLocation?.lng)?.toFixed(4) || '0'}
        </Typography>
      </Paper>

      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleUseCurrentLocation}
          disabled={loading}
          sx={{ borderColor: '#0D631B', color: '#0D631B' }}
        >
          {loading ? <CircularProgress size={20} /> : '📍 Vị Trí Hiện Tại'}
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            if (onLocationSelected) {
              onLocationSelected(selectedLocation);
            }
          }}
          sx={{ backgroundColor: '#0D631B' }}
        >
          ✓ Xác Nhận
        </Button>
      </Box>

      {/* Help Text */}
      <Typography sx={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
        💡 Bạn có thể bấm trực tiếp trên bản đồ hoặc dùng nút "Vị Trí Hiện Tại"
      </Typography>
    </Box>
  );
}
