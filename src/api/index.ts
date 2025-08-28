// src/api/index.ts - FINAL FIXED VERSION
// ⚠️ CHỈ export những APIs đã có và hoạt động

// ✅ Export existing APIs
export * from './NewsAPI';
export * from './OrderAPI';
export * from './CheckoutAPI';

// ✅ Export specific functions
export { checkoutAPI } from './CheckoutAPI';
export { orderEnhancedAPI } from './OrderAPI';

// ✅ Export only existing types
export type {
  CheckoutRequest,
  CheckoutResponse,
  CouponValidation
} from './CheckoutAPI';

export type {
  Order,
  OrderApiResponse,
  //OrderDetail,
  OrderStatistics
} from './OrderAPI';