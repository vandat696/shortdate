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
  Container,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Favorite,
  Search,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.jsx';
import { useWishlist } from '../../hooks/useWishlist.jsx';
import logoImage from '../../assets/logo.png';

export default function Header({ onFilterMenuToggle }) {
  const navigate = useNavigate();
  const { itemsCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  const handleFilterMenuClick = () => {
    // Emit a custom event that HomePage will listen to
    window.dispatchEvent(new CustomEvent('filterMenuToggle'));
    if (onFilterMenuToggle) {
      onFilterMenuToggle();
    }
  };

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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#F7FBF0',
        color: '#212121',
        borderBottom: '1px solid rgba(191, 202, 186, 0.25)',
      }}
    >
      <Toolbar disableGutters sx={{ height: 84 }}>
        <Container
          maxWidth={false}
          sx={{
            maxWidth: 1280,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          {/* Hamburger Menu - Filter Button */}
          <IconButton 
            onClick={handleFilterMenuClick}
            sx={{ display: { xs: 'flex', md: 'flex' }, color: '#0D631B', minWidth: 'auto' }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>

          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <img 
              src={logoImage} 
              alt="ShortDate Logo"
              style={{
                height: '48px',
                objectFit: 'contain',
              }}
            />
            <Box
              sx={{
                fontSize: 24,
                fontWeight: 900,
                color: '#0D631B',
                letterSpacing: '-1.2px',
                fontFamily: '"Myriad Condensed","Montserrat","Inter",system-ui,sans-serif',
                lineHeight: '32px',
              }}
            >
              ShortDate
            </Box>
          </Box>

          {/* Search pill */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: 318,
              height: 52,
              background: '#F1F5EB',
              borderRadius: 9999,
              px: 2,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{
                flex: 1,
                '& input': { fontSize: 14, color: '#181D17' },
              }}
            />
            <IconButton type="submit" size="small" sx={{ color: '#0D631B' }}>
              <Search sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {userType !== 'supplier' && (
              <>
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/wishlist')}
                  sx={{ color: '#0D631B' }}
                >
                  <Badge badgeContent={wishlistCount} color="error">
                    <Favorite />
                  </Badge>
                </IconButton>

                <IconButton color="inherit" onClick={() => navigate('/cart')} sx={{ color: '#0D631B' }}>
                  <Badge badgeContent={itemsCount} color="error">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </>
            )}

            <IconButton color="inherit" onClick={handleMenuOpen} sx={{ color: '#0D631B' }}>
              <AccountCircle sx={{ fontSize: 28 }} />
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
                userType !== 'supplier' ? (
                  <MenuItem key="profile" onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                    Trang Cá Nhân
                  </MenuItem>
                ) : null,
                userType === 'supplier' ? (
                  <MenuItem key="shop" onClick={() => { handleMenuClose(); navigate('/supplier'); }}>
                    Quản Lý Cửa Hàng
                  </MenuItem>
                ) : null,
                <MenuItem key="logout" onClick={handleLogout}>Đăng Xuất</MenuItem>
              ].filter(Boolean)}
            </Menu>
          </Box>
        </Container>
      </Toolbar>

    </AppBar>
  );
}
