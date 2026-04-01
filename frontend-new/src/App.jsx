import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import theme from './theme/theme';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawerShell from './components/common/CartDrawerShell';
import HomePage from './features/products/pages/HomePage';
import SearchPage from './features/products/pages/SearchPage';
import ProductDetailPage from './features/products/pages/ProductDetailPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import SupplierProductsPage from './features/products/pages/SupplierProductsPage';
import CartPage from './features/cart/pages/CartPage';
import OrderDetailPage from './features/orders/pages/OrderDetailPage';
import OrderTrackingPage from './features/orders/pages/OrderTrackingPage';
import CheckoutPage from './features/orders/pages/CheckoutPage';
import { CartProvider } from './hooks/useCart.jsx';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CartProvider>
          <Box sx={{ backgroundColor: '#F7FBF0', minHeight: '100vh', position: 'relative' }}>
            <Header cartCount={0} />
            <CartDrawerShell />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/supplier/products" element={<SupplierProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
            </Routes>
            <Footer />
          </Box>
        </CartProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
