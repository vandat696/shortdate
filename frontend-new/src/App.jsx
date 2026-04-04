import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import theme from './theme/theme';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawerShell from './components/common/CartDrawerShell';
import ScrollToTop from './components/common/ScrollToTop';
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
import WishlistPage from './features/wishlist/pages/WishlistPage';
import SupplierDashboard from './features/supplier/pages/SupplierDashboard';
import DashboardOverview from './features/supplier/pages/DashboardOverview';
import SupplierInventory from './features/supplier/pages/SupplierInventory';
import SupplierOrders from './features/supplier/pages/SupplierOrders';
import SupplierAnalytics from './features/supplier/pages/SupplierAnalytics';
import SupplierProfilePage from './features/supplier/pages/SupplierProfilePage';
import { CartProvider } from './hooks/useCart.jsx';
import { WishlistProvider } from './hooks/useWishlist.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Supplier Dashboard Routes - No Header/Footer */}
                <Route path="/supplier/*" element={<SupplierDashboard />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="inventory" element={<SupplierInventory />} />
                  <Route path="orders" element={<SupplierOrders />} />
                  <Route path="analytics" element={<SupplierAnalytics />} />
                  <Route path="profile" element={<SupplierProfilePage />} />
                </Route>

                {/* Customer Routes - With Header/Footer */}
                <Route
                  path="*"
                  element={
                    <Box
                      sx={{
                        width: '100%',
                        backgroundColor: '#F7FBF0',
                        position: 'relative',
                        overflowX: 'hidden',
                      }}
                    >
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
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
                      </Routes>
                      <Footer />
                    </Box>
                  }
                />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
