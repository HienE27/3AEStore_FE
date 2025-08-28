// src/utils/helpers.ts
import { config } from '../config/environment';

export const helpers = {
  /**
   * Calculate shipping fee based on order amount
   */
  calculateShippingFee: (orderAmount: number): number => {
    return orderAmount >= config.SHIPPING.FREE_SHIPPING_THRESHOLD 
      ? 0 
      : config.SHIPPING.DEFAULT_SHIPPING_FEE;
  },

  /**
   * Calculate discount amount
   */
  calculateDiscount: (
    totalAmount: number, 
    discountValue: number, 
    discountType: 'PERCENTAGE' | 'FIXED'
  ): number => {
    if (discountType === 'PERCENTAGE') {
      return totalAmount * (discountValue / 100);
    } else {
      return Math.min(discountValue, totalAmount);
    }
  },

  /**
   * Calculate product price after sale
   */
  calculateProductPrice: (buyingPrice: number, salePercentage: number): number => {
    return salePercentage > 0 
      ? buyingPrice * (1 - salePercentage / 100) 
      : buyingPrice;
  },

  /**
   * Generate order ID
   */
  generateOrderId: (): string => {
    return 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number (Vietnamese format)
   */
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Truncate text with ellipsis
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Get order status color
   */
  getOrderStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'primary';
      case 'shipped':
      case 'shipping':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  },

  /**
   * Get order status text
   */
  getOrderStatusText: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'approved':
        return 'Đã duyệt';
      case 'shipped':
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }
};
