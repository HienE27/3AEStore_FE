// src/config/environment.ts

export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  API_TIMEOUT: 30000,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    ADMIN_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  CURRENCY: 'VND',
  LOCALE: 'vi-VN',
  SHIPPING: {
    FREE_SHIPPING_THRESHOLD: 500000,
    DEFAULT_SHIPPING_FEE: 30000
  }
};