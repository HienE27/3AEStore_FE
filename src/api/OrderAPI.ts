import axios from "axios";

export interface Order {
  id: string;
  orderApprovedAt: string | null;
  orderDeliveredCarrierDate: string | null;
  orderDeliveredCustomerDate: string | null;
  created_at: string;
  totalPrice: number;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  orderStatus?: {
    statusName: string;
  };
}

export interface OrderApiResponse {
  _embedded?: {
    orders: Order[];
  };
  orders?: Order[];
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface OrderStatistics {
  totalOrders: number;
  statusStatistics: { [key: string]: number };
  totalRevenue: number;
  averageOrderValue: number;
}

const ORDER_API_BASE = "http://localhost:8080/api/orders";

// Admin order management functions
export const fetchOrders = async (
  page: number = 1,
  size: number = 20,
  search: string = "",
  status?: string
): Promise<OrderApiResponse> => {
  try {
    const params: any = { page: page - 1, size };
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    
    const resp = await axios.get(`${ORDER_API_BASE}/admin/all`, { params });
    
    // Handle different response formats
    if (Array.isArray(resp.data)) {
      return {
        orders: resp.data,
        page: {
          size: resp.data.length,
          totalElements: resp.data.length,
          totalPages: 1,
          number: 0
        }
      };
    }
    
    return resp.data;
  } catch (error) {
    console.error('Fetch orders error:', error);
    return {
      orders: [],
      page: {
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0
      }
    };
  }
};

export const approveOrder = async (
  orderId: string,
  staffId: string
): Promise<Order> => {
  const resp = await axios.put(
    `${ORDER_API_BASE}/${orderId}/approve`,
    null,
    { params: { staffId } }
  );
  return resp.data;
};

export const markOrderAsShipped = async (
  orderId: string,
  staffId: string
): Promise<Order> => {
  const resp = await axios.put(
    `${ORDER_API_BASE}/${orderId}/ship`,
    null,
    { params: { staffId } }
  );
  return resp.data;
};

export const customerAcceptOrder = async (
  orderId: string
): Promise<Order> => {
  const resp = await axios.put(
    `${ORDER_API_BASE}/${orderId}/accept`
  );
  return resp.data;
};

// Enhanced order management functions
export const orderEnhancedAPI = {
  /**
   * Lấy thống kê đơn hàng
   */
  getOrderStatistics: async (dateRange?: { from: string; to: string }): Promise<OrderStatistics> => {
    try {
      const params = dateRange ? { 
        from: dateRange.from, 
        to: dateRange.to 
      } : {};
      
      const response = await axios.get(`${ORDER_API_BASE}/statistics`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get order statistics error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order statistics');
    }
  },

  /**
   * Duyệt nhiều đơn hàng cùng lúc
   */
  bulkApproveOrders: async (orderIds: string[], staffId: string) => {
    try {
      const promises = orderIds.map(orderId => 
        approveOrder(orderId, staffId)
      );
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return {
        success: true,
        message: `Duyệt thành công ${successful} đơn hàng${failed > 0 ? `, ${failed} đơn hàng thất bại` : ''}`
      };
    } catch (error: any) {
      console.error('Bulk approve error:', error);
      throw new Error('Bulk approve failed');
    }
  },

  /**
   * Xuất danh sách đơn hàng ra Excel
   */
  exportOrdersToExcel: async (filters: {
    status?: string;
    from?: string;
    to?: string;
    search?: string;
  }) => {
    try {
      // Simple CSV export implementation
      const orders = await fetchOrders(1, 1000, filters.search || '', filters.status);
      const ordersData = orders.orders || [];
      
      if (ordersData.length === 0) {
        throw new Error('Không có dữ liệu để xuất');
      }
      
      // Create CSV content
      const headers = ['Mã đơn hàng', 'Khách hàng', 'Email', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'];
      const csvContent = [
        headers.join(','),
        ...ordersData.map(order => [
          order.id,
          `"${order.customer?.first_name || ''} ${order.customer?.last_name || ''}"`,
          order.customer?.email || '',
          order.totalPrice,
          order.orderStatus?.statusName || '',
          new Date(order.created_at).toLocaleDateString('vi-VN')
        ].join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Export orders error:', error);
      throw new Error(error.message || 'Export failed');
    }
  }
};