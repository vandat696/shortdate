/**
 * Get API base URL from environment or fallback to localhost
 * Usage: const baseUrl = getApiBaseUrl()
 */
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

/**
 * Get backend base URL (without /api)
 * Usage: const backendUrl = getBackendBaseUrl()
 */
export const getBackendBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('/api', '');
};
