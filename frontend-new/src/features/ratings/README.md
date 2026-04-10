# Rating Features (Đánh giá sản phẩm)

## 📋 Giới thiệu

Module này cung cấp chức năng đánh giá sản phẩm 5 sao với nhận xét, thống kê, và quản lý feedback.

## 🎯 Components

### 1. **RatingStars**
Hiển thị sao đánh giá (read-only hoặc interactive).

```jsx
import { RatingStars } from '@/features/ratings';

// Read-only
<RatingStars rating={4.5} count={120} size="medium" />

// Interactive
<RatingStars rating={0} size="large" interactive onRate={setRating} />
```

**Props:**
- `rating` (number): Giá trị đánh giá (0-5)
- `count` (number): Số lượng đánh giá
- `size` (string): 'small' | 'medium' | 'large'
- `interactive` (boolean): Cho phép click chọn
- `onRate` (function): Callback khi chọn sao

### 2. **RatingForm**
Form để submit đánh giá mới.

```jsx
import { RatingForm } from '@/features/ratings';

const handleSubmit = async (ratingData) => {
  const response = await ratingAPI.create(ratingData);
  // ratingData = { product_id, order_id?, rating, comment }
};

<RatingForm productId={5} orderId={10} onSubmit={handleSubmit} />
```

**Props:**
- `productId` (number): ID sản phẩm
- `orderId` (number, optional): ID đơn hàng (để verify purchase)
- `onSubmit` (function): Callback khi submit
- `isLoading` (boolean): Loading state

### 3. **RatingsList**
Hiển thị danh sách đánh giá với thống kê.

```jsx
import { RatingsList } from '@/features/ratings';

<RatingsList productId={5} />
```

**Props:**
- `productId` (number): ID sản phẩm
- `isLoading` (boolean): Loading state

## 🪝 Hooks

### **useRating**
Hook để quản lý tất cả logic rating.

```jsx
import { useRating } from '@/features/ratings';

const {
  ratings,
  stats,
  userRating,
  loading,
  error,
  fetchRatings,
  fetchStats,
  fetchUserRating,
  createRating,
  updateRating,
  deleteRating,
  markHelpful
} = useRating(productId);
```

## 📱 Tích hợp vào Product Detail Page

**Ví dụ tích hợp:**

```jsx
import { RatingStars, RatingForm, RatingsList, useRating } from '@/features/ratings';

export const ProductDetailPage = ({ productId }) => {
  const { stats, createRating } = useRating(productId);

  const handleRatingSubmit = async (data) => {
    await createRating(data);
  };

  return (
    <div className="product-detail">
      {/* ... Product Info ... */}
      
      {/* Hiển thị sao tóm tắt */}
      <section className="rating-summary">
        {stats && <RatingStars rating={stats.average_rating} count={stats.total_rating} />}
      </section>

      {/* Form đánh giá */}
      <RatingForm productId={productId} onSubmit={handleRatingSubmit} />

      {/* Danh sách đánh giá */}
      <RatingsList productId={productId} />
    </div>
  );
};
```

## 🔌 API Endpoints

```
POST   /api/ratings                          - Tạo đánh giá
GET    /api/ratings/product/:productId       - Lấy danh sách đánh giá
GET    /api/ratings/stats/:productId         - Lấy thống kê
GET    /api/ratings/my-rating/:productId     - Lấy rating của user
PUT    /api/ratings/:ratingId                - Cập nhật đánh giá
DELETE /api/ratings/:ratingId                - Xóa đánh giá
POST   /api/ratings/:ratingId/helpful        - Đánh dấu hữu ích
```

## 📊 Database Schema

```sql
CREATE TABLE product_ratings (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id),
  buyer_id INT NOT NULL REFERENCES users(id),
  order_id INT REFERENCES orders(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, buyer_id)
);

-- Products table cập nhật thêm:
ALTER TABLE products ADD COLUMN average_rating DECIMAL(3, 2);
ALTER TABLE products ADD COLUMN rating_count INT;
```

## 🎨 Styling

Tất cả components đã có styling CSS mặc định sử dụng:
- Màu chủ đạo: #ffc107 (amber/yellow)
- Responsive design
- Dark mode ready (có thể customize)

## ⚙️ Environment Setup

Đảm bảo trong `.env` của frontend:
```
VITE_API_URL=http://localhost:5000
```

## 🔐 Authentication

- Một số API yêu cầu authentication (create, update, delete)
- Token được gửi trong header: `Authorization: Bearer {token}`
- Token được lấy từ `localStorage.getItem('token')`

---

## 🚀 Tiếp theo

Các bước Optional để nâng cao:

1. **Email notifications** - Gửi email khi có đánh giá mới
2. **Moderation** - Review đánh giá trước khi publish
3. **AI Spam Detection** - Phát hiện & filter spam reviews
4. **Image Upload in Reviews** - Cho phép upload ảnh kèm đánh giá
5. **Review Analytics** - Dashboard phân tích đánh giá

---

Bất kỳ câu hỏi, vui lòng liên hệ team!
