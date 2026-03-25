import { useState } from 'react';
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
  const isLoggedIn = localStorage.getItem('token');

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
            {!isLoggedIn ? (
              <>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>
                  Đăng Nhập
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>
                  Đăng Ký
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  Trang Cá Nhân
                </MenuItem>
                <MenuItem onClick={handleLogout}>Đăng Xuất</MenuItem>
              </>
            )}
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
