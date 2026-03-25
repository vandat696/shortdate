# ShortDate Frontend

E-commerce platform cho các sản phẩm thực phẩm sắp hết hạn (Dry products: 30-90 days, Fresh products: 0-1 days) với giảm giá tự động dựa trên ngày hết hạn.

## Tech Stack

- **Framework**: React 19.2.4
- **Build Tool**: Vite (10x faster than Create React App)
- **UI Library**: Material-UI v7.3.9 (sx prop styling)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (with JWT interceptor)
- **Dev Server**: Vite HMR on http://localhost:5173

## Project Structure

```
src/
├── components/
│   └── common/
│       └── Header.jsx              # Navigation bar with search, cart, account menu
├── features/                       # Feature-based organization (scalable)
│   ├── auth/
│   │   ├── components/             # LoginForm, RegisterForm (TODO)
│   │   ├── pages/                  # LoginPage, RegisterPage (TODO)
│   │   └── services/               # Authentication logic (TODO)
│   └── products/
│       ├── components/
│       │   └── ProductCard.jsx     # Reusable product card with discount & expiry
│       ├── pages/
│       │   └── HomePage.jsx        # Hero + product grid + pagination
│       └── services/               # Product API calls (TODO)
├── hooks/                          # Custom React hooks useAuth, useCart, etc.TODO
├── services/
│   ├── api.js                      # Axios instance with JWT interceptor
│   └── storage.js                  # localStorage management (TODO)
├── theme/
│   └── theme.js                    # Material-UI createTheme with custom palette
├── utils/                          # Helpers (validators, formatters, etc.) - TODO
├── App.jsx                         # Root component with routing
└── main.jsx                        # React entry point
```

## Color Palette (ShortDate Brand)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Xanh lá) | #4CAF50 | Buttons, headers, main accents |
| Secondary (Cam) | #FF9800 | Expiry timer badge, secondary actions |
| Accent (Đỏ) | #FF5252 | Discount badge, alerts |
| Background | #FAFAFA | Page background |
| Text Primary | #212121 | Main text |

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API URL
VITE_API_URL=http://localhost:5000/api
```

## Development

```bash
# Start dev server (hot reload enabled)
npm run dev

# Open http://localhost:5173 in browser
```

## Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Features Implemented

- ✅ Header with navigation, search, cart, account menu
- ✅ Product listing page with grid layout
- ✅ Product cards with discount badge and expiry timer
- ✅ Pagination
- ✅ Material-UI theme integration
- ✅ Axios API service with JWT interceptor

## Features TODO

- 🔄 Authentication (Login/Register pages)
- 🔄 Shopping cart functionality
- 🔄 Order management
- 🔄 User profile page
- 🔄 Product detail page
- 🔄 Favorite/Wishlist
- 🔄 Admin dashboard
- 🔄 Supplier dashboard

## Key Concepts

### Feature-Based Organization
Each feature (auth, products, cart, orders) is self-contained:
```
features/
├── auth/          ← All auth-related components, pages, services
├── products/      ← All product-related code
├── cart/          ← Shopping cart logic
└── orders/        ← Order management
```
Benefits:
- ✅ Scale easily without structure collapse
- ✅ Team members work on isolated features
- ✅ Easy to find related code
- ✅ Simple to delete/maintain features

### sx Prop Styling
Uses Material-UI's `sx` prop (no CSS files, no makeStyles):
```jsx
<Box sx={{ 
  backgroundColor: '#FAFAFA', 
  padding: '16px',
  '&:hover': { color: '#4CAF50' }
}}>
  Content
</Box>
```

### JWT Authentication
Axios interceptor automatically adds JWT token from localStorage:
```javascript
// services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## API Integration

Backend API: `http://localhost:5000/api`

### Available Endpoints (from backend)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `GET /auth/profile` - Get user profile
- `GET /products` - List all products
- `GET /products/:id` - Get product details

## Performance Tips

- ✅ Vite provides instant HMR (Hot Module Reload)
- ✅ Material-UI sx prop is optimized for performance
- ✅ Lazy load pages using React.lazy() (TODO)
- ✅ Code splitting via Vite (automatic)

## Troubleshooting

### Port 5173 already in use
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Dependencies not resolving
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
```

### HMR not working
- Check that `npm run dev` is running
- Refresh browser page
- Check browser dev tools console for errors

## Resources

- [Vite Docs](https://vite.dev)
- [React Docs](https://react.dev)
- [Material-UI Docs](https://mui.com)
- [React Router Docs](https://reactrouter.com)
