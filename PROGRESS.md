# ShortDate - Tiến Độ Dự Án

**Ngày cập nhật**: 25/03/2026  
**Trạng thái**: Đang phát triển (Phase 1: MVP - Core Features)

---

## 📊 Tóm Tắt Tiến Độ

| Phần | Hoàn thành | Ghi chú |
|------|-----------|--------|
| **Backend - Authentication** | ✅ 100% | JWT, bcrypt, login/register |
| **Backend - Products** | ✅ 100% | CRUD, categories, inventory |
| **Frontend - Auth Pages** | ✅ 100% | Login, Register, Header state |
| **Frontend - Product Listing** | ✅ 100% | HomePage, ProductCard, API integration |
| **Database** | ✅ 100% | 10 tables, PostgreSQL |
| **Cart & Checkout** | 🟡 0% | Chưa bắt đầu |
| **Order Management** | 🟡 0% | Chưa bắt đầu |
| **Payment** | 🟡 0% | Chưa bắt đầu |
| **Reviews & Rating** | 🟡 0% | Chưa bắt đầu |

---

## ✅ Phase 1: Core Features (Hoàn thành)

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
  - DELETE `/api/products/:id` - Xóa sản phẩm
  - Product filtering by category, price range
  - Price history tracking

- [x] **Profile Management**
  - POST `/api/auth/profile` - Cập nhật thông tin cá nhân
  - GET `/api/auth/profile` - Lấy thông tin profile
  - Supplier shop details (tên công ty, mã số thuế, địa chỉ, banner, avatar)

- [x] **CORS Configuration**
  - Explicit origin whitelist: `localhost:5174`, `localhost:3000`
  - Request/response logging

### Frontend (React 19 + Vite)
- [x] **Auth Flow**
  - LoginForm - Nhập email/password, JWT storage
  - RegisterForm - Đăng ký tài khoản mới, auto-login
  - Header - Dynamic menu dựa trên auth state
  - Protected routes (ProfilePage - supplier only)
  - Auto-login after register
  - Auth state sync across components

- [x] **Product Display**
  - HomePage - Hero section + product grid
  - ProductCard - Hiển thị giảm giá, ngày hết hạn
  - Product filtering UI (ready for future filters)
  - API integration `/api/products/all`
  - Fallback mockup products if API fails
  - Loading & error states

- [x] **Profile Pages**
  - ProfilePage - Dialog untuk cập nhật thông tin
  - Tab 1: Personal Info (name, phone, avatar)
  - Tab 2: Shop Info (company, tax ID, address, banner, description)
  - Avatar upload support
  - Read-only view khi không phải supplier

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

## 🔧 Recent Fixes (Phase 1)

### Bug 1: Token Property Mismatch ✅
**Issue**: Token có `userId` nhưng controller expect `id`  
**Fix**: Cập nhật 4 controller functions dùng `req.user.userId` thay vì `req.user.id`

### Bug 2: MUI Fragment Error ✅
**Issue**: Header Menu sử dụng fragments (không support)  
**Fix**: Convert fragments thành array với `.filter(Boolean)`

### Bug 3: Route Ordering ✅
**Issue**: Catch-all route `/:id` match trước specific routes  
**Fix**: Đặt specific routes trước catch-all

### Bug 4: Products Not Loading ✅
**Issue**: Frontend gọi `/products` nhưng backend route là `/products/all`  
**Fix**: Update api.js `getAll()` method thành call `/products/all`

### Bug 5: Header Auth State Not Updating ✅
**Issue**: Header không update sau login  
**Fix**: Thêm `useEffect` listeners + dispatch custom `authChange` event

---

## 🎯 Next Phase: Cart & Order (Chưa bắt đầu)

### Backend Endpoints
- [ ] POST `/api/cart/add` - Thêm sản phẩm vào giỏ
- [ ] GET `/api/cart` - Lấy giỏ hàng
- [ ] PUT `/api/cart/:itemId` - Cập nhật số lượng
- [ ] DELETE `/api/cart/:itemId` - Xóa khỏi giỏ
- [ ] POST `/api/orders` - Tạo đơn hàng từ giỏ
- [ ] GET `/api/orders` - Danh sách đơn hàng của user
- [ ] GET `/api/orders/:id` - Chi tiết đơn hàng

### Frontend Features
- [ ] CartPage - Hiển thị giỏ hàng, tính tổng tiền
- [ ] CheckoutPage - Nhập địa chỉ giao hàng, chọn phương thức thanh toán
- [ ] OrderConfirmationPage - Hiển thị xác nhận đơn hàng
- [ ] OrderHistoryPage - Danh sách đơn hàng của user
- [ ] AddToCart button - ProductCard, HomePage

---

## 🚀 Future Phases

### Phase 3: Advanced Features
- [ ] Search & Advanced Filtering
- [ ] Product Recommendations (AI-based)
- [ ] Wishlist Functionality
- [ ] User Reviews & Ratings
- [ ] Supplier Analytics Dashboard
- [ ] Automated Discount System (by expiry date)

### Phase 4: DevOps & Deployment
- [ ] Docker Compose for full stack
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] AWS/Vercel Deployment
- [ ] Performance Optimization
- [ ] Security Hardening

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
