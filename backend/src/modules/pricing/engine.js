/**
 * AUTO-PRICING ENGINE - Công Thức Toán Học (Cập Nhật)
 * 
 * LOGIC PRICING:
 * 
 * 1. DRY PRODUCTS (Sản Phẩm Khô) - Mức discount nhẹ hơn:
 *    - 30-90 ngày: 0-5% discount (giữ giá tốt lâu hơn)
 *    - 7-30 ngày: 5-20% discount  
 *    - 1-7 ngày: 20-35% discount (cần bán nhanh lên)
 *    - < 1 ngày: 35% discount (deadline)
 *    - Tồn kho cao (>80%) + lưu kho 30+ ngày: +5% thêm
 *
 * 2. FRESH PRODUCTS (Sản Phẩm Tươi) - Mức discount aggressive:
 *    - Risk Score >= 70: 40%+ discount (cần bán gấp vì short shelf-life)
 *    - Risk Score 30-70: 10-40% discount
 *    - Risk Score < 30: 5% discount
 *    - < 1 ngày: min 50% discount
 * 
 * 3. STOCK RATIO:
 *    - Tồn kho cao khi >80% so với khi nhập
 *    - Ảnh hưởng: thêm 5-10% discount tùy loại sản phẩm
 */

/**
 * Tính Product_Risk_Score dựa trên type sản phẩm
 * @param {number} daysLeft - Số ngày còn lại đến HSD
 * @param {number} stockRatio - Tỷ lệ tồn kho (0-1)
 * @param {string} productType - 'dry' hoặc 'fresh'
 * @returns {number} Risk score (0-100)
 */
export function calculateRiskScore(daysLeft, stockRatio, productType) {
  // Đảm bảo các giá trị hợp lệ
  stockRatio = Math.max(0, Math.min(stockRatio, 1));

  let timeScore, stockScore;

  if (productType === 'dry') {
    // Dry product: scaling mềm hơn
    // 90+ ngày: 0% → 30 ngày: 20% → 0 ngày: 80%
    const daysCapped = Math.max(0, Math.min(daysLeft, 90));
    timeScore = (1 - daysCapped / 90) * 50;  // Giảm từ 60 → 50
    stockScore = stockRatio * 30;  // Giảm từ 40 → 30
  } else {
    // Fresh product: vẫn aggressive vì nhất thiết phải bán nhanh
    timeScore = Math.max(0, 1 - daysLeft / 1) * 70;
    stockScore = stockRatio * 30;
  }

  const riskScore = timeScore + stockScore;
  // Đảm bảo riskScore nằm trong [0, 100]
  return Math.max(0, Math.min(riskScore, 100));
}

/**
 * Tính discount percent dựa trên Risk Score
 * @param {number} riskScore - Product Risk Score (0-100)
 * @param {number} daysLeft - Số ngày còn lại
 * @param {number} stockRatio - Tỷ lệ tồn kho
 * @param {number} daysInStock - Tổng số ngày tính từ khi nhập kho
 * @returns {number} Discount percent (0-100)
 */
export function calculateDiscount(riskScore, daysLeft, stockRatio, daysInStock, productType) {
  let discount = 0;

  if (productType === 'dry') {
    // Dry products: discount nhẹ hơn
    // Logic: discount dạng step function
    if (daysLeft > 30) {
      // 30-90 ngày: 0-5% discount
      discount = Math.max(0, (90 - daysLeft) / 12);  // 90 ngày → 0%, 30 ngày → 5%
    } else if (daysLeft > 7) {
      // 7-30 ngày: 5-20% discount
      discount = 5 + (30 - daysLeft) * 0.6;  // 30 ngày → 5%, 7 ngày → 18.8%
    } else if (daysLeft > 1) {
      // 1-7 ngày: 20-35% discount
      discount = 20 + (7 - daysLeft) * 2.5;  // 7 ngày → 20%, 1 ngày → 35%
    } else {
      // < 1 ngày: 35% discount (tối đa cho dry)
      discount = 35;
    }

    // Nếu tồn kho cao thêm 5-10%
    if (stockRatio > 0.8 && daysInStock && daysInStock > 30) {
      discount = Math.min(40, discount + 5);
    }
  } else {
    // Fresh products: vẫn aggressive vì cần bán gấp
    // Quy tắc cơ bản dựa trên Risk Score
    if (riskScore >= 70) {
      // Risk cao: discount 40% + thêm dựa trên score
      discount = 40 + Math.min(40, (riskScore - 70) * 1);
    } else if (riskScore >= 30) {
      // Risk trung bình
      discount = 10 + (riskScore - 30) * 0.75;
    } else {
      // Risk thấp
      discount = 5;
    }

    // Áp dụng thêm nếu HSD rất gần
    if (daysLeft < 1) {
      discount = Math.max(discount, 50);
    }

    // Nếu tồn kho cao
    if (stockRatio > 0.8 && daysInStock && daysInStock > 0.5) {
      discount = Math.min(80, discount + 10);
    }
  }

  return Math.max(0, Math.min(discount, 100));
}

/**
 * Tính giá cuối dựa trên discount và floor price
 * @param {number} originalPrice - Giá gốc
 * @param {number} discount - Discount percent (0-100)
 * @param {number} floorPrice - Giá sàn tối thiểu
 * @returns {number} Giá cuối sau làm tròn
 */
export function calculateFinalPrice(originalPrice, discount, floorPrice = 0) {
  const discountAmount = originalPrice * (discount / 100);
  const priceBeforeFloor = originalPrice - discountAmount;
  const finalPrice = Math.max(priceBeforeFloor, floorPrice);

  // Làm tròn xuống đến 100 VND gần nhất
  return Math.floor(finalPrice / 100) * 100;
}

/**
 * Run Auto-Pricing Engine cho một sản phẩm
 * @param {object} product - Đối tượng sản phẩm từ database
 * @returns {object} { newPrice, riskScore, discount, reason }
 */
export function runPricingEngine(product) {
  // Kiểm tra xem Auto-Pricing có bật không
  if (!product.auto_pricing_enabled) {
    return null;
  }

  const normalizedType = (() => {
    const t = product?.type ?? product?.product_type;
    if (t === 'dry' || t === 'fresh') return t;
    if (t === 'dry_product') return 'dry';
    if (t === 'fresh_product') return 'fresh';
    // fallback: treat unknown as dry (less aggressive than fresh)
    return 'dry';
  })();

  // Tính ngày còn lại
  const expiryDate = new Date(product.expiry_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(0, Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)));

  // Tính tỷ lệ tồn kho
  const initialStock = (product.initial_stock_quantity ?? product.stock_quantity ?? 0);
  const currentStock = (product.stock_quantity ?? 0);
  const stockRatio = initialStock > 0 ? currentStock / initialStock : 0;

  // Tính ngày đã tồn kho
  const listedDate = new Date(product.listed_at ?? product.created_at ?? today);
  const daysInStock = Math.ceil((today - listedDate) / (1000 * 60 * 60 * 24));

  // Tính Risk Score
  const riskScore = calculateRiskScore(daysLeft, stockRatio, normalizedType);

  // Tính Discount
  const discount = calculateDiscount(riskScore, daysLeft, stockRatio, daysInStock, normalizedType);

  // Tính giá cuối
  const floorPrice = product.floor_price ?? product.min_floor_price ?? 0;
  const newPrice = calculateFinalPrice(product.original_price, discount, floorPrice);

  // Tính lý do thay đổi
  let reasons = [];
  if (daysLeft < 1) reasons.push('HSD < 1 ngày');
  if (daysLeft < 7) reasons.push('HSD sắp hết');
  if (stockRatio > 0.8 && daysInStock > (normalizedType === 'dry' ? 45 : 0.5)) reasons.push('Tồn kho cao');
  if (riskScore >= 70) reasons.push('Rủi ro cao');

  const reason = reasons.length > 0 
    ? reasons.join('; ')
    : `Auto-pricing update (Risk: ${Math.round(riskScore)}, Discount: ${Math.round(discount)}%)`;

  return {
    newPrice,
    riskScore,
    discount,
    reason,
    oldPrice: product.current_price,
    changed: newPrice !== product.current_price
  };
}

export default {
  calculateRiskScore,
  calculateDiscount,
  calculateFinalPrice,
  runPricingEngine
};
