# ShortDate API Documentation

**Version**: 1.0  
**Status**: Production Ready (Phase 1)  
**Last Updated**: 01/04/2026

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
  "message": "Profile updated successfully"
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
  "success": true,
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "0123456789",
    "userType": "supplier"
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
?category=dry_product&minPrice=1000&maxPrice=50000&search=rice&limit=10&offset=0
```

**Response** (200):
```json
{
  "success": true,
  "products": [{
    "id": "uuid",
    "name": "Premium Rice",
    "price": 25000,
    "category": "dry_product",
    "stock_quantity": 100,
    "hsd": "2026-06-25"
  }],
  "total": 45
}
```

---

### 2. Get Product Details
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
    "description": "High quality rice",
    "price": 25000,
    "stock_quantity": 100,
    "hsd": "2026-06-25"
  }
}
```

---

### 3. Get Categories
```
GET /api/products/categories
```

**Response** (200):
```json
{
  "success": true,
  "categories": [
    {"id": "uuid", "name": "dry_product"},
    {"id": "uuid", "name": "fresh_product"}
  ]
}
```

---

### 4. Create Product (Supplier)
```
POST /api/products
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Premium Rice",
  "description": "High quality rice",
  "price": 25000,
  "category_id": "uuid",
  "stock_quantity": 100,
  "hsd": "2026-06-25"
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

---

### 5. Update Product
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
  "message": "Product updated successfully"
}
```

---

### 6. Update Inventory
```
PATCH /api/products/:id/inventory
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "stock_quantity": 85
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Inventory updated"
}
```

---

### 7. Delete Product
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

### 8. Get Supplier Products
```
GET /api/products/supplier/list
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "products": [ /* supplier's products */ ]
}
```

---

### 9. Get Expiring Products
```
GET /api/products/supplier/alerts/expiring
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "products": [{
    "id": "uuid",
    "name": "Expiring Rice",
    "hsd": "2026-04-05",
    "days_until_expiry": 4
  }]
}
```

---

### 10. Get Low Stock Products
```
GET /api/products/supplier/alerts/low-stock
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "products": [{
    "id": "uuid",
    "name": "Rice",
    "stock_quantity": 5,
    "min_stock": 10
  }]
}
```

---

## 🛒 Cart Endpoints

### 1. Get Cart
```
GET /api/cart
Authorization: Optional
```

**Response** (200):
```json
{
  "success": true,
  "cart": {
    "items": [{
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 25000,
      "subtotal": 50000
    }],
    "total": 50000
  }
}
```

---

### 2. Add to Cart
```
POST /api/cart/items
Authorization: Optional
```

**Request Body**:
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Product added to cart"
}
```

---

### 3. Update Cart Item
```
PATCH /api/cart/items/:product_id
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "quantity": 5
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Cart item updated"
}
```

---

### 4. Remove from Cart
```
DELETE /api/cart/items/:product_id
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 5. Clear Cart
```
DELETE /api/cart/clear
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

### 6. Merge Cart
```
POST /api/cart/merge
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "items": [{
    "product_id": "uuid",
    "quantity": 2,
    "unit_price": 25000
  }]
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Cart merged successfully"
}
```

---

## ❤️ Wishlist Endpoints

### 1. Get Wishlist
```
GET /api/wishlist
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "wishlist": [{
    "product_id": "uuid",
    "product_name": "Premium Rice",
    "price": 25000
  }]
}
```

---

### 2. Add to Wishlist
```
POST /api/products/:productId/wishlist
Authorization: Bearer <token>
```

**Response** (201):
```json
{
  "success": true,
  "message": "Product added to wishlist"
}
```

---

### 3. Remove from Wishlist
```
DELETE /api/products/:productId/wishlist
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

---

### 4. Check Wishlist
```
GET /api/products/:productId/wishlist/check
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "inWishlist": true
}
```

---

## 📦 Order Endpoints

### 1. Create Order
```
POST /api/orders
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "shippingAddress": "123 Main St",
  "paymentMethod": "cod"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Order created successfully",
  "orderId": "uuid"
}
```

---

### 2. Get My Orders
```
GET /api/orders
Authorization: Bearer <token>
```

**Query Parameters** (optional):
```
?status=pending&limit=10&offset=0
```

**Response** (200):
```json
{
  "success": true,
  "orders": [{
    "orderId": "uuid",
    "status": "pending",
    "total_amount": 50000,
    "created_at": "2026-04-01T10:00:00Z"
  }],
  "total": 5
}
```

---

### 3. Get Order Details
```
GET /api/orders/:orderId
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "order": {
    "orderId": "uuid",
    "status": "pending",
    "items": [{
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 25000
    }],
    "total_amount": 50000,
    "shipping_address": "123 Main St",
    "created_at": "2026-04-01T10:00:00Z"
  }
}
```

---

### 4. Cancel Order
```
POST /api/orders/:orderId/cancel
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## 📍 Address Endpoints

### 1. Get Delivery Methods
```
GET /api/addresses/methods/all
```

**Response** (200):
```json
{
  "success": true,
  "deliveryMethods": [{
    "id": "uuid",
    "name": "Same Day Delivery",
    "fee": 25000
  }]
}
```

---

### 2. Get Addresses
```
GET /api/addresses
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "addresses": [{
    "id": "uuid",
    "address": "123 Main St",
    "phone": "0123456789",
    "is_default": true
  }]
}
```

---

### 3. Get Default Address
```
GET /api/addresses/default
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "address": {
    "id": "uuid",
    "address": "123 Main St",
    "phone": "0123456789",
    "is_default": true
  }
}
```

---

### 4. Create Address
```
POST /api/addresses
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "address": "123 Main St",
  "phone": "0123456789",
  "is_default": false
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Address created successfully"
}
```

---

### 5. Update Address
```
PUT /api/addresses/:id
Authorization: Bearer <token>
```

**Request Body** (all optional):
```json
{
  "address": "456 New St",
  "phone": "0987654321"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Address updated successfully"
}
```

---

### 6. Delete Address
```
DELETE /api/addresses/:id
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### 7. Set Default Address
```
PATCH /api/addresses/:id/default
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Default address updated"
}
```

---

## 💰 Pricing Endpoints

### 1. Get Current Price
```
GET /pricing/:productId/current
```

**Response** (200):
```json
{
  "success": true,
  "price": {
    "product_id": "uuid",
    "current_price": 25000,
    "original_price": 35000,
    "discount_percent": 28
  }
}
```

---

### 2. Get Price History
```
GET /pricing/:productId/history
```

**Query Parameters** (optional):
```
?limit=50&offset=0
```

**Response** (200):
```json
{
  "success": true,
  "history": [{
    "product_id": "uuid",
    "price": 25000,
    "changed_at": "2026-04-01T10:00:00Z"
  }],
  "total": 12
}
```

---

### 3. Get Current Price + History
```
GET /pricing/:productId/with-history
```

**Response** (200):
```json
{
  "success": true,
  "currentPrice": { /* current price */ },
  "history": [ /* price history */ ]
}
```

---

### 4. Update Pricing Config
```
PUT /pricing/:productId/config
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "autoPricingEnabled": true,
  "floorPrice": 15000
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Pricing config updated"
}
```

---

### 5. Apply Pricing Engine
```
POST /pricing/:productId/apply-engine
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Pricing engine applied",
  "newPrice": 20000
}
```

---

### 6. Run All Pricing Engines
```
POST /pricing/run-all-engines
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "All pricing engines executed",
  "updated_products": 45
}
```

---

## 📷 Image Endpoints

### 1. Upload Product Images
```
POST /api/images/:productId/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request**:
- Field: `images` (multiple files, max 4)
- Supported: JPG, PNG, WebP
- Max size: 5MB per file

**Response** (201):
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "images": [{
    "id": "uuid",
    "product_id": "uuid",
    "url": "/uploads/products/image-..."
  }]
}
```

---

### 2. Get Product Images
```
GET /api/images/:productId
```

**Response** (200):
```json
{
  "success": true,
  "images": [{
    "id": "uuid",
    "product_id": "uuid",
    "url": "/uploads/products/image-..."
  }]
}
```

---

## ⚠️ Error Responses

### Standard Format
```
Status: 400/401/403/404/500
```

**Response**:
```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable error message"
}
```

---

**Last Updated**: 01/04/2026  
**Maintained by**: ShortDate Dev Team

