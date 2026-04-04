import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import logo from '../../../assets/logo.png';

const DRAWER_WIDTH = 256;

const menuItems = [
  { label: 'Bảng điều khiển', icon: DashboardIcon, path: '/supplier' },
  { label: 'Kho hàng', icon: InventoryIcon, path: '/supplier/inventory' },
  { label: 'Đơn hàng', icon: OrdersIcon, path: '/supplier/orders' },
  { label: 'Phân tích', icon: AnalyticsIcon, path: '/supplier/analytics' },
];

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [supplierName, setSupplierName] = useState('');
  const token = localStorage.getItem('token');

  // Check if user is supplier
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'supplier') {
      navigate('/');
    }

    // Load supplier info
    const loadSupplierInfo = async () => {
      try {
        const response = await api.get('/auth/profile');
        if (response.data.supplier_details?.company_name) {
          setSupplierName(response.data.supplier_details.company_name);
        } else {
          setSupplierName(response.data.first_name || 'Supplier');
        }
      } catch (err) {
        console.error('Error loading supplier info:', err);
      }
    };

    if (token) {
      loadSupplierInfo();
    }
  }, [token, navigate]);

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent('authChange', { detail: { isLoggedIn: false } }));
    navigate('/login');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/supplier/profile');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    if (path === '/supplier' && location.pathname === '/supplier') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/supplier';
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo/Branding */}
      <Box sx={{ p: '16px 16px', display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '2px solid #E7E5E4', backgroundColor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', flexShrink: 0 }}>
          <img src={logo} alt="ShortDate" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#14532D', fontSize: '16px', lineHeight: '22px', letterSpacing: '-0.5px', mb: 0.25 }}>
            ShortDate
          </Typography>
          <Typography variant="caption" sx={{ color: '#78716C', fontSize: '11px', lineHeight: '14px', fontWeight: 500 }}>
            Quản lý cửa hàng
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 1, px: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            component="button"
            key={item.label}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              backgroundColor: isActive(item.path) ? 'rgba(150, 73, 0, 0.08)' : 'transparent',
              borderLeft: isActive(item.path) ? '4px solid #964900' : '4px solid transparent',
              borderRadius: '8px',
              mx: 0,
              px: 1.25,
              py: 1,
              mb: 0.75,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: isActive(item.path) ? 'rgba(150, 73, 0, 0.12)' : 'rgba(248, 248, 248, 0.8)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(item.path) ? '#964900' : '#A8A29E',
              minWidth: '32px',
              transition: 'color 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <item.icon font​Size="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                ml: 0,
                '& .MuiTypography-root': {
                  fontWeight: isActive(item.path) ? 700 : 600,
                  color: isActive(item.path) ? '#964900' : '#40493D',
                  fontSize: '14px',
                  lineHeight: '20px',
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: '#E7E5E4', my: 1 }} />

      {/* Settings/Logout */}
      <List sx={{ px: 1, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <ListItem
          component="button"
          onClick={handleSettings}
          sx={{
            borderLeft: '4px solid transparent',
            borderRadius: '8px',
            px: 1.25,
            py: 1,
            mb: 0.75,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(248, 248, 248, 0.8)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#78716C', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Cấu hình" 
            sx={{
              ml: 0,
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: '#40493D',
                fontSize: '14px',
              },
            }}
          />
        </ListItem>
        <ListItem
          component="button"
          onClick={handleLogout}
          sx={{
            borderLeft: '4px solid transparent',
            borderRadius: '8px',
            px: 1.25,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#D32F2F', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Đăng xuất" 
            sx={{
              ml: 0,
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: '#D32F2F',
                fontSize: '14px',
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f9f0' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #F5F5F4',
          zIndex: 1100,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: '#333' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              fontWeight: 700,
              color: '#181D17',
              fontSize: '18px',
            }}
          >
            {supplierName || 'Cửa hàng'}
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#78716C', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Quản lý cửa hàng
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 40, height: 40, backgroundColor: '#14532D', fontSize: '14px', fontWeight: 700 }}>
                AS
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleSettings}>Cấu hình</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { xs: 0, md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: '#FAFAF9',
              borderRight: '1px solid #E7E5E4',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 3 },
          mt: '64px',
          width: '100%',
          backgroundColor: '#F7FBF0',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
