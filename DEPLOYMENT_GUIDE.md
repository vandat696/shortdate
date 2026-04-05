# Hướng Dẫn Deploy ShortDate - Vercel, Render, Aiven

## 📋 Tổng Quan
- **Frontend**: React + Vite → Vercel
- **Backend**: Node.js/Express → Render  
- **Database**: PostgreSQL → Aiven
- **Storage**: File uploads → Render (hoặc Cloudinary)

---

## 🔧 BƯỚC 1: Chuẩn Bị Môi Trường Production

### 1.1 Backend - Tạo file `.env.production`

```
# Database (sẽ từ Aiven)
DATABASE_URL=postgresql://user:password@host:port/database

# Server
PORT=5000
NODE_ENV=production

# CORS (Frontend URL từ Vercel)
FRONTEND_URL=https://your-domain.vercel.app

# JWT
JWT_SECRET=your-secret-key-here

# Email service (nếu có)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 1.2 Frontend - Tạo file `.env.production`

```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 📦 BƯỚC 2: Chuẩn Bị File Upload

Hiện tại backend dùng `express.static` cho file uploads. Có 2 tùy chọn:

### Tùy Chọn A: Upload lên Render (đơn giản, miễn phí)
- File lưu trong `/uploads` folder
- Render sẽ tự xử lý persistence

### Tùy Chọn B: Upload lên Cloudinary (khuyến nghị)
```bash
npm install cloudinary multer-storage-cloudinary
```

---

## 🚀 BƯỚC 3: Deploy Frontend (Vercel)

### 3.1 Chuẩn Bị
```bash
cd frontend-new
npm run build  # Kiểm tra build local
```

### 3.2 Connect Vercel
1. Vào https://vercel.com/login
2. Click "Add New" → "Project"
3. Import repo GitHub hoặc chọn "Other Git Provider"
4. Chọn thư mục: `frontend-new`

### 3.3 Cấu Hình Environment
Trong Vercel Dashboard:
- Settings → Environment Variables
- Thêm: `VITE_API_URL = https://your-backend-url.onrender.com`

### 3.4 Deploy
- Vercel tự động deploy khi push lên main branch
- Hoặc click "Deploy" trực tiếp

---

## 🔌 BƯỚC 4: Deploy Backend (Render)

### 4.1 Chuẩn Bị
Cập nhật file `server.js` - thay đổi CORS:

```javascript
// Thay thế phần CORS cũ bằng:
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

### 4.2 Tạo file `Procfile` (lưu tại `/backend/Procfile`)

```
web: node server.js
```

### 4.3 Connect Render
1. Vào https://render.com
2. Click "New Web Service"
3. Kết nối GitHub repo
4. Cấu hình:
   - **Name**: shortdate-backend
   - **Start Command**: `npm start`
   - **Region**: Chọn gần user

### 4.4 Thêm Environment Variables
Trong Render Dashboard:
- Environment → Add Environment Variables:
  ```
  DATABASE_URL = postgresql://user:pass@host:port/db
  NODE_ENV = production
  PORT = 5000
  FRONTEND_URL = https://your-domain.vercel.app
  JWT_SECRET = your-secret-key
  ```

### 4.5 Deploy
- Render tự động deploy khi push
- Hoặc click "Deploy" trực tiếp

---

## 🗄️ BƯỚC 5: Setup Database (Aiven)

### 5.1 Tạo PostgreSQL Service
1. Vào https://aiven.io
2. Tạo hoặc login vào tài khoản
3. Tạo project mới
4. Click "Create Service" → PostgreSQL
5. Chọn plan (Free hoặc Startup)

### 5.2 Run Migrations
Sau khi database được created:
```bash
# Local terminal
psql postgresql://username:password@host:port/database < database/schema.sql
psql postgresql://username:password@host:port/database < database/migration_002_add_profile_columns.sql
psql postgresql://username:password@host:port/database < database/migration_003_add_delivery_tables.sql
# Chạy tất cả migration files...
```

### 5.3 Lấy Connection String
Từ Aiven Dashboard:
- Service → Connection Information
- Copy PostgreSQL connection string
- Thêm vào Render Environment: `DATABASE_URL`

---

## ✅ BƯỚC 6: Testing & Verification

### 6.1 Test Backend Health Check
```bash
curl https://your-backend-url.onrender.com/api/health
```

### 6.2 Test Frontend
- Mở https://your-domain.vercel.app
- Kiểm tra console T để xem có lỗi CORS không
- Test login, cart, products

### 6.3 Kiểm tra Logs
- **Vercel**: Deployments → Logs
- **Render**: Logs tab (real-time)

---

## 🔒 BƯỚC 7: Optimize & Security

### 7.1 Frontend Optimization
```javascript
// vite.config.js - thêm optimization
export default {
  build: {
    minify: 'terser',
    sourcemap: false,
  }
}
```

### 7.2 Backend Security
```javascript
// server.js - thêm helmet
import helmet from 'helmet';
app.use(helmet());
```

### 7.3 Enable HTTPS
- Vercel: Tự động
- Render: Tự động

---

## 🐛 Troubleshooting Thường Gặp

### Frontend không call được API
- Kiểm tra `VITE_API_URL` trong Vercel
- Kiểm tra CORS origin trong server.js
- Mở DevTools → Network → xem error

### Render qua offline sau 30s
- Free tier Render sẽ tự động stop nếu không có request
- Solution: Upgrade lên $7/month Starter

### Database connection timeout
- Kiểm tra credentials DATABASE_URL
- Enable SSL: thêm `?sslmode=require` vào connection string
- Whitelist Render IP trong Aiven

### File uploads mất sau restart
- Render free tier không persistent storage
- Solution: Dùng Cloudinary hoặc S3

---

## 📝 Checklist Deploy

- [ ] Backend `.env` có tất cả variables
- [ ] Frontend `.env` có API URL
- [ ] CORS domain updated trong server.js
- [ ] Database migrations chạy thành công
- [ ] Procfile được tạo
- [ ] Vercel Environment variables setup
- [ ] Render Environment variables setup
- [ ] Health check endpoint testing
- [ ] Frontend test login & API calls
- [ ] Logs kiểm tra (không có errors)

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Vercel/Render
2. Check DATABASE_URL format
3. Verify CORS origin
4. Test endpoints bằng Postman
