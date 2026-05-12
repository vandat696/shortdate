import db from '../config/database.js';
import PricingHistory from '../models/PricingHistory.js';
import { runPricingEngine } from './pricing/engine.js';

/**
 * Cron Job: Chạy Auto-Pricing Engine cho tất cả sản phẩm
 * Mặc định: chạy mỗi 1 giờ
 */
export async function runAutoPricingJob() {
  console.log('[CRON] Starting Auto-Pricing Engine job...');
  const startTime = Date.now();

  try {
    // Lấy tất cả sản phẩm có auto_pricing_enabled = true
    const productsResult = await db.query(
      `SELECT id, current_price, original_price, min_floor_price, auto_pricing_enabled,
              product_type, stock_quantity, expiry_date, created_at
       FROM products WHERE auto_pricing_enabled = true AND is_active = true`
    );

    const products = productsResult.rows;
    console.log(`[CRON] Processing ${products.length} products with auto-pricing enabled`);

    let updated = 0;
    let unchanged = 0;
    const errors = [];

    // Chạy pricing engine cho mỗi sản phẩm
    for (const product of products) {
      try {
        const pricingResult = runPricingEngine(product);

        if (pricingResult && pricingResult.changed) {
          // Thêm vào lịch sử giá
          await PricingHistory.addHistory(
            product.id,
            pricingResult.oldPrice,
            pricingResult.newPrice,
            pricingResult.reason
          );

          // Cập nhật giá
          await db.query(
            'UPDATE products SET current_price = $1, updated_at = NOW() WHERE id = $2',
            [pricingResult.newPrice, product.id]
          );

          console.log(`[CRON] Product ${product.id}: ${pricingResult.oldPrice} → ${pricingResult.newPrice} (${Math.round(pricingResult.discount)}% discount)`);
          updated++;
        } else {
          unchanged++;
        }
      } catch (productError) {
        console.error(`[CRON] Error processing product ${product.id}:`, productError.message);
        errors.push({
          productId: product.id,
          error: productError.message
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Auto-Pricing Engine job completed in ${duration}ms`);
    console.log(`[CRON] Updated: ${updated}, Unchanged: ${unchanged}, Errors: ${errors.length}`);

    return {
      success: true,
      totalProducts: products.length,
      updated,
      unchanged,
      errors,
      duration
    };
  } catch (error) {
    console.error('[CRON] Error in Auto-Pricing Engine job:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Initialize Cron Jobs
 * Gọi function này khi start server
 */
export function initializeCronJobs() {
  console.log('[CRON] Initializing cron jobs...');

  // Chạy Auto-Pricing Engine mỗi 1 giờ
  // const autoPricingInterval = process.env.AUTO_PRICING_INTERVAL || 3600000; // 1 giờ
  const autoPricingInterval = 10000; // 10s

  
  setInterval(() => {
    runAutoPricingJob().catch(error => {
      console.error('[CRON] Unhandled error in Auto-Pricing job:', error);
    });
  }, autoPricingInterval);

  console.log(`[CRON] Auto-Pricing Engine will run every ${autoPricingInterval / 60000} minutes`);

  // Run once on startup (optional)
  if (process.env.RUN_PRICING_ON_STARTUP === 'true') {
    console.log('[CRON] Running Auto-Pricing Engine on startup...');
    runAutoPricingJob().catch(error => {
      console.error('[CRON] Error on startup pricing job:', error);
    });
  }
}

export default {
  runAutoPricingJob,
  initializeCronJobs
};
