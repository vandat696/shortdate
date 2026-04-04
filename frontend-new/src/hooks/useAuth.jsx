import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    userType: localStorage.getItem('userType'),
  });

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState({
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('userId'),
        userType: localStorage.getItem('userType'),
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      userType: localStorage.getItem('userType'),
      isLoggedIn: !!localStorage.getItem('token'),
      isSupplier: localStorage.getItem('userType') === 'supplier'
    };
  }
  
  return {
    token: context.token,
    userId: context.userId,
    userType: context.userType,
    isLoggedIn: !!context.token,
    isSupplier: context.userType === 'supplier'
  };
}
