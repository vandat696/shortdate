# ShortDate - Quick Start Guide

**Hướng dẫn cài đặt và chạy dự án ShortDate**

---

## 📋 Yêu cầu

- **Node.js**: >= 18.x
- **Docker**: >= 20.x (cho PostgreSQL)
- **npm**: >= 8.x
- **Windows PowerShell** (hoặc bash)

---

## ⚡ Quick Start (10 phút)

### 1. Clone & Setup Database
```powershell
cd d:\IT Project\shortdate

# Khởi động PostgreSQL Docker
docker-compose -f database/docker-compose.yml up -d

# Verify database running
docker ps
```

### 2. Setup Backend
```powershell
cd backend
npm install
npm run dev
```
✅ Backend sẽ chạy trên: `http://localhost:5000`

### 3. Setup Frontend
```powershell
cd ..\frontend-new
npm install
npm run dev
```
✅ Frontend sẽ chạy trên: `http://localhost:5174`

### 4. Test Application
- **Browser**: Open `http://localhost:5174`
- **Register**: Tạo tài khoản mới
- **Login**: Đăng nhập
- **View Products**: Xem danh sách sản phẩm

---

## 📁 Folder Structure

```
shortdate/
├── backend/                    # Express.js API Server
│   ├── server.js              # Main server file
│   ├── src/
│   │   ├── controllers/        # API logic
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # JWT, auth
│   │   ├── models/             # Database models
│   │   └── config/             # Config files
│   ├── .env                    # Environment variables
│   └── package.json
│
├── frontend-new/               # React Vite SPA
│   ├── src/
│   │   ├── features/           # Feature modules (auth, products)
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API services
│   │   ├── theme/              # Material-UI theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── database/                   # PostgreSQL Setup
│   ├── docker-compose.yml      # Docker configuration
│   ├── init.sql                # Database schema
│   └── migrations/             # Database migrations
│
├── PROGRESS.md                 # ⭐ Project Status (THIS FILE!)
├── API_DOCS.md                 # API Documentation
└── QUICK_START.md              # This file
```

---

## 🔧 Common Commands

### Start All Services
```powershell
# Terminal 1: Database
docker-compose -f d:\IT Project\shortdate\database\docker-compose.yml up -d

# Terminal 2: Backend
cd d:\IT Project\shortdate\backend
npm run dev

# Terminal 3: Frontend
cd d:\IT Project\shortdate\frontend-new
npm run dev
```

### Database Operations
```powershell
# Check PostgreSQL status
docker ps

# Access database shell
docker exec -it shortdate-db psql -U postgres -d shortdate

# View products
docker exec shortdate-db psql -U postgres -d shortdate -c "SELECT * FROM products;"

# Stop database
docker-compose -f d:\IT Project\shortdate\database\docker-compose.yml down
```

### Frontend Development
```powershell
cd d:\IT Project\shortdate\frontend-new

# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend Development
```powershell
cd d:\IT Project\shortdate\backend

# Development server (auto restart)
npm run dev

# Check syntax
npm run lint

# Build (if needed)
npm run build
```

---

## 🧪 Test Endpoints

### 1. Register User
```powershell
$headers = @{"Content-Type"="application/json"}
$body = @{
    email = "test@example.com"
    password = "password123"
    phone = "0123456789"
    userType = "customer"
} | ConvertTo-Json

Invoke-WebRequest -Method POST `
  -Uri "http://localhost:5000/auth/register" `
  -Headers $headers `
  -Body $body
```

### 2. Login
```powershell
$headers = @{"Content-Type"="application/json"}
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Method POST `
  -Uri "http://localhost:5000/auth/login" `
  -Headers $headers `
  -Body $body
```

### 3. Get Products
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/products/all"
```

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to database"
```powershell
# Check if Docker is running
docker ps

# Start Docker database
docker-compose -f database/docker-compose.yml up -d

# Check logs
docker logs shortdate-db
```

### ❌ "Port 5000 already in use"
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port in .env
```

### ❌ "Port 5174 already in use"
```powershell
# Frontend will automatically use next available port
# Check terminal output for actual port

# Or kill process
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

### ❌ "Products not loading"
- Check console for errors (F12 in browser)
- Verify backend is running (`http://localhost:5000`)
- Check API endpoint: `http://localhost:5000/api/products/all`
- Check CORS configuration in backend

### ❌ "Login not working"
- Check `.env` file has `JWT_SECRET` set
- Check database connection
- Check backend console for errors

---

## 📱 Browser DevTools

### Open DevTools
- **Windows/Linux**: `F12` or `Ctrl+Shift+I`
- **Mac**: `Cmd+Option+I`

### Useful Tabs for Debugging
- **Console**: JavaScript errors, logs
- **Network**: API requests, status codes
- **Application**: localStorage, tokens
- **Sources**: Debug JavaScript code

---

## 🛠️ Environment Variables

### Backend `.env`
```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shortdate
DB_USER=postgres
DB_PASSWORD=postgres123
NODE_ENV=development
PORT=5000
```

### Check Environment
```powershell
# Backend
cd backend
Get-Content .env

# Frontend (Vite uses .env.local)
cd ..\frontend-new
Get-Content .env.local
```

---

## 📊 Database Reset

### Full Reset (Delete all data)
```powershell
# Stop database
docker-compose -f database/docker-compose.yml down

# Remove volume
docker volume rm shortdate-db-volume

# Restart database (will reinitialize)
docker-compose -f database/docker-compose.yml up -d
```

### Backup Database
```powershell
docker exec shortdate-db pg_dump -U postgres shortdate > backup.sql
```

### Restore Database
```powershell
docker exec -i shortdate-db psql -U postgres shortdate < backup.sql
```

---

## 🚀 Deployment Checklist

- [ ] Update JWT_SECRET in `.env` (production value)
- [ ] Set NODE_ENV=production
- [ ] Update CORS origins for production domain
- [ ] Test all endpoints in production environment
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring/alerts

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `PROGRESS.md` | Project status, what's done/upcoming |
| `API_DOCS.md` | API reference documentation |
| `QUICK_START.md` | This file - quick setup guide |
| `frontend-new/README.md` | Frontend-specific docs |
| `backend/README.md` | Backend-specific docs (if exists) |

---

## 📞 Support

### Common Issues
See "Troubleshooting" section above

### Need Help?
1. Check console errors (F12)
2. Check backend logs
3. Review API_DOCS.md for endpoint details
4. Check PROGRESS.md for known issues

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Docker PostgreSQL running
- [ ] Backend server running on port 5000
- [ ] Frontend Vite running on port 5174
- [ ] Can access http://localhost:5174 in browser
- [ ] Can register new account
- [ ] Can login
- [ ] Products load on home page
- [ ] Header shows user info
- [ ] Profile page accessible for suppliers

---

**Last Updated**: 25/03/2026  
**Next Steps**: Implement Cart & Checkout (Phase 2)
