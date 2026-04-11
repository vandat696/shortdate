# 🏷️ ShortDate Auto-Pricing System Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Algorithm Explanation](#algorithm-explanation)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Configuration & Settings](#configuration--settings)
- [Implementation Guide](#implementation-guide)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
**ShortDate Auto-Pricing System** automatically adjusts product prices based on:
- **Time to expiration** (days remaining until HSD)
- **Inventory status** (stock ratio and storage duration)
- **Product type** (dry vs. fresh with different risk profiles)

### Goals
✅ Minimize waste by selling near-expiration products at reasonable discounts  
✅ Optimize revenue using intelligent pricing algorithms  
✅ Reduce inventory holding costs for slow-moving items  
✅ Prevent spoilage loss through aggressive discounting when needed  

### Key Features
- 🎯 **Risk-based pricing**: Higher risk = deeper discounts
- 📊 **Type-aware calculation**: Different formulas for dry vs. fresh products
- 🔒 **Floor price protection**: Never sell below minimum threshold
- 🔄 **Automatic updates**: Recalculate prices periodically or on-demand
- 📝 **Audit trail**: Track all price changes with detailed reasons

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Product Detail Page (ProductDetailPage.jsx)          │   │
│  │ - Display original + current price                   │   │
│  │ - Show price history chart (Recharts)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │ API Calls
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Express.js + PostgreSQL)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pricing Routes (/api/pricing)                        │   │
│  │ - GET /price-history/{productId}                     │   │
│  │ - POST /calculate-price                              │   │
│  │ - POST /apply-pricing                                │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │ Pricing Controller (pricingController.js)            │   │
│  │ - Orchestrate pricing calculations                   │   │
│  │ - Validate inputs                                    │   │
│  │ - Handle errors                                      │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │ Pricing Engine (engine.js)                           │   │
│  │ - calculateRiskScore()                               │   │
│  │ - calculateDiscount()                                │   │
│  │ - calculateFinalPrice()                              │   │
│  │ - runPricingEngine()                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │ Database Layer (PostgreSQL)                          │   │
│  │ - products table (prices, expiry date, stock)        │   │
│  │ - pricing_history table (audit trail)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. FETCH PRODUCT
   └─→ GET product details from DB
       - original_price, current_price
       - expiry_date, stock_quantity
       - type (dry/fresh)

2. CALCULATE RISK SCORE
   └─→ Input: daysLeft, stockRatio, productType
       Output: riskScore (0-100)

3. CALCULATE DISCOUNT
   └─→ Input: riskScore, daysLeft, stockRatio, daysInStock
       Output: discount% (0-100)

4. CALCULATE FINAL PRICE
   └─→ Input: originalPrice, discount%, floorPrice
       Output: finalPrice (rounded to 100 VND)

5. UPDATE PRODUCT & LOG
   └─→ Update DB: current_price, last_price_update
       Insert pricing_history: old+new price, reason

6. RETURN RESPONSE
   └─→ newPrice, oldPrice, discount%, riskScore, reason
```

---

## Algorithm Explanation

### The 3-Step Calculation Process

#### Step 1️⃣: Calculate Risk Score (0-100)

**Purpose**: Quantify how risky it is to keep the product unsold

**Input Parameters**:
- `daysLeft`: Days remaining until expiry (≥ 0)
- `stockRatio`: Current stock / Initial stock (0-1)
- `productType`: "dry" or "fresh"

**Dry Products** (bánh, mỳ, gia vị - shelf life: 30-90 days)
```
timeScore = max(0, 1 - daysLeft/90) × 60      // max 60 from time
stockScore = stockRatio × 40                   // max 40 from inventory
riskScore = timeScore + stockScore             // 0-100 total
```

**Fresh Products** (rau, sữa, thịt - shelf life: 0-1 day)
```
timeScore = max(0, 1 - daysLeft/1) × 70       // max 70 from time (more weight)
stockScore = stockRatio × 30                   // max 30 from inventory
riskScore = timeScore + stockScore             // 0-100 total
```

**Why Different Weights?**
- Fresh products expire much faster → time component is heavier (70 vs 60)
- Dry products can absorb overstocking → stock component is heavier (40 vs 30)

**Example Calculation**:
```
Product: Fresh milk, 1 day left, 50% stock remaining

timeScore = (1 - 1/1) × 70 = 0           (CRITICAL: 0 days left)
stockScore = 0.5 × 30 = 15
riskScore = 0 + 15 = 15                  (LOW RISK at this moment)

BUT if 0.5 hours left:
timeScore = (1 - 0.02/1) × 70 = 68.6     (VERY HIGH)
riskScore ≈ 84                            (CRITICAL RISK)
```

---

#### Step 2️⃣: Calculate Discount Percentage (0-100%)

**Purpose**: Convert risk score into discount percentage

**Primary Rule (based on riskScore)**:

| Risk Score Range | Base Discount | Formula |
|---|---|---|
| 0-30 | 10% | 10% (flat) |
| 30-70 | 10% + dynamic | 10% + (riskScore - 30) × 0.75 |
| 70-100 | 40% + aggressive | 40% + (riskScore - 70) × 1.0 |

**Secondary Rules (overrides)**:

1. **HSD < 1 day**:
   ```
   if daysLeft < 1:
       discount = max(discount, 50%)  // Force at least 50% off
   ```

2. **Overstocking + Old Inventory**:
   ```
   if stockRatio > 80% AND daysInStock > threshold:
       discount = min(100%, discount + 10%)  // Add 10% more
       threshold = 45 days (dry) or 0.5 days (fresh)
   ```

**Example Discount Calculations**:

**Scenario A**: Food court with moderate risk
```
riskScore = 45 (medium risk)
discount = 10 + (45 - 30) × 0.75 = 21.25%
```

**Scenario B**: Vegetables almost expired
```
riskScore = 80 (high risk)
daysLeft = 0.5 days
discount = 40 + (80 - 70) × 1.0 = 50%
Apply HSD override: max(50%, 50%) = 50%
Final discount = 50%
```

**Scenario C**: Bread unsold for 2 months
```
riskScore = 35
stockRatio = 90%
daysInStock = 60 days
discount = 10 + (35 - 30) × 0.75 = 13.75%
Apply overstocking: min(100%, 13.75% + 10%) = 23.75%
Final discount = 23.75%
```

---

#### Step 3️⃣: Calculate Final Price

**Purpose**: Convert discount into actual selling price

**Formula**:
```javascript
discountAmount = originalPrice × (discount / 100)
priceBeforeFloor = originalPrice - discountAmount
finalPrice = max(priceBeforeFloor, floorPrice)  // Enforce minimum
finalPrice = floor(finalPrice / 100) × 100      // Round down to 100 VND
```

**Why Round Down to 100 VND?**
- Price psychology: 49,900₫ looks better than 49,876₫
- Prevents decimal/fraction issues
- Simpler for customers

**Example**:
```
Original Price: 150,000₫
Discount: 35%
Floor Price: 80,000₫

discountAmount = 150,000 × 0.35 = 52,500₫
priceBeforeFloor = 150,000 - 52,500 = 97,500₫
enforced = max(97,500, 80,000) = 97,500₫
final = floor(97,500 / 100) × 100 = 97,500₫
Result: 97,500₫ ✓
```

---

### Complete Algorithm Flow Diagram

```
START
  │
  ├─→ Read Product Data
  │    - original_price, current_price
  │    - expiry_date, listed_date
  │    - stock_quantity, initial_stock
  │    - type (dry/fresh)
  │
  ├─→ Calculate Input Variables
  │    - daysLeft = ceil((expiry_date - today) / 86400000)
  │    - stockRatio = stock_quantity / initial_stock
  │    - daysInStock = ceil((today - listed_date) / 86400000)
  │
  ├─→ Normalize Product Type
  │    - Standardize: "dry" or "fresh"
  │
  ├─→ RISK SCORE Calculation
  │    if type == "dry":
  │        timeScore = max(0, 1 - daysLeft/90) × 60
  │        stockScore = stockRatio × 40
  │    else: // fresh
  │        timeScore = max(0, 1 - daysLeft/1) × 70
  │        stockScore = stockRatio × 30
  │    riskScore = timeScore + stockScore
  │
  ├─→ DISCOUNT Calculation
  │    if riskScore >= 70:
  │        discount = 40 + (riskScore - 70)
  │    elif riskScore >= 30:
  │        discount = 10 + (riskScore - 30) × 0.75
  │    else:
  │        discount = 10
  │    
  │    if daysLeft < 1: discount = max(discount, 50)
  │    if stockRatio > 80 AND daysInStock > threshold: discount += 10
  │
  ├─→ FINAL PRICE Calculation
  │    discountAmount = originalPrice × (discount / 100)
  │    priceBeforeFloor = originalPrice - discountAmount
  │    finalPrice = max(priceBeforeFloor, floorPrice)
  │    finalPrice = floor(finalPrice / 100) × 100
  │
  ├─→ Generate Reason String
  │    Collect all applicable reasons:
  │    - "HSD < 1 ngày"
  │    - "HSD sắp hết"
  │    - "Tồn kho cao"
  │    - "Rủi ro cao"
  │
  ├─→ Compare & Update
  │    if finalPrice != current_price:
  │        UPDATE products SET current_price = finalPrice
  │        INSERT pricing_history (old_price, new_price, reason, timestamp)
  │        return { changed: true, ... }
  │    else:
  │        return { changed: false, ... }
  │
  └─→ END
```

---

## Database Schema

### Products Table (Existing Columns)
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  type VARCHAR(50),  -- 'dry' or 'fresh'
  
  -- Pricing
  original_price DECIMAL(12, 2),
  current_price DECIMAL(12, 2),
  floor_price DECIMAL(12, 2),  -- Minimum selling price
  
  -- Inventory
  stock_quantity INT,
  initial_stock_quantity INT,
  
  -- Expiration & Dates
  expiry_date TIMESTAMP,
  listed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Auto-Pricing Control
  auto_pricing_enabled BOOLEAN DEFAULT FALSE,
  last_price_update TIMESTAMP,
  
  ...other columns...
);
```

### Pricing History Table (Audit Trail)
```sql
CREATE TABLE pricing_history (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Price Information
  old_price DECIMAL(12, 2),
  new_price DECIMAL(12, 2),
  discount_percent DECIMAL(5, 2),
  
  -- Risk & Calculation Data
  risk_score DECIMAL(5, 2),
  days_left INT,
  stock_ratio DECIMAL(5, 2),
  
  -- Metadata
  reason VARCHAR(500),  -- Why price changed
  updated_by VARCHAR(100),  -- System or user
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_product_id ON pricing_history(product_id);
CREATE INDEX idx_created_at ON pricing_history(created_at);
```

---

## API Endpoints

### 1. Get Price History for a Product

**Endpoint**: `GET /api/pricing/price-history/:productId`

**Query Parameters**:
```
- limit: number (default: 30)   // Records to return
- offset: number (default: 0)   // Pagination offset
- sortBy: string (default: 'newest')  // 'newest' or 'oldest'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "productId": 7,
    "productName": "Fresh Milk",
    "history": [
      {
        "id": 142,
        "oldPrice": 50000,
        "newPrice": 35000,
        "discountPercent": 30,
        "riskScore": 75,
        "daysLeft": 2,
        "reason": "HSD sắp hết; Rủi ro cao",
        "createdAt": "2026-04-10T14:30:00Z"
      },
      ...more entries...
    ],
    "pagination": {
      "total": 245,
      "limit": 30,
      "offset": 0,
      "pages": 9
    }
  }
}
```

---

### 2. Calculate Price (Without Updating)

**Endpoint**: `POST /api/pricing/calculate-price`

**Request Body**:
```json
{
  "productId": 7,
  "originalPrice": 50000,
  "currentPrice": 50000,
  "type": "fresh",
  "expiryDate": "2026-04-12T00:00:00Z",
  "listedAt": "2026-03-15T08:00:00Z",
  "stockQuantity": 15,
  "initialStockQuantity": 20,
  "floorPrice": 25000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "newPrice": 35000,
    "oldPrice": 50000,
    "discount": 30,
    "riskScore": 75,
    "priceChanged": true,
    "reason": "HSD sắp hết; Rủi ko cao",
    "calculation": {
      "daysLeft": 2,
      "stockRatio": 0.75,
      "daysInStock": 26,
      "timeScore": 68,
      "stockScore": 22.5,
      "totalRiskScore": 90.5
    }
  }
}
```

---

### 3. Apply Pricing (Calculate + Update)

**Endpoint**: `POST /api/pricing/apply-pricing`

**Request Body**:
```json
{
  "productId": 7
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "productId": 7,
    "priceUpdated": true,
    "oldPrice": 50000,
    "newPrice": 35000,
    "discount": 30,
    "reason": "HSD sắp hết; Rủi ro cao",
    "updatedAt": "2026-04-10T14:30:00Z"
  }
}
```

**Error Response** (e.g., when auto-pricing disabled):
```json
{
  "success": false,
  "message": "Auto-pricing is disabled for this product",
  "code": "PRICING_DISABLED"
}
```

---

### 4. Bulk Apply Pricing

**Endpoint**: `POST /api/pricing/apply-pricing-bulk`

**Request Body**:
```json
{
  "productIds": [7, 15, 23, 45],
  "force": false  // If true, apply even if prices unchanged
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "processed": 4,
    "updated": 3,
    "unchanged": 1,
    "results": [
      {
        "productId": 7,
        "updated": true,
        "oldPrice": 50000,
        "newPrice": 35000,
        "discount": 30
      },
      ...
    ],
    "timestamp": "2026-04-10T14:30:00Z"
  }
}
```

---

## Configuration & Settings

### Environment Variables

**Backend** (`.env` file):
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shortdate

# Auto-Pricing
AUTO_PRICING_ENABLED=true
PRICING_UPDATE_INTERVAL=3600000  # 1 hour in milliseconds
ENABLE_FLOOR_PRICE=true
DEFAULT_FLOOR_PRICE_RATIO=0.5    # 50% of original price

# Pricing Thresholds
FRESH_MAX_SHELF_LIFE=1            # Days
DRY_MAX_SHELF_LIFE=90             # Days
CRITICAL_DISCOUNT_THRESHOLD=50    # Discount % when HSD < 1 day
```

### Product Configuration

**Per-Product Settings** (in DB):
```sql
-- Enable/disable auto-pricing for specific product
UPDATE products 
SET auto_pricing_enabled = true 
WHERE id = 7;

-- Set custom floor price
UPDATE products 
SET floor_price = 30000 
WHERE id = 7;

-- Set product type
UPDATE products 
SET type = 'fresh' 
WHERE id = 7;
```

---

## Implementation Guide

### Backend Setup

#### 1. Install Engine Module
```javascript
// backend/src/modules/pricing/engine.js
export function calculateRiskScore(daysLeft, stockRatio, productType) { ... }
export function calculateDiscount(riskScore, daysLeft, stockRatio, daysInStock) { ... }
export function calculateFinalPrice(originalPrice, discount, floorPrice) { ... }
export function runPricingEngine(product) { ... }
```

#### 2. Create Pricing Routes
```javascript
// backend/src/routes/pricing.js
router.get('/price-history/:productId', getPriceHistory);
router.post('/calculate-price', calculatePrice);
router.post('/apply-pricing', applyPricing);
router.post('/apply-pricing-bulk', applyPricingBulk);
```

#### 3. Implement Pricing Controller
```javascript
// backend/src/controllers/pricingController.js
export const applyPricing = async (req, res) => {
  const { productId } = req.body;
  
  const product = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
  const result = runPricingEngine(product.rows[0]);
  
  if (result && result.changed) {
    await db.query('UPDATE products SET current_price = $1 WHERE id = $2', 
      [result.newPrice, productId]);
    await db.query('INSERT INTO pricing_history (...) VALUES (...)', [...]); 
  }
  
  res.json(result);
};
```

#### 4. Setup Cron Job for Auto-Updates
```javascript
// backend/src/modules/cronJobs.js
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running auto-pricing update...');
  
  const products = await db.query(
    'SELECT * FROM products WHERE auto_pricing_enabled = true'
  );
  
  for (const product of products.rows) {
    const result = runPricingEngine(product);
    if (result && result.changed) {
      // Update DB as above
    }
  }
});
```

### Frontend Integration

#### 1. Display Price History Chart
```javascript
// frontend-new/src/features/pricing/pages/PricingHistoryPage.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function PricingHistoryPage({ productId }) {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    api.get(`/pricing/price-history/${productId}`).then(res => {
      setHistory(res.data.data.history);
    });
  }, [productId]);
  
  return (
    <LineChart data={history}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="createdAt" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="newPrice" stroke="#8884d8" />
      <Line type="monotone" dataKey="oldPrice" stroke="#82ca9d" />
    </LineChart>
  );
}
```

#### 2. Show Pricing Details on Product Page
```javascript
// Already implemented in ProductDetailPage.jsx
// Shows: original_price, current_price, discount%

const discount = ((product.original_price - product.current_price) / product.original_price * 100).toFixed(1);

return (
  <Box>
    <Typography>Giá gốc: {product.original_price.toLocaleString()}₫</Typography>
    <Typography color="error">Giá hiện tại: {product.current_price.toLocaleString()}₫</Typography>
    <Typography color="success">Giảm: {discount}%</Typography>
  </Box>
);
```

---

## Examples

### Example 1: Fresh Vegetable (Spinach)

**Initial Data**:
```
Product: Fresh Spinach Bundle
Original Price: 30,000₫
Current Price: 30,000₫
Expiry Date: 2026-04-12 (2 days left)
Stock: 8 out of 10 (80% stock remaining)
Product Type: fresh
Listed: 2026-04-08 (2 days in storage)
Floor Price: 15,000₫
```

**Calculation**:
```
1. Risk Score:
   - timeScore = (1 - 2/1) × 70 = 0 (CRITICAL - more than 1 day left but formula caps)
   - Actually: max(0, 1-2) = clamped, so timeScore = 0
   - stockScore = 0.8 × 30 = 24
   - riskScore = 0 + 24 = 24 (LOW)

2. Discount:
   - riskScore = 24 < 30
   - discount = 10% (base)
   - No HSD override (2 days > 1)
   - No overstocking penalty
   - Final discount = 10%

3. Final Price:
   - discountAmount = 30,000 × 0.10 = 3,000
   - priceBeforeFloor = 30,000 - 3,000 = 27,000
   - finalPrice = max(27,000, 15,000) = 27,000
   - Rounded: 27,000₫

Result: 27,000₫ (10% discount)
```

---

### Example 2: Dry Good (Bread)

**Initial Data**:
```
Product: Whole Wheat Bread Loaf
Original Price: 80,000₫
Current Price: 80,000₫
Expiry Date: 2026-04-25 (14 days left)
Stock: 3 out of 25 (12% remaining)
Product Type: dry
Listed: 2026-03-01 (40 days in storage)
Floor Price: 40,000₫
```

**Calculation**:
```
1. Risk Score:
   - timeScore = (1 - 14/90) × 60 = (0.844) × 60 = 50.67
   - stockScore = 0.12 × 40 = 4.8
   - riskScore = 50.67 + 4.8 = 55.47

2. Discount:
   - riskScore = 55.47 (30-70 range)
   - discount = 10 + (55.47 - 30) × 0.75 = 10 + 19.1 = 29.1%

3. Final Price:
   - discountAmount = 80,000 × 0.291 = 23,280
   - priceBeforeFloor = 80,000 - 23,280 = 56,720
   - finalPrice = max(56,720, 40,000) = 56,720
   - Rounded: 56,700₫

Result: 56,700₫ (29% discount, above floor price)
```

---

### Example 3: Critical Situation (Yogurt - Expires Tomorrow)

**Initial Data**:
```
Product: Greek Yogurt 500ml
Original Price: 120,000₫
Current Price: 120,000₫
Expiry Date: 2026-04-11 (0.5 hours left!)
Stock: 18 out of 20 (90% remaining)
Product Type: fresh
Listed: 2026-04-09 (1.5 days in storage)
Floor Price: 50,000₫
```

**Calculation**:
```
1. Risk Score:
   - daysLeft ≈ 0.02 (0.5 hours = 0.02 days)
   - timeScore = (1 - 0.02/1) × 70 = 0.98 × 70 = 68.6
   - stockScore = 0.9 × 30 = 27
   - riskScore = 68.6 + 27 = 95.6 (CRITICAL)

2. Discount:
   - riskScore = 95.6 ≥ 70
   - discount = 40 + (95.6 - 70) × 1 = 40 + 25.6 = 65.6%
   - Apply HSD override: max(65.6%, 50%) = 65.6%
   - Final discount = 65.6%

3. Final Price:
   - discountAmount = 120,000 × 0.656 = 78,720
   - priceBeforeFloor = 120,000 - 78,720 = 41,280
   - finalPrice = max(41,280, 50,000) = 50,000 (HIT FLOOR!)
   - Rounded: 50,000₫

Result: 50,000₫ (58% discount, at floor price!)
Reason: "HSD < 1 ngày; Rủi ro cao" → Sell immediately at floor price!
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Prices Not Updating

**Symptom**: `last_price_update` not changing, always same price

**Solutions**:
```sql
-- Check if auto-pricing is enabled
SELECT auto_pricing_enabled FROM products WHERE id = 7;

-- Check if floor price is set too high
SELECT original_price, floor_price FROM products WHERE id = 7;

-- Check pricing history for errors
SELECT * FROM pricing_history WHERE product_id = 7 ORDER BY created_at DESC LIMIT 5;
```

**Logs to Check**:
```
[Error]: runPricingEngine() - Product 7 - Error calculating risk score
[Warn]: Floor price (50000) >= calculated price (45000), no update
```

---

#### Issue 2: Discount Too Aggressive/Conservative

**Symptom**: Products discounting more than expected (or less)

**Check Data**:
```sql
-- Verify product type is set correctly
SELECT id, type, stock_quantity, initial_stock_quantity, expiry_date 
FROM products;

-- Test calculation manually
SELECT 
  (1 - 30/90) * 60 as timeScore,  -- Dry product with 30 days left
  0.5 * 40 as stockScore,          -- 50% stock
  ((1 - 30/90) * 60) + (0.5 * 40) as riskScore;
```

**Debug**: Add console logs to `runPricingEngine()`:
```javascript
console.log('Product:', product.id);
console.log('DaysLeft:', daysLeft, 'StockRatio:', stockRatio, 'Type:', normalizedType);
console.log('RiskScore:', riskScore);
console.log('Discount:', discount);
console.log('FinalPrice:', newPrice);
```

---

#### Issue 3: Database Transaction Errors

**Symptom**: `pricing_history` insertion fails

**Check Constraints**:
```sql
-- Verify pricing_history table exists
\dt pricing_history;

-- Check constraints
\d pricing_history;

-- Verify product_id foreign key
ALTER TABLE pricing_history ADD CONSTRAINT fk_product_id 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
```

---

### Performance Optimization

**For Large Datasets**:

1. **Add Indexes**:
```sql
CREATE INDEX idx_products_auto_pricing ON products(auto_pricing_enabled, updated_at);
CREATE INDEX idx_pricing_history_product_date ON pricing_history(product_id, created_at DESC);
```

2. **Batch Processing**:
```javascript
// Process 100 products at a time instead of all
const BATCH_SIZE = 100;
for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const batch = products.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(p => updatePrice(p)));
}
```

3. **Cache Calculations**:
```javascript
// Cache risk scores for 5 minutes
const riskScoreCache = new Map();

function getCachedRiskScore(productId, daysLeft, stockRatio, type) {
  const key = `${productId}_${daysLeft}_${stockRatio}_${type}`;
  if (riskScoreCache.has(key)) {
    return riskScoreCache.get(key);
  }
  const score = calculateRiskScore(daysLeft, stockRatio, type);
  riskScoreCache.set(key, score);
  // Clear after 5 minutes
  setTimeout(() => riskScoreCache.delete(key), 300000);
  return score;
}
```

---

### Monitoring & Alerting

**Setup Monitoring**:

```javascript
// Log all significant price changes
async function logPriceChange(product, oldPrice, newPrice, discount) {
  console.log(`[PRICING] Product ${product.id}: ${oldPrice}₫ → ${newPrice}₫ (${discount}%)`);
  
  // Alert if discount > 50%
  if (discount > 50) {
    console.warn(`[ALERT] High discount on product ${product.id}: ${discount}%`);
    // Send notification, email, or webhook
  }
}
```

---

## Summary

| Concept | Details |
|---------|---------|
| **Risk Calculation** | Combines expiry time + inventory level |
| **Discount Formula** | Non-linear: 10% (low) → 80% (critical) |
| **Price Floor** | Minimum threshold prevents losses |
| **Type Awareness** | Different formulas for dry vs. fresh |
| **Audit Trail** | All changes tracked in `pricing_history` |
| **Auto-Updates** | Hourly cron job or on-demand API calls |

---

## References

- **Files Location**: `/backend/src/modules/pricing/engine.js`
- **API Routes**: `/backend/src/routes/pricing.js`
- **Database**: PostgreSQL tables: `products`, `pricing_history`
- **Frontend**: Price display in `ProductDetailPage.jsx`

---

**Last Updated**: April 11, 2026  
**Version**: 1.0.0  
**Author**: ShortDate Development Team
