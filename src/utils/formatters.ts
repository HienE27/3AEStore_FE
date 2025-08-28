// src/utils/formatters.ts
import { config } from '../config/environment';

export const formatters = {
  /**
   * Format price to Vietnamese currency
   */
  formatPrice: (price: number): string => {
    if (isNaN(price) || price < 0) price = 0;
    return new Intl.NumberFormat(config.LOCALE, {
      style: 'currency',
      currency: config.CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  },

  /**
   * Format date to Vietnamese format
   */
  formatDate: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString(config.LOCALE);
    } catch {
      return 'N/A';
    }
  },

  /**
   * Format datetime to Vietnamese format
   */
  formatDateTime: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString(config.LOCALE);
    } catch {
      return 'N/A';
    }
  },

  /**
   * Format number with thousand separators
   */
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat(config.LOCALE).format(num);
  },

  /**
   * Format percentage
   */
  formatPercentage: (num: number): string => {
    return new Intl.NumberFormat(config.LOCALE, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  }
};