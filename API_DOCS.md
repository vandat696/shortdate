# ShortDate API Documentation

**Version**: 1.0  
**Status**: Production Ready (Phase 1)

---

## 📋 Base URL

```
http://localhost:5000
```

## 🔐 Authentication

### JWT Token Format
```javascript
{
  userId: "user_uuid",
  email: "user@example.com",
  userType: "customer" | "supplier",
  iat: 1234567890,
  exp: 1234567890 + 7*24*60*60  // 7 days
}
```

### Header Required
```
Authorization: Bearer <token>
```

---

## 🔑 Auth Endpoints

### 1. Register User
```
POST /auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "phone": "0123456789",
  "userType": "customer"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "userType": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2. Login
```
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "userType": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error** (401):
```json
{
  "error": "Invalid email or password",
  "message": "Login failed"
}
```

---

### 3. Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
```

**Request Body** (all optional):
```json
{
  "name": "John Doe",
  "phone": "0123456789",
  "avatar_url": "https://...",
  "company_name": "My Shop",
  "tax_id": "123456789",
  "shop_address": "123 Main St",
  "banner_url": "https://...",
  "description": "Shop description"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user data */ }
}
```

---

### 4. Get Profile
```
GET /auth/profile
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "0123456789",
  "avatar_url": "https://...",
  "userType": "supplier",
  "supplierDetails": {
    "company_name": "My Shop",
    "tax_id": "123456789",
    "shop_address": "123 Main St",
    "banner_url": "https://...",
    "description": "Shop description"
  }
}
```

---

## 📦 Product Endpoints

### 1. Get All Products
```
GET /api/products/all
```

**Query Parameters** (optional):
```
?category=dry_product
?minPrice=1000&maxPrice=50000
?search=rice
?limit=10&offset=0
```

**Response** (200):
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Premium Rice",
      "price": 25000,
      "category": "dry_product",
      "stock_quantity": 100,
      "hsd": "2026-06-25",
      "image_url": "https://...",
      "supplier": {
        "userId": "supplier-uuid",
        "company_name": "Thai Rice Co."
      }
    }
  ],
  "total": 45
}
```

---

### 2. Get Product by ID
```
GET /api/products/:id
```

**Response** (200):
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Premium Rice",
    "description": "High quality Thai rice",
    "price": 25000,
    "category": "dry_product",
    "stock_quantity": 100,
    "hsd": "2026-06-25",
    "image_url": "https://...",
    "created_at": "2026-03-20",
    "priceHistory": [
      { "date": "2026-03-20", "price": 25000 },
      { "date": "2026-03-15", "price": 26000 }
    ]
  }
}
```

---

### 3. Add Product (Supplier Only)
```
POST /api/products
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Premium Rice",
  "description": "High quality Thai rice",
  "price": 25000,
  "category_id": "dry_product",
  "stock_quantity": 100,
  "hsd": "2026-06-25",
  "image_url": "https://..."
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": { /* product data */ }
}
```

**Error** (403):
```json
{
  "error": "Unauthorized",
  "message": "Only suppliers can add products"
}
```

---

### 4. Update Product (Supplier Only)
```
PUT /api/products/:id
Authorization: Bearer <token>
```

**Request Body** (all optional):
```json
{
  "name": "Premium Rice",
  "price": 24000,
  "stock_quantity": 90,
  "hsd": "2026-07-10"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { /* updated product */ }
}
```

---

### 5. Delete Product (Supplier Only)
```
DELETE /api/products/:id
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🛒 Future Endpoints (Phase 2)

### Cart Endpoints
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get user's cart
- `PUT /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove from cart

### Order Endpoints
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Product not found"
}
```

### 500 Server Error
```json
{
  "error": "Server error",
  "message": "Internal server error"
}
```

---

## 🧪 Test with cURL

### Register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","phone":"0123456789","userType":"customer"}'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products/all
```

### Get Profile (with token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/auth/profile
```

---

## 📊 Database Schema Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | userId, email, password_hash, phone, user_type |
| `supplier_details` | Supplier info | userId, company_name, tax_id, shop_address |
| `products` | Product listing | id, name, price, stock_quantity, hsd, category |
| `categories` | Product categories | id, name (dry_product, fresh_product) |
| `price_history` | Price tracking | product_id, price, date |
| `carts` | Shopping carts | id, user_id, created_at |
| `orders` | Orders | id, user_id, total_price, status, created_at |
| `order_items` | Order items | id, order_id, product_id, quantity, price |
| `reviews` | Product reviews | id, product_id, user_id, rating, comment |
| `notifications` | Notifications | id, user_id, message, type, created_at |

---

**Last Updated**: 25/03/2026  
**Maintained by**: ShortDate Dev Team
