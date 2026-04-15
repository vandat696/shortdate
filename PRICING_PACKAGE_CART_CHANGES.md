# Pricing Package Cart Implementation

## Thay đổi đã thực hiện (2026-04-15)

### 1. Database Schema
- **File**: `database/migration_012_add_package_support_to_cart.sql`
- Thêm cột `package_id` vào bảng `carts`
- Thêm cột `item_type` (product|package) vào bảng `carts`
- Cập nhật UNIQUE constraint để hỗ trợ cả product_id và package_id
- Make `product_id` nullable vì package items không cần nó

### 2. Backend Changes
- **File**: `backend/src/controllers/cartController.js`

#### addToCart():
- Kiểm tra xem `product_id` có phải là pricing package không
- Nếu là package:
  - Luôn sử dụng quantity = 1 (gói là 1 sản phẩm)
  - Lấy `package_price` làm unit_price
  - Lưu vào cart với `item_type = 'package'` và `package_id`
- Nếu là product: giữ logic cũ

#### getCart():
- LEFT JOIN với cả `products` và `pricing_packages`
- Xử lý cả hai loại item khi transform data
- Trả về `item_type` để frontend biết đó là gì

#### mergeCart():
- Xử lý merge cả products và packages
- Packages được force về quantity = 1

#### removeFromCart():
- CHECK xem item có phải package không
- Xóa từ cột `package_id` hoặc `product_id` tương ứng

#### updateCartItem():
- Package items không cho phép thay đổi quantity (luôn = 1)
- Trả về message "Gói giá luôn là 1 sản phẩm"
- Chỉ update quantity cho products

### 3. Frontend Changes
- **File**: `frontend-new/src/hooks/useCart.jsx`
- Updated `addToCart()` để lưu `itemType` vào guestCart
- Khi merge guest cart, `itemType` được truyền vào backend

## Key Features

✅ Khi thêm pricing package vào giỏ → tính là 1 sản phẩm
✅ Giá dùng package_price (giá niêm yết)
✅ Không thể thay đổi quantity của package (luôn = 1)
✅ Hỗ trợ guest cart (localStorage) khi chưa đăng nhập
✅ Merge guest cart khi đăng nhập

## Testing Steps

1. Kiểm tra migrate database: `npm run migrate` in `backend/`
2. Thêm pricing package vào cart (chưa đăng nhập) - CHECK localStorage
3. Thêm pricing package vào cart (đã đăng nhập) - CHECK database
4. Cập nhật quantity của package - phải return 1
5. Xóa package khỏi cart - phải hoạt động
6. Merge guest cart (add package khi chưa login, rồi login) - CHECK merge

## Notes
- PricingPackageProductsPage.jsx không cần thay đổi, đã gọi addToCart đúng rồi
- Backend tự động detect package vs product dựa vào ID
- Giá của package luôn được lấy từ `package_price` Column
