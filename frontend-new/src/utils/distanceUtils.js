/**
 * Haversine formula để tính khoảng cách giữa hai điểm (latitude, longitude)
 * Trả về khoảng cách tính bằng km
 * 
 * @param {number} lat1 - Latitude điểm 1
 * @param {number} lon1 - Longitude điểm 1
 * @param {number} lat2 - Latitude điểm 2
 * @param {number} lon2 - Longitude điểm 2
 * @returns {number} - Khoảng cách tính bằng km
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Format khoảng cách với độ chính xác phù hợp
 * @param {number} distance - Khoảng cách tính bằng km
 * @returns {string} - Khoảng cách định dạng (ví dụ: "2.5 km")
 */
export const formatDistance = (distance) => {
  if (!distance || distance < 0) {
    return 'Không xác định';
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
};

/**
 * Lấy vị trí người dùng từ localStorage
 * @returns {object|null} - {lat, lng} hoặc null
 */
export const getUserLocation = () => {
  try {
    const userLocation = localStorage.getItem('userLocation');
    if (userLocation) {
      return JSON.parse(userLocation);
    }
  } catch (err) {
    console.error('Error parsing user location:', err);
  }
  return null;
};

/**
 * Tính khoảng cách từ user đến supplier
 * @param {object} userLocation - {lat, lng} từ getUserLocation()
 * @param {number} supplierLat - Latitude supplier
 * @param {number} supplierLng - Longitude supplier
 * @returns {string} - Khoảng cách định dạng hoặc "Không xác định"
 */
export const getSupplierDistance = (userLocation, supplierLat, supplierLng) => {
  if (!userLocation || !supplierLat || !supplierLng) {
    return 'Không xác định';
  }

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    supplierLat,
    supplierLng
  );

  return formatDistance(distance);
};
