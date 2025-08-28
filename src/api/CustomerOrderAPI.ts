import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Interfaces
export interface CustomerOrder {
  id: string;
  created_at: string;
  totalPrice: number;
  status: string;
  orderApprovedAt?: string;
  orderDeliveredCarrierDate?: string;
  orderDeliveredCustomerDate?: string;
  paymentMethod?: string;
  shippingAddress?: string;
  orderItems?: CustomerOrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface CustomerOrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderTracking {
  orderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  orderStatuses: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  description: string;
}

export interface CustomerOrdersResponse {
  _embedded: {
    orders: CustomerOrder[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Customer Order API functions
export const customerOrderAPI = {
  /**
   * Lấy danh sách đơn hàng của khách hàng
   */
  getCustomerOrders: async (
    customerId: string, 
    page: number = 1, 
    size: number = 10
  ): Promise<CustomerOrdersResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/customer/${customerId}`, {
        params: { page: page - 1, size }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get customer orders error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch customer orders');
    }
  },

  /**
   * Theo dõi trạng thái đơn hàng
   */
  trackOrder: async (orderId: string): Promise<OrderTracking> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/${orderId}/track`);
      return response.data;
    } catch (error: any) {
      console.error('Track order error:', error);
      throw new Error(error.response?.data?.message || 'Failed to track order');
    }
  },

  /**
   * Xác nhận đã nhận hàng
   */
  confirmReceipt: async (
    orderId: string, 
    customerId: string, 
    rating?: number, 
    review?: string
  ) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/orders/${orderId}/confirm-receipt`, {
        customerId,
        rating,
        review
      });
      return response.data;
    } catch (error: any) {
      console.error('Confirm receipt error:', error);
      throw new Error(error.response?.data?.message || 'Failed to confirm receipt');
    }
  },

  /**
   * Hủy đơn hàng (chỉ được phép khi đơn hàng chưa được duyệt)
   */
  cancelOrder: async (orderId: string, customerId: string, reason: string) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/orders/${orderId}/customer-cancel`, {
        customerId,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error('Cancel order error:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  /**
   * Lấy chi tiết đơn hàng cho khách hàng
   */
  getOrderDetail: async (orderId: string, customerId: string): Promise<CustomerOrder> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/${orderId}/track`);
      return response.data;
    } catch (error: any) {
      console.error('Get order detail error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order detail');
    }
  },

  /**
   * Lấy danh sách đơn hàng theo trạng thái
   */
  getOrdersByStatus: async (
    customerId: string,
    status: 'pending' | 'approved' | 'shipping' | 'delivered' | 'cancelled',
    page: number = 1,
    size: number = 10
  ) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/customer/${customerId}`, {
        params: { page: page - 1, size, status }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get orders by status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders by status');
    }
  },

  /**
   * Tìm kiếm đơn hàng của khách hàng
   */
  searchCustomerOrders: async (
    customerId: string,
    keyword: string,
    page: number = 1,
    size: number = 10
  ) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/customer/${customerId}`, {
        params: { keyword, page: page - 1, size }
      });
      return response.data;
    } catch (error: any) {
      console.error('Search customer orders error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search orders');
    }
  },

  /**
   * Lấy thống kê đơn hàng của khách hàng
   */
  getCustomerOrderStatistics: async (customerId: string) => {
    try {
      // Mock statistics for now
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0
      };
    } catch (error: any) {
      console.error('Get customer order statistics error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order statistics');
    }
  }
};

export default customerOrderAPI;