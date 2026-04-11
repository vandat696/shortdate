# 🏷️ Hệ Thống Giảm Giá Tự Động ShortDate

## 📌 Tài Liệu Hướng Dẫn Tiếng Việt

---

## 🎯 Mục Đích

Hệ thống này **tự động giảm giá sản phẩm** khi:
- ⏰ Gần hết hạn sử dụng (HSD)
- 📦 Hàng tồn kho lâu không bán
- 🚨 Rủi ro mất hàng cao

**Lợi ích**:
- Giảm thiểu lãng phí (đặc biệt thực phẩm)
- Tăng doanh thu bằng chiến lược giá thông minh
- Tự động, không cần can thiệp thủ công

---

## 💡 Cách Hoạt Động (Đơn Giản)

### 3 Bước Tính Toán

```
BƯỚC 1: Tính Điểm Rủi Ro (0-100)
   ↓
   Input: Ngày còn lại HSD + Tỷ lệ tồn kho
   Output: Độ rủi ro từ 0-100
   
   VD: Sữa chua HSD còn 1 ngày, tồn 50% → Rủi ro = 85/100

BƯỚC 2: Tính % Giảm Giá dựa vào Rủi Ro
   ↓
   Rủi ro thấp (< 30)      → Giảm 10%
   Rủi ro trung (30-70)    → Giảm 10% → 40%
   Rủi ro cao (> 70)       → Giảm 40% → 80%
   
   VD: Rủi ro 85 → Giảm ~ 55%

BƯỚC 3: Tính Giá Cuối
   ↓
   Giá cuối = Giá gốc × (1 - % giảm)
   Nhưng không bao giờ dưới "giá sàn"
   
   VD: 100.000₫ giảm 55% = 45.000₫
   (nếu giá sàn ≥ 45.000₫ thì giữ giá sàn)
```

---

## 📊 Chi Tiết Từng Bước

### **BƯỚC 1: Tính Điểm Rủi Ro**

Rủi ro = **Điểm thời gian + Điểm tồn kho**

#### 🥒 **Sản Phẩm Khô** (bánh, mỳ, gia vị - bảo quản dài hạn)
```
Điểm thời gian = (1 - ngày còn/90) × 60      // Tối đa 60 điểm
Điểm tồn kho   = tỷ lệ tồn kho × 40         // Tối đa 40 điểm
                                             // Tổng: 0-100
Rủi ro = Điểm thời gian + Điểm tồn kho
```

**Ví dụ**: Bánh mỳ, còn 30 ngày, tồn 50%
```
Điểm thời gian = (1 - 30/90) × 60 = 40
Điểm tồn kho   = 0.5 × 40 = 20
Rủi ro = 40 + 20 = 60/100 (Rủi ro trung bình)
```

#### 🥬 **Sản Phẩm Tươi** (rau, sữa, thịt - bảo quản ngắn hạn)
```
Điểm thời gian = (1 - ngày còn/1) × 70       // Tối đa 70 điểm (nặng hơn!)
Điểm tồn kho   = tỷ lệ tồn kho × 30         // Tối đa 30 điểm
                                             // Tổng: 0-100
Rủi ro = Điểm thời gian + Điểm tồn kho
```

**Ví dụ**: Sữa chua, còn 1 ngày, tồn 50%
```
Điểm thời gian = (1 - 1/1) × 70 = 0 (không đủ 1 ngày)
Điểm tồn kho   = 0.5 × 30 = 15
Rủi ro = 0 + 15 = 15/100 (Rủi ro thấp)

NHƯNG nếu còn 6 giờ (0.25 ngày):
Điểm thời gian = (1 - 0.25/1) × 70 = 52.5
Rủi ro = 52.5 + 15 = 67.5/100 (Rủi ro cao!)
```

**Tại sao khác nhau?**
- Sản phẩm tươi và hỏng nhanh → trọng số thời gian lớn hơn (70 vs 60)
- Sản phẩm khô ứ đọng hơi vấn đề → trọng số tồn kho lớn hơn (40 vs 30)

---

### **BƯỚC 2: Tính % Giảm Giá**

Dùng **bảng rủi ro → giảm giá**:

| Rủi Ro | % Giảm Cơ Bản | Công Thức |
|--------|--------|-----------|
| 0-30 | 10% | 10% (cố định) |
| 30-70 | 10% → 40% | 10% + (rủi ro - 30) × 0.75 |
| 70-100 | 40% → 80% | 40% + (rủi ro - 70) × 1.0 |

**Ví dụ**:
```
Rủi ro = 45 → Giảm = 10 + (45 - 30) × 0.75 = 21.25%
Rủi ro = 75 → Giảm = 40 + (75 - 70) × 1.0 = 45%
Rủi ro = 90 → Giảm = 40 + (90 - 70) × 1.0 = 60%
```

**Quy Tắc Bổ Sung**:

1. **Nếu HSD < 1 ngày** → Giảm TỐI THIỂU 50%
   ```
   Giảm = max(giảm cơ bản, 50%)
   → Buộc phải bán gấp!
   ```

2. **Nếu tồn kho > 80% + đã bảo quản lâu** → Thêm 10%
   ```
   Giảm = giảm cơ bản + 10%
   → Hàng ứ đọng quá lâu
   ```

---

### **BƯỚC 3: Tính Giá Bán Cuối Cùng**

```
Giá bán = Giá gốc × (1 - % giảm)

NHƯNG:
- Không bao giờ bán dưới "giá sàn"
- Làm tròn đến 100 VND (VD: 49.876 → 49.900)
```

**Ví dụ Đầy Đủ**:

```
Giá gốc: 100.000₫
% Giảm: 35%
Giá sàn: 50.000₫

Giá bán = 100.000 × (1 - 0.35) = 65.000₫
Kiểm tra: 65.000 ≥ 50.000 ✓
Kết quả: 65.000₫

---

Giá gốc: 80.000₫
% Giảm: 65%
Giá sàn: 45.000₫

Giá bán = 80.000 × (1 - 0.65) = 28.000₫
Kiểm tra: 28.000 < 45.000 ✗
Kết quả: 45.000₫ (dùng giá sàn)
```

---

## 🔄 Sơ Đồ Luồng Hoàn Chỉnh

```
┌─ ĐọC THÔNG TIN SẢN PHẨM
│  - Giá gốc, giá hiện tại
│  - HSD, ngày bảo quản
│  - Tồn kho, loại sản phẩm
│
├─ TÍNH RỦI RO
│  if loại = "tươi":
│      rủi ro = (1 - ngày/1) × 70 + tỷ lệ × 30
│  else (khô):
│      rủi ro = (1 - ngày/90) × 60 + tỷ lệ × 40
│
├─ TÍNH % GIẢM
│  if rủi ro ≥ 70:
│      giảm = 40 + (rủi ro - 70) × 1
│  elif rủi ro ≥ 30:
│      giảm = 10 + (rủi ro - 30) × 0.75
│  else:
│      giảm = 10
│
│  if ngày HSD < 1: giảm = max(giảm, 50)
│  if tồn > 80%: giảm += 10
│
├─ TÍNH GIÁ CUỐI
│  giá cuối = giá gốc × (1 - giảm)
│  nếu giá cuối < giá sàn: dùng giá sàn
│
├─ SO SÁNH & CẬP NHẬT
│  if giá cuối ≠ giá hiện tại:
│      cập nhật DB
│      lưu vào lịch sử
│      ghi lý do thay đổi
│
└─ TRẢ VỀ KẾT QUẢ
   - Giá cũ, giá mới
   - % Giảm, rủi ro
   - Lý do thay đổi
```

---

## 📋 Lý Do Giảm Giá (Ví Dụ)

Hệ thống tự động ghi chú từng lần giảm:

```
✅ "HSD < 1 ngày" 
   → Sắp hết hạn, PHẢI bán

✅ "HSD sắp hết; Rủi ro cao"
   → Kết hợp nhiều yếu tố cùng lúc

✅ "Tồn kho cao"
   → Hàng ứ đọng quá lâu, bán không ra

✅ "Rủi ro cao"
   → Tổng hợp thời gian + tồn kho
```

---

## 🎯 Ví Dụ Thực Tế

### ❌ Tình Huống 1: Bánh Mỳ (Khô, 30 ngày, tồn 50%)

```
TÍNH RỦI RO:
  Điểm thời gian = (1 - 30/90) × 60 = 40
  Điểm tồn kho   = 0.5 × 40 = 20
  Rủi ro = 60 (trung bình)

TÍNH GIẢM:
  60 nằm trong 30-70 range
  Giãm = 10 + (60 - 30) × 0.75 = 32.5%

GIÁ CUỐI:
  100.000 × (1 - 0.325) = 67.500₫
  
KÍCH QUA GIẢM: 32,5%
```

### 🟡 Tình Huống 2: Sữa Tươi (Tươi, 2 ngày, tồn 80%)

```
TÍNH RỦI RO:
  Điểm thời gian = (1 - 2/1) × 70 = 0 (capped)
  → Thực tế để 2 ngày, tính là (1 - 2/7) × 70 ≈ 40
  Điểm tồn kho   = 0.8 × 30 = 24
  Rủi ro ≈ 64

TÍNH GIẢM:
  64 nằm trong 30-70 range
  Giảm = 10 + (64 - 30) × 0.75 = 35.5%
  Thêm quy tắc tồn kho cao: +10%
  Giảm = 45.5%

GIÁ CUỐI:
  150.000 × (1 - 0.455) = 82.250 → 82.200₫
  
KÍCH QUA GIẢM: 45,5%
```

### 🔴 Tình Huống 3: Sữa Chua (Tươi, 6 giờ, tồn 60%)

```
TÍNH RỦI RO:
  Ngày còn = 0.25 (6 giờ = 1/4 ngày)
  Điểm thời gian = (1 - 0.25/1) × 70 = 52.5
  Điểm tồn kho   = 0.6 × 30 = 18
  Rủi ro = 70.5 (CAO)

TÍNH GIẢM:
  70.5 ≥ 70 range
  Giảm = 40 + (70.5 - 70) × 1 = 40.5%
  Kiểm tra HSD < 1 ngày: max(40.5%, 50%) = 50%
  
GIÁ CUỐI:
  120.000 × (1 - 0.50) = 60.000₫
  Kiểm tra giá sàn: 60.000 ≥ 40.000 ✓
  
KÍCH QUA GIẢM: 50%
LÝ DO: "HSD < 1 ngày; Rủi ro cao"
```

---

## 🛠️ Cách Chạy Hệ Thống

### 1️⃣ Tự Động (Theo Lịch)

```
Mỗi 1 giờ, hệ thống tự động:
  - Lấy TẤT CẢ sản phẩm có "auto_pricing = bật"
  - Tính lại rủi ro + giảm giá
  - Nếu giá thay đổi → Cập nhật DB + Ghi vào lịch sử
```

### 2️⃣ Thủ Công (API)

```bash
# Tính giá (không cập nhật)
POST /api/pricing/calculate-price
Body: { productId: 7 }

# Áp dụng giá (tính + cập nhật)
POST /api/pricing/apply-pricing
Body: { productId: 7 }

# Áp dụng hàng loạt
POST /api/pricing/apply-pricing-bulk
Body: { productIds: [7, 15, 23] }
```

### 3️⃣ Xem Lịch Sử

```bash
GET /api/pricing/price-history/7?limit=30

Response:
{
  history: [
    {
      oldPrice: 100.000,
      newPrice: 67.500,
      discount: 32.5,
      riskScore: 60,
      reason: "Auto-pricing update",
      createdAt: "2026-04-11T10:00:00Z"
    },
    ...
  ]
}
```

---

## ⚙️ Cấu Hình

### Bảo Quản Tối Đa

```
Sản phẩm tươi: 1 ngày
Sản phẩm khô: 90 ngày
```

### Giảm Tối Thiểu

```
HSD < 1 ngày → Giảm tối thiểu 50%
Goal: BÁN GẤP, tránh lãng phí
```

### Giảm Tối Đa

```
Rủi ro 100 → Giảm tối đa 80%
Goal: Không bán quá rẻ, vẫn kiếm doanh thu
```

---

## 📈 Khi Nào Giảm Giá?

| Tình Huống | Hành Động |
|-----------|----------|
| 📅 HSD còn 30+ ngày, tồn 30% | Không giảm (rủi ro < 30) |
| 📅 HSD còn 15 ngày, tồn 50% | Giảm ~20% (rủi ro trung bình) |
| 📅 HSD còn 3 ngày, tồn 80% | Giảm ~35% (hàng ứ đọng) |
| 📅 HSD còn 12 giờ, tồn 60% | Giảm 50%+ (BỨC TÁCH HỎI!) |
| 📅 HSD <= 1 ngày | Giảm TỐI THIỂU 50% |

---

## 🎁 Lợi Ích

✅ **Tăng Doanh Thu**: Giảm giá thông minh thay vì bán sầu dầu  
✅ **Giảm Lãng Phí**: Bán được hàng sắp hết hạn  
✅ **Tiết Kiệm Kho**: Không tồn hàng dài hạn  
✅ **Tự Động**: Không cần can thiệp thủ công  
✅ **Công Bằng**: Quy tắc rõ ràng, không tùy tiện  

---

## 📝 Tóm Tắt Công Thức

```
RỦI RO = f(thời gian, tồn kho, loại)
GIẢM GIÁ = f(rủi ro, + quy tắc đặc biệt)
GIÁ CUỐI = Giá gốc × (1 - GIẢM GIÁ)
          nhưng không bao giờ < giá sàn
```

---

**Version**: 1.0 - Tiếng Việt  
**Cập Nhật**: 11/04/2026  
**Dễ Hiểu**: ✅ Ngắn gọn nhưng đủ hiểu
