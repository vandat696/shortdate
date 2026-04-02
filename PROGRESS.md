# ShortDate - Tiến Độ Dự Án

**Ngày cập nhật**: 01/04/2026  
**Trạng thái**: Đang phát triển (Phase 1: MVP - Core Features)

---

## 📊 Tóm Tắt Tiến Độ

| Phần | Hoàn thành | Ghi chú |
|------|-----------|--------|
| **Backend - Authentication** | ✅ 100% | JWT, bcrypt, login/register |
| **Backend - Products** | ✅ 100% | CRUD, categories, inventory, image upload |
| **Backend - Cart & Wishlist** | ✅ 100% | Add/remove, merge guest cart, wishlist management |
| **Backend - Orders** | ✅ 100% | Create, view, cancel orders |
| **Backend - Addresses** | ✅ 100% | CRUD addresses, delivery methods |
| **Backend - Pricing** | ✅ 100% | Auto-pricing engine, price history |
| **Frontend - Auth Pages** | ✅ 100% | Login, Register, Header state |
| **Frontend - Product Listing** | ✅ 100% | HomePage, ProductCard, API integration |
| **Frontend - Cart & Wishlist UI** | 🟡 50% | Cart page created, wishlist UI pending |
| **Frontend - Checkout** | 🟡 25% | Checkout page structure, integration pending |
| **Frontend - Orders** | 🟡 25% | OrderDetailPage, OrderTrackingPage created |
| **Database** | ✅ 100% | 10 tables + migrations, PostgreSQL |
| **Payment** | 🟡 0% | Chưa bắt đầu |
| **Reviews & Rating** | 🟡 0% | Chưa bắt đầu |

---

## ✅ Phase 1: Core Features (Đang hoàn thiện)

### Backend (Express.js)
- [x] **Authentication Module**
  - POST `/auth/register` - Đăng ký tài khoản (email, password, phone, user_type)
  - POST `/auth/login` - Đăng nhập, return JWT token
  - JWT verification middleware (7 ngày expiry)
  - Password hashing với bcryptjs
  - Account locking sau 5 lần sai mật khẩu

- [x] **Product Management**
  - GET `/api/products/all` - Danh sách sản phẩm
  - GET `/api/products/:id` - Chi tiết sản phẩm
  - POST `/api/products` - Thêm sản phẩm (supplier only)
  - PUT `/api/products/:id` - Cập nhật sản phẩm
  - PATCH `/api/products/:id/inventory` - Cập nhật tồn kho
  - DELETE `/api/products/:id` - Xóa sản phẩm
  - GET `/api/products/categories` - Danh mục sản phẩm
  - GET `/api/products/supplier/list` - Danh sách sản phẩm của supplier
  - GET `/api/products/supplier/alerts/expiring` - Sản phẩm sắp hết hạn
  - GET `/api/products/supplier/alerts/low-stock` - Sản phẩm tồn kho thấp

- [x] **Profile Management**
  - POST `/api/auth/profile` - Cập nhật thông tin cá nhân
  - GET `/api/auth/profile` - Lấy thông tin profile
  - Supplier shop details (tên công ty, mã số thuế, địa chỉ, banner, avatar)

- [x] **Shopping Cart Management**
  - GET `/api/cart` - Lấy giỏ hàng (auth optional)
  - POST `/api/cart/items` - Thêm sản phẩm vào giỏ hàng
  - PATCH `/api/cart/items/:product_id` - Cập nhật số lượng
  - DELETE `/api/cart/items/:product_id` - Xóa sản phẩm
  - DELETE `/api/cart/clear` - Xóa tất cả sản phẩm
  - POST `/api/cart/merge` - Merge guest cart vào user cart

- [x] **Wishlist Management**
  - GET `/api/wishlist` - Lấy danh sách wishlist
  - POST `/api/products/:productId/wishlist` - Thêm vào wishlist
  - DELETE `/api/products/:productId/wishlist` - Xóa khỏi wishlist
  - GET `/api/products/:productId/wishlist/check` - Kiểm tra có trong wishlist

- [x] **Order Management**
  - POST `/api/orders` - Tạo đơn hàng từ giỏ hàng
  - GET `/api/orders` - Danh sách đơn hàng của user
  - GET `/api/orders/:orderId` - Chi tiết đơn hàng
  - POST `/api/orders/:orderId/cancel` - Hủy đơn hàng

- [x] **Address Management**
  - GET `/api/addresses` - Danh sách địa chỉ giao hàng
  - GET `/api/addresses/default` - Địa chỉ mặc định
  - POST `/api/addresses` - Thêm địa chỉ mới
  - PUT `/api/addresses/:id` - Cập nhật địa chỉ
  - DELETE `/api/addresses/:id` - Xóa địa chỉ
  - PATCH `/api/addresses/:id/default` - Đặt địa chỉ mặc định
  - GET `/api/addresses/methods/all` - Phương thức giao hàng

- [x] **Pricing Engine**
  - GET `/pricing/:productId/current` - Lấy giá hiện tại
  - GET `/pricing/:productId/history` - Lịch sử thay đổi giá
  - GET `/pricing/:productId/with-history` - Giá + lịch sử
  - PUT `/pricing/:productId/config` - Cấu hình auto-pricing
  - POST `/pricing/:productId/apply-engine` - Chạy pricing engine
  - POST `/pricing/run-all-engines` - Chạy cho tất cả sản phẩm

- [x] **Image Upload**
  - POST `/api/images/:productId/upload` - Upload tối đa 4 ảnh sản phẩm
  - GET `/api/images/:productId` - Lấy ảnh sản phẩm
  - Hỗ trợ: JPG, PNG, WebP (max 5MB)

- [x] **CORS Configuration**
  - Explicit origin whitelist: `localhost:5174`, `localhost:3000`
  - Request/response logging

### Frontend (React 19 + Vite)
- [x] **Auth Flow**
  - LoginForm - Nhập email/password, JWT storage
  - RegisterForm - Đăng ký tài khoản mới, auto-login
  - Header - Dynamic menu dựa trên auth state
  - Protected routes (ProfilePage, CheckoutPage)
  - Auto-login after register
  - Auth state sync across components
  - useAuth custom hook

- [x] **Product Display**
  - HomePage - Hero section + product grid
  - ProductCard - Hiển thị giảm giá, ngày hết hạn
  - ProductDetailPage - Chi tiết sản phẩm, giá lịch sử
  - FreshnessIndicator - Đánh dấu độ tươi sản phẩm
  - Product filtering UI
  - API integration `/api/products/all`
  - Loading & error states
  - Product image gallery

- [x] **Profile Pages**
  - ProfilePage - Dialog UPDATE thông tin cá nhân & shop
  - AddressManagementModal - Quản lý địa chỉ giao hàng
  - Tab 1: Personal Info (name, phone, avatar)
  - Tab 2: Shop Info (company, tax ID, address, banner)
  - Avatar upload support
  - Read-only view cho customer

- [x] **Shopping Features**
  - CartPage - Hiển thị giỏ hàng, quản lý số lượng
  - useCart custom hook - Cart state management
  - CartDrawerShell - Cart drawer component (responsive)
  - Add to cart button - ProductCard component
  - Cart icon with item count - Header component

- [x] **Wishlist Features**
  - Wishlist integration ready
  - Add/remove wishlist button - ProductCard
  - useCart config cho wishlist support

- [x] **Order Features**
  - CheckoutPage - Form đặt hàng
  - OrderDetailPage - Chi tiết đơn hàng
  - OrderTrackingPage - Theo dõi trạng thái đơn hàng
  - Order history lista ready

- [x] **Additional Components**
  - Footer - Footer component toàn trang
  - Header - Navigation header, auth state
  - CategoryCard - Card quản lý danh mục
  - BundleCard - Card hiển thị gói sản phẩm
  - LocalProductCard - Card sản phẩm cục bộ
  - BundlesSection - Khu vực hiển thị gói khuyến mãi
  - CategoriesSection - Khu vực danh mục

- [x] **Router & Navigation**
  - App.jsx - React Router setup
  - Main app layout + dynamic routes
  - Protected route support
  - Login/Register redirects

### Database (PostgreSQL)
- [x] **10 Tables**
  - `users` - Email, password hash, user_type, phone, avatar
  - `supplier_details` - Company, tax ID, shop address, banner, description
  - `products` - Name, price, category, stock, HSD, image
  - `categories` - Dry products (30-90 days), Fresh products (0-1 day)
  - `price_history` - Track giá sản phẩm theo ngày
  - `carts` - Shopping cart items
  - `orders` - Order details, status, total price
  - `order_items` - Chi tiết các sản phẩm trong đơn hàng
  - `reviews` - Review & rating cho sản phẩm
  - `notifications` - System notifications

---

## 🔧 Recent Implementations & Fixes

### New Features Added (Phase 1 Extension) ✅
1. **Shopping Cart System** - Full cart management (add, remove, update quantity, merge)
2. **Wishlist System** - Add/remove products, check wishlist status
3. **Order Management** - Create orders, view history, cancel orders
4. **Address Management** - CRUD operations, set default address
5. **Dynamic Pricing Engine** - Auto-pricing based on HSD and inventory
6. **Product Image Upload** - Multi-file upload support (JPG, PNG, WebP)
7. **Supplier Alerts** - Low stock & expiring product notifications

### Bug Fixes ✅
- **Token Property Mismatch**: Changed `req.user.id` → `req.user.userId` across all controllers
- **MUI Fragment Error**: Converted fragments to filtered arrays in Header component
- **Route Ordering**: Reordered product routes to prevent catch-all matching
- **API Endpoint Mismatch**: Updated frontend calls to match backend routes

---

## 🎯 Phase 2: Frontend Integration (In Progress)

### Cart & Order Flow
- [x] Backend endpoints implemented
- [x] Frontend pages created (CartPage, CheckoutPage, OrderDetailPage)
- 🟡 Frontend API integration (50% complete)
  - [ ] Cart operations API calls
  - [ ] Order creation flow
  - [ ] Order tracking updates

### Wishlist Integration
- [x] Backend endpoints implemented
- 🟡 Frontend integration (30% complete)
  - [ ] Wishlist button in ProductCard
  - [ ] WishlistPage component
  - [ ] Wishlist state management

### Address Management
- [x] Backend endpoints implemented
- 🟡 Frontend integration (40% complete)
  - [ ] AddressManagementModal UI polish
  - [ ] Form validation & error handling
  - [x] AddressManagementModal component created

---

## 🚀 Future Phases

### Phase 3: Advanced Features (Q2 2026)
- [ ] Search & Advanced Filtering with facets
- [ ] Product Recommendations (Machine Learning)
- [ ] User Reviews & Ratings system
- [ ] Supplier Analytics Dashboard
- [ ] Flash Sales & Promotions
- [ ] Multi-language support (EN/VI)

### Phase 4: Mobile & DevOps (Q3 2026)
- [ ] React Native Mobile App
- [ ] Docker Compose orchestration
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] AWS Deployment & Scaling
- [ ] Performance Optimization
- [ ] Security Hardening & Penetration Testing

### Phase 5: Payment & Logistics (Q4 2026)
- [ ] Payment Gateway Integration (Stripe/VnPay)
- [ ] 3PL Shipping Integration
- [ ] SMS/Email Notifications
- [ ] Real-time Order Tracking
- [ ] Refund/Return Management

---

## 📁 Project Structure

```
d:\IT Project\shortdate\
├── backend/                     # Express.js API
│   ├── server.js               # Entry point, CORS config
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   │   ├── authController.js
│   │   │   └── productController.js
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js
│   │   │   └── products.js
│   │   ├── middleware/          # JWT, error handling
│   │   │   └── auth.js
│   │   ├── models/              # Database models
│   │   └── config/              # Configuration
│   └── .env                     # JWT_SECRET, DB config
│
├── frontend-new/                # React 19 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── Header.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.jsx
│   │   │   │   │   └── RegisterForm.jsx
│   │   │   │   └── pages/
│   │   │   │       └── LoginPage.jsx
│   │   │   └── products/
│   │   │       ├── components/
│   │   │       │   └── ProductCard.jsx
│   │   │       └── pages/
│   │   │           └── HomePage.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance + interceptors
│   │   ├── theme/
│   │   │   └── theme.js         # MUI theme config
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
├── database/                    # PostgreSQL Docker
│   └── init.sql                 # Schema initialization
│
└── PROGRESS.md                  # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL 15 (Docker)
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **CORS**: Express CORS middleware
- **Port**: 5000

### Frontend
- **Framework**: React 19.2.4
- **Build**: Vite 8.0.2
- **UI**: Material-UI (MUI) 7.3.9
- **Routing**: React Router DOM 7.13.2
- **HTTP**: Axios 1.13.6
- **Port**: 5174 (Vite HMR)

### Database
- **Engine**: PostgreSQL 15
- **Container**: Docker
- **Port**: 5432
- **Tables**: 10 (users, products, orders, cart, reviews, etc.)

---

## 💻 Cài đặt & Chạy

### 1. Start Database
```bash
cd database
docker-compose up -d
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev            # PORT 5000
```

### 3. Start Frontend
```bash
cd frontend-new
npm install
npm run dev            # PORT 5174
```

### 4. Access Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL on port 5432

---

## 🧪 Testing Checklist

- [x] Register new account
- [x] Login with valid credentials
- [x] Header updates after login
- [x] View profile page (supplier only)
- [x] Update profile info
- [x] Product list loads on HomePage
- [x] Product card displays correctly
- [ ] Add product to cart (TODO)
- [ ] Checkout flow (TODO)
- [ ] Place order (TODO)

---

## 📝 Known Issues

None currently. Latest bug (product API 404) **FIXED** ✅

---

## 👥 Team Notes

- Prefer guided step-by-step instruction
- Learn by doing, not auto-fixes
- Vietnamese preferred for documentation
- Concise, direct guidance with examples

---

## 📞 Support

For issues or questions, refer to:
- Backend errors: Check `backend/` console
- Frontend errors: Open DevTools (F12) → Console tab
- Database issues: Check Docker logs
- API issues: Check Network tab in DevTools

---

**Last Updated**: 25/03/2026 21:45  
**Next Review**: After Cart implementation
