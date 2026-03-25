import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  TextField,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Favorite,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Header({ cartCount = 0 }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  // Listen to storage changes (from login/logout)
  useEffect(() => {
    const handleAuthChange = (event) => {
      const token = localStorage.getItem('token');
      const uType = localStorage.getItem('userType');
      setIsLoggedIn(!!token);
      setUserType(uType);
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Also listen for page visibility to refresh auth state
  useEffect(() => {
    const handleVisibilityChange = () => {
      const token = localStorage.getItem('token');
      const uType = localStorage.getItem('userType');
      setIsLoggedIn(!!token);
      setUserType(uType);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserType(null);
    window.dispatchEvent(new CustomEvent('authChange', { detail: { isLoggedIn: false } }));
    handleMenuClose();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#FFFFFF', color: '#212121' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{
            fontSize: '1.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#4CAF50',
            letterSpacing: '-0.02em',
          }}
        >
          ShortDate
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            gap: 1,
            flex: 1,
            maxWidth: '500px',
            mx: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              backgroundColor: '#F5F5F5',
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            }}
          />
          <IconButton type="submit" color="primary">
            <Search />
          </IconButton>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton color="inherit">
            <Badge badgeContent={0} color="error">
              <Favorite />
            </Badge>
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle sx={{ fontSize: '1.8rem' }} />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {!isLoggedIn ? [
              <MenuItem key="login" onClick={() => { handleMenuClose(); navigate('/login'); }}>
                Đăng Nhập
              </MenuItem>,
              <MenuItem key="register" onClick={() => { handleMenuClose(); navigate('/register'); }}>
                Đăng Ký
              </MenuItem>
            ] : [
              <MenuItem key="profile" onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                Trang Cá Nhân
              </MenuItem>,
              userType === 'supplier' ? (
                <MenuItem key="shop" onClick={() => { handleMenuClose(); navigate('/supplier/products'); }}>
                  Quản Lý Cửa Hàng
                </MenuItem>
              ) : null,
              <MenuItem key="logout" onClick={handleLogout}>Đăng Xuất</MenuItem>
            ].filter(Boolean)}
          </Menu>
        </Box>
      </Toolbar>

      {/* Category Bar */}
      <Box
        sx={{
          backgroundColor: '#F5F5F5',
          padding: '8px 16px',
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
        }}
      >
        {['Tất Cả', 'Thực Phẩm Khô', 'Đồ Ăn Tươi', 'Flash Sale'].map((cat) => (
          <Button
            key={cat}
            size="small"
            sx={{
              color: '#757575',
              whiteSpace: 'nowrap',
              '&:hover': { color: '#4CAF50' },
            }}
          >
            {cat}
          </Button>
        ))}
      </Box>
    </AppBar>
  );
}
