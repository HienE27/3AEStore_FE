import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Interfaces
export interface CheckoutRequest {
  customerId: string;
  orderDetails: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  couponCode?: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  originalTotal?: number;
  discountAmount?: number;
  finalTotal?: number;
  couponUsed?: string;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountValue: number;
    discountType: string;
    orderAmountLimit?: number;
  };
  message?: string;
}

// Checkout API functions
export const checkoutAPI = {
  /**
   * Xử lý thanh toán đơn hàng
   */
  processCheckout: async (checkoutData: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      const response = await axios.post(`${BASE_URL}/api/orders/checkout`, checkoutData);
      return {
        success: response.data.success !== false,
        orderId: response.data.orderId,
        message: response.data.message || 'Checkout successful',
        originalTotal: response.data.originalTotal,
        discountAmount: response.data.discountAmount,
        finalTotal: response.data.finalTotal,
        couponUsed: response.data.couponUsed
      };
    } catch (error: any) {
      console.error('Checkout error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Checkout failed'
      };
    }
  },

  /**
   * Validate mã giảm giá
   */
  validateCoupon: async (couponCode: string, orderAmount: number): Promise<CouponValidation> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/coupons/validate/${couponCode}`, {
        params: { orderAmount }
      });
      return response.data;
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      return {
        valid: false,
        message: error.response?.data?.message || 'Mã giảm giá không hợp lệ'
      };
    }
  },

  /**
   * Tính phí vận chuyển
   */
  calculateShippingFee: async (customerId: string, orderAmount: number): Promise<{ fee: number }> => {
    try {
      // Simple shipping calculation - can be replaced with actual API
      return { fee: orderAmount > 500000 ? 0 : 30000 };
    } catch (error) {
      console.error('Shipping calculation error:', error);
      return { fee: orderAmount > 500000 ? 0 : 30000 };
    }
  },

  /**
   * Lấy thông tin thanh toán
   */
  getPaymentMethods: async (): Promise<any[]> => {
    try {
      // Return default payment methods
      return [
        { id: 'COD', name: 'Thanh toán khi nhận hàng', enabled: true },
        { id: 'BANK_TRANSFER', name: 'Chuyển khoản ngân hàng', enabled: true }
      ];
    } catch (error) {
      console.error('Payment methods error:', error);
      return [
        { id: 'COD', name: 'Thanh toán khi nhận hàng', enabled: true }
      ];
    }
  },

  /**
   * Lấy danh sách coupon có thể sử dụng
   */
  getAvailableCoupons: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/coupons/available`);
      return response.data;
    } catch (error) {
      console.error('Get available coupons error:', error);
      return [];
    }
  }
};

export default checkoutAPI;