// src/api/CartAPI.ts - Enhanced version with complete functionality
import axios from 'axios';
import { config } from '../config/environment';

const BASE_URL = `${config.API_BASE_URL}/api/cards`;
const ORDER_URL = `${config.API_BASE_URL}/api/orders`;

// Enhanced interfaces
export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    productName: string;
    buyingPrice: number;
    salePrice: number;
    comparePrice: number;
    shortDescription: string;
    quantity: number;
    galleryImage?: string;
  };
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon?: {
    id: string;
    code: string;
    discountValue: number;
    discountType: string;
    orderAmountLimit?: number;
  };
}

export interface CheckoutData {
  customerId: string;
  orderDetails: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  couponCode?: string;
  shippingAddress: string;
  phoneNumber?: string;
  paymentMethod: string;
  note?: string;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  message: string;
  orderTotal?: number;
  originalTotal?: number;
  discountAmount?: number;
  finalTotal?: number;
  redirectUrl?: string;
}

export interface StockValidationResult {
  valid: boolean;
  errors: string[];
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

// Enhanced Cart API functions
export const cartAPI = {
  /**
   * Lấy tất cả sản phẩm trong giỏ hàng
   */
  getAllCartItems: async (): Promise<CartItem[]> => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (error) {
      console.error('Get cart items error:', error);
      return [];
    }
  },

  /**
   * Lấy giỏ hàng theo customer ID với error handling tốt hơn
   */
  getCartByCustomerId: async (customerId: string): Promise<CartItem[]> => {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const res = await axios.get(`${config.API_BASE_URL}/cardItems/search/findByCard_Customer_Id`, {
        params: { customerId }
      });
      
      const data = res.data as { _embedded?: { cardItems: { id: string, quantity: number }[] } };
      const items = data._embedded?.cardItems || [];

      if (items.length === 0) {
        return [];
      }

      // Fetch detailed product information for each cart item with parallel processing
      const detailedItems = await Promise.allSettled(
        items.map(async (item) => {
          try {
            const productRes = await axios.get(`${config.API_BASE_URL}/cardItems/search/findProductByCardItemId`, {
              params: { cardItemId: item.id }
            });
            
            let product = productRes.data;
            
            // Get product gallery image
            try {
              const galleryRes = await axios.get(`${config.API_BASE_URL}/gallerys/search/findByProduct`, { 
                params: { product: `/api/products/${product.id}` } 
              });

              const galleries = galleryRes.data._embedded?.galleries || [];
              const thumbnailImage = galleries.find((g: any) => g.isThumbnail)?.image || 
                                    galleries[0]?.image || 
                                    "images/default-image.jpg";
              product = { ...product, galleryImage: thumbnailImage };
            } catch (galleryError) {
              console.warn('Gallery fetch failed for product:', product.id);
              product = { ...product, galleryImage: "images/default-image.jpg" };
            }

            return {
              id: item.id,
              quantity: item.quantity,
              product,
            } as CartItem;
          } catch (err) {
            console.error('Error fetching product for cart item:', item.id, err);
            return null;
          }
        })
      );

      // Filter out failed requests and return successful ones
      return detailedItems
        .filter((result): result is PromiseFulfilledResult<CartItem> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

    } catch (error) {
      console.error('Get cart by customer error:', error);
      throw new Error('Failed to fetch cart items');
    }
  },

  /**
   * Thêm sản phẩm vào giỏ hàng với validation
   */
  addToCart: async (customerId: string, productId: string, quantity: number): Promise<void> => {
    try {
      if (!customerId || !productId || quantity <= 0) {
        throw new Error('Invalid parameters for add to cart');
      }

      // Validate product stock before adding
      const productRes = await axios.get(`${config.API_BASE_URL}/api/products/${productId}`);
      const product = productRes.data;
      
      if (product.quantity < quantity) {
        throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
      }

      await axios.post(`${BASE_URL}/add-product`, {
        idCustomer: customerId,
        products: [{ productId, quantity }],
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add product to cart');
    }
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  updateQuantity: async (customerId: string, productId: string, quantity: number): Promise<void> => {
    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Validate stock before updating
      const productRes = await axios.get(`${config.API_BASE_URL}/api/products/${productId}`);
      const product = productRes.data;
      
      if (product.quantity < quantity) {
        throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
      }

      await axios.put(`${BASE_URL}/update-quantity/${customerId}/${productId}`, null, {
        params: { quantity }
      });
    } catch (error: any) {
      console.error('Update quantity error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update quantity');
    }
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng (bằng cardItem ID)
   */
  removeCartItem: async (cardItemId: string): Promise<void> => {
    try {
      await axios.delete(`${config.API_BASE_URL}/cardItems/${cardItemId}`);
    } catch (error: any) {
      console.error('Remove cart item error:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove cart item');
    }
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clearCart: async (customerId: string): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/clear/${customerId}`);
    } catch (error: any) {
      console.error('Clear cart error:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  },

  /**
   * Tính tổng giỏ hàng với các loại phí (improved)
   */
  calculateCartSummary: async (
    cartItems: CartItem[], 
    couponCode?: string, 
    customerId?: string
  ): Promise<CartSummary> => {
    try {
      // Calculate subtotal
      const subtotal = cartItems.reduce((total, item) => {
        const itemPrice = item.product.buyingPrice || 0;
        return total + itemPrice * item.quantity;
      }, 0);

      let discount = 0;
      let appliedCoupon = undefined;

      // Apply coupon if provided
      if (couponCode) {
        try {
          const couponValidation = await cartAPI.validateCoupon(couponCode, subtotal);
          if (couponValidation.valid && couponValidation.coupon) {
            appliedCoupon = couponValidation.coupon;
            if (couponValidation.coupon.discountType === 'PERCENTAGE') {
              discount = subtotal * (couponValidation.coupon.discountValue / 100);
            } else {
              discount = Math.min(couponValidation.coupon.discountValue, subtotal);
            }
          }
        } catch (error) {
          console.error('Coupon validation error:', error);
        }
      }

      // Calculate shipping fee
      const shippingFee = subtotal >= config.SHIPPING.FREE_SHIPPING_THRESHOLD ? 0 : config.SHIPPING.DEFAULT_SHIPPING_FEE;
      const total = subtotal - discount + shippingFee;

      return {
        totalItems: cartItems.reduce((total, item) => total + item.quantity, 0),
        subtotal,
        discount,
        shippingFee,
        total: Math.max(total, 0), // Ensure total is not negative
        appliedCoupon
      };
    } catch (error) {
      console.error('Calculate cart summary error:', error);
      throw new Error('Failed to calculate cart summary');
    }
  },

  /**
   * Validate coupon - Enhanced with better error handling
   */
  validateCoupon: async (couponCode: string, orderAmount: number): Promise<CouponValidation> => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/coupons/validate/${couponCode}`, {
        params: { orderAmount }
      });
      return response.data;
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          valid: false,
          message: 'Mã giảm giá không tồn tại'
        };
      } else if (error.response?.status === 400) {
        return {
          valid: false,
          message: error.response.data?.message || 'Mã giảm giá không hợp lệ'
        };
      }
      
      return {
        valid: false,
        message: 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại sau.'
      };
    }
  },

  /**
   * Kiểm tra tồn kho trước khi checkout
   */
  validateCartStock: async (cartItems: CartItem[]): Promise<StockValidationResult> => {
    try {
      const errors: string[] = [];
      
      // Use Promise.allSettled to check all items in parallel
      const validationResults = await Promise.allSettled(
        cartItems.map(async (item) => {
          try {
            const productRes = await axios.get(`${config.API_BASE_URL}/api/products/${item.product.id}`);
            const currentStock = productRes.data.quantity;

            if (currentStock < item.quantity) {
              return `${item.product.productName}: Chỉ còn ${currentStock} sản phẩm trong kho (bạn đang chọn ${item.quantity})`;
            }
            return null;
          } catch (error) {
            return `Không thể kiểm tra tồn kho cho sản phẩm ${item.product.productName}`;
          }
        })
      );

      // Collect all errors
      validationResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          errors.push(result.value);
        } else if (result.status === 'rejected') {
          errors.push('Có lỗi xảy ra khi kiểm tra tồn kho');
        }
      });

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Validate cart stock error:', error);
      return {
        valid: false,
        errors: ['Không thể kiểm tra tồn kho. Vui lòng thử lại.']
      };
    }
  },

  /**
   * Process checkout - Enhanced version with better error handling
   */
  processCheckout: async (
    customerId: string,
    couponCode?: string,
    shippingAddress?: string,
    phoneNumber?: string,
    paymentMethod: string = 'COD'
  ): Promise<CheckoutResult> => {
    try {
      // Validate input
      if (!customerId || !shippingAddress) {
        return {
          success: false,
          message: 'Thông tin đơn hàng không hợp lệ'
        };
      }

      // Get cart items for validation
      const cartItems = await cartAPI.getCartByCustomerId(customerId);
      if (cartItems.length === 0) {
        return {
          success: false,
          message: 'Giỏ hàng trống'
        };
      }

      // Validate stock
      const stockValidation = await cartAPI.validateCartStock(cartItems);
      if (!stockValidation.valid) {
        return {
          success: false,
          message: 'Tồn kho không đủ:\n' + stockValidation.errors.join('\n')
        };
      }

      // Call the checkout endpoint
      const checkoutData = {
        customerId,
        orderDetails: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.buyingPrice
        })),
        couponCode,
        shippingAddress,
        paymentMethod
      };

      const response = await axios.post(`${ORDER_URL}/checkout`, checkoutData);

      if (response.data.success !== false) {
        return {
          success: true,
          orderId: response.data.orderId,
          message: response.data.message || 'Đặt hàng thành công!',
          originalTotal: response.data.originalTotal,
          discountAmount: response.data.discountAmount,
          orderTotal: response.data.finalTotal,
          redirectUrl: `/profile/orders`
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Đặt hàng thất bại'
        };
      }
    } catch (error: any) {
      console.error('Process checkout error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data?.message || 'Thông tin đơn hàng không hợp lệ'
        };
      } else if (error.response?.status === 409) {
        return {
          success: false,
          message: 'Sản phẩm trong giỏ hàng đã thay đổi. Vui lòng kiểm tra lại.'
        };
      }
      
      return {
        success: false,
        message: 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.'
      };
    }
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<any[]> => {
    try {
      // In a real app, this might come from an API
      return [
        { 
          id: 'COD', 
          name: 'Thanh toán khi nhận hàng', 
          enabled: true,
          description: 'Thanh toán bằng tiền mặt khi nhận hàng',
          icon: 'fas fa-money-bill-wave'
        },
        { 
          id: 'BANK_TRANSFER', 
          name: 'Chuyển khoản ngân hàng', 
          enabled: true,
          description: 'Chuyển khoản trước khi giao hàng',
          icon: 'fas fa-university'
        },
        { 
          id: 'CREDIT_CARD', 
          name: 'Thẻ tín dụng', 
          enabled: false,
          description: 'Thanh toán bằng thẻ tín dụng (sắp ra mắt)',
          icon: 'fas fa-credit-card'
        },
        { 
          id: 'E_WALLET', 
          name: 'Ví điện tử', 
          enabled: false,
          description: 'Thanh toán qua ví điện tử (sắp ra mắt)',
          icon: 'fas fa-mobile-alt'
        }
      ];
    } catch (error) {
      console.error('Payment methods error:', error);
      return [
        { id: 'COD', name: 'Thanh toán khi nhận hàng', enabled: true }
      ];
    }
  },

  /**
   * Calculate shipping fee based on address and order value
   */
  calculateShippingFee: async (orderValue: number, address?: string): Promise<number> => {
    try {
      // Free shipping for orders above threshold
      if (orderValue >= config.SHIPPING.FREE_SHIPPING_THRESHOLD) {
        return 0;
      }

      // In a real app, this might calculate based on address
      // For now, return default shipping fee
      return config.SHIPPING.DEFAULT_SHIPPING_FEE;
    } catch (error) {
      console.error('Calculate shipping fee error:', error);
      return config.SHIPPING.DEFAULT_SHIPPING_FEE;
    }
  },

  /**
   * Get estimated delivery time
   */
  getEstimatedDelivery: async (address?: string): Promise<string> => {
    try {
      // Mock estimated delivery calculation
      const now = new Date();
      const deliveryDate = new Date(now);
      
      // Add 2-3 days for delivery
      deliveryDate.setDate(now.getDate() + Math.random() > 0.5 ? 2 : 3);
      
      return deliveryDate.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Get estimated delivery error:', error);
      return 'Không xác định';
    }
  },

  // src/api/CartAPI.js hoặc CartAPI.ts
  async getCartItemCount(token: string): Promise<number> {
    try {
      // Dùng endpoint đúng là /api/cards/count
      const res = await axios.get(`${BASE_URL}/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.count ?? 0;
    } catch (error) {
      console.error('Get cart count error:', error);
      return 0;
    }
  }
};

export default cartAPI;