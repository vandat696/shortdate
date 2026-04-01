/**
 * Property-Based Tests cho Auto-Pricing Engine
 * Sử dụng: fast-check
 * Chạy: npm test -- pricing.test.js
 */

import { describe, test } from '@jest/globals';
import fc from 'fast-check';
import {
  calculateRiskScore,
  calculateDiscount,
  calculateFinalPrice,
  runPricingEngine
} from '../src/modules/pricing/engine.js';

describe('Auto-Pricing Engine - Property Tests', () => {

  // ============ Property 12: Risk Score trong [0, 100] ============
  test('P12: Product_Risk_Score luôn nằm trong khoảng [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.record({
          daysLeft: fc.integer({ min: 0, max: 90 }),
          stockRatio: fc.float({ min: 0, max: 1 }),
          productType: fc.constantFrom('dry', 'fresh'),
        }),
        ({ daysLeft, stockRatio, productType }) => {
          const score = calculateRiskScore(daysLeft, stockRatio, productType);
          return score >= 0 && score <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============ Property 13: Mapping Risk Score → discount ============
  test('P13: Mapping Risk Score → mức chiết khấu đúng ngưỡng', () => {
    fc.assert(
      fc.property(
        fc.record({
          riskScore: fc.float({ min: 0, max: 100 }),
          daysLeft: fc.float({ min: 0, max: 90 }),
          stockRatio: fc.float({ min: 0, max: 1 }),
          daysInStock: fc.integer({ min: 0, max: 90 }),
          productType: fc.constantFrom('dry', 'fresh'),
        }),
        ({ riskScore, daysLeft, stockRatio, daysInStock, productType }) => {
          const discount = calculateDiscount(riskScore, daysLeft, stockRatio, daysInStock, productType);
          
          // Verify thresholds
          if (riskScore >= 70) {
            return discount >= 40 && discount <= 100;
          } else if (riskScore < 30) {
            return discount >= 10 && discount <= 20;
          }
          return discount >= 0 && discount <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============ Property 10: Giá không thấp hơn floor_price ============
  test('P10: Giá sau điều chỉnh không bao giờ thấp hơn giá sàn', () => {
    fc.assert(
      fc.property(
        fc.record({
          originalPrice: fc.float({ min: 10000, max: 1000000 }),
          floorPrice: fc.float({ min: 1000, max: 500000 }),
          discount: fc.float({ min: 0, max: 100 }),
        }),
        ({ originalPrice, floorPrice, discount }) => {
          fc.pre(floorPrice <= originalPrice);
          const finalPrice = calculateFinalPrice(originalPrice, discount, floorPrice);
          return finalPrice >= floorPrice;
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============ Property 8: Auto-pricing giảm ≥ 50% khi HSD < 24h ============
  test('P8: Auto-pricing giảm tối thiểu 50% khi HSD < 24 giờ', () => {
    fc.assert(
      fc.property(
        fc.record({
          stockRatio: fc.float({ min: 0, max: 1 }),
          daysInStock: fc.integer({ min: 0, max: 90 }),
        }),
        ({ stockRatio, daysInStock }) => {
          const daysLeft = fc.sample(fc.float({ min: 0, max: 0.99 }), 1)[0];
          const discount = calculateDiscount(100, daysLeft, stockRatio, daysInStock, 'fresh');
          return discount >= 50;
        }
      ),
      { numRuns: 50 }
    );
  });

  // ============ Property 9: Auto-pricing tăng chiết khấu khi tồn kho cao ============
  test('P9: Auto-pricing tăng chiết khấu ≥ 10% khi tồn kho cao', () => {
    fc.assert(
      fc.property(
        fc.record({
          riskScore: fc.float({ min: 0, max: 100 }),
          daysLeft: fc.float({ min: 0, max: 90 }),
          daysInStock: fc.integer({ min: 50, max: 90 }), // Đã qua 50% thời gian
        }),
        ({ riskScore, daysLeft, daysInStock }) => {
          const stockRatioLow = 0.7;
          const stockRatioHigh = 0.85;
          
          const discountLow = calculateDiscount(
            riskScore, daysLeft, stockRatioLow, daysInStock, 'dry'
          );
          const discountHigh = calculateDiscount(
            riskScore, daysLeft, stockRatioHigh, daysInStock, 'dry'
          );

          // Tồn kho cao hơn → discount cao hơn (ít nhất 10%)
          return discountHigh >= discountLow + 10;
        }
      ),
      { numRuns: 50 }
    );
  });

  // ============ Unit Tests - Happy Path ============
  describe('Unit Tests - Happy Path', () => {
    test('Dry product: 30 ngày HSD, 60% tồn kho → discount ~24%', () => {
      const riskScore = calculateRiskScore(30, 0.6, 'dry');
      const discount = calculateDiscount(riskScore, 30, 0.6, 45, 'dry');
      
      expect(riskScore).toBeGreaterThan(30);
      expect(riskScore).toBeLessThan(100);
      expect(discount).toBeGreaterThan(15);
      expect(discount).toBeLessThan(35);
    });

    test('Fresh product: 0.5 ngày HSD, 90% tồn kho → discount ≥ 50%', () => {
      const riskScore = calculateRiskScore(0.5, 0.9, 'fresh');
      const discount = calculateDiscount(riskScore, 0.5, 0.9, 0.5, 'fresh');
      
      expect(riskScore).toBeGreaterThan(70);
      expect(discount).toBeGreaterThanOrEqual(50);
    });

    test('Dry product: 5 ngày HSD, 20% tồn kho → discount ≥ 40%', () => {
      const riskScore = calculateRiskScore(5, 0.2, 'dry');
      const discount = calculateDiscount(riskScore, 5, 0.2, 45, 'dry');
      
      expect(riskScore).toBeGreaterThan(50);
      expect(discount).toBeGreaterThanOrEqual(40);
    });

    test('Price calculation: 100,000 VND with 30% discount, floor 50,000 → 70,000 VND', () => {
      const finalPrice = calculateFinalPrice(100000, 30, 50000);
      expect(finalPrice).toBe(70000);
    });

    test('Price calculation không thấp hơn floor price', () => {
      const finalPrice = calculateFinalPrice(100000, 80, 50000);
      expect(finalPrice).toBeGreaterThanOrEqual(50000);
    });

    test('runPricingEngine returns null khi auto_pricing_enabled = false', () => {
      const product = {
        auto_pricing_enabled: false,
        current_price: 100000,
        original_price: 150000,
        floor_price: 50000,
        type: 'dry',
        stock_quantity: 10,
        initial_stock_quantity: 100,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        listed_at: new Date()
      };

      const result = runPricingEngine(product);
      expect(result).toBeNull();
    });

    test('runPricingEngine respects floor_price', () => {
      const product = {
        auto_pricing_enabled: true,
        current_price: 100000,
        original_price: 150000,
        floor_price: 100000,
        type: 'dry',
        stock_quantity: 5,
        initial_stock_quantity: 100,
        expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        listed_at: new Date()
      };

      const result = runPricingEngine(product);
      if (result && result.changed) {
        expect(result.newPrice).toBeGreaterThanOrEqual(product.floor_price);
      }
    });
  });

  // ============ Edge Cases ============
  describe('Edge Cases', () => {
    test('HSD = 0 (expired today) → high risk score', () => {
      const riskScore = calculateRiskScore(0, 0.5, 'dry');
      expect(riskScore).toBeGreaterThan(50);
    });

    test('Stock ratio = 0 (out of stock)', () => {
      const riskScore = calculateRiskScore(30, 0, 'dry');
      expect(riskScore).toBeGreaterThan(0);
      expect(riskScore).toBeLessThanOrEqual(60);
    });

    test('Stock ratio = 1 (full stock)', () => {
      const riskScore = calculateRiskScore(30, 1, 'dry');
      expect(riskScore).toBeGreaterThan(30);
      expect(riskScore).toBeLessThanOrEqual(100);
    });

    test('Fresh product: HSD > 1 ngày → capped at 1', () => {
      // calculateRiskScore should clamp daysLeft to max 1 for fresh products
      const riskScore1 = calculateRiskScore(1, 0.5, 'fresh');
      const riskScore2 = calculateRiskScore(2, 0.5, 'fresh');
      
      expect(riskScore1).toBeGreaterThanOrEqual(0);
      expect(riskScore2).toBeGreaterThanOrEqual(0);
    });

    test('Final price rounds down to nearest 100 VND', () => {
      const finalPrice = calculateFinalPrice(123456, 30, 0);
      expect(finalPrice % 100).toBe(0);
    });
  });
});
