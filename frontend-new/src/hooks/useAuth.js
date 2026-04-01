import { useContext } from 'react';

// Simple auth hook - reads from localStorage
export function useAuth() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');

  return {
    token,
    userId,
    userType,
    isLoggedIn: !!token,
    isSupplier: userType === 'supplier'
  };
}
