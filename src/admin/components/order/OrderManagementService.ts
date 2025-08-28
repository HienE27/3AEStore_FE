// src/services/OrderManagementService.ts - Fixed version
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/orders';

export interface OrderStatusUpdate {
  orderId: string;
  status: 'approve' | 'ship' | 'complete' | 'cancel';
  staffId: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  reason?: string;
  note?: string;
}

export interface BulkOrderAction {
  orderIds: string[];
  action: 'approve' | 'ship' | 'cancel';
  staffId: string;
  data?: {
    trackingNumber?: string;
    estimatedDelivery?: string;
    reason?: string;
  };
}

export interface OrderReportParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  customerId?: string;
}

export interface OrderReport {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: { [key: string]: number };
  paymentMethodBreakdown: { [key: string]: number };
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export class OrderManagementService {
  
  /**
   * Update order status with comprehensive tracking
   */
  static async updateOrderStatus(update: OrderStatusUpdate): Promise<any> {
    try {
      const { orderId, status, staffId, ...data } = update;
      
      let endpoint = '';
      let payload: any = { staffId, ...data };
      
      switch (status) {
        case 'approve':
          endpoint = `${BASE_URL}/${orderId}/approve`;
          break;
        case 'ship':
          endpoint = `${BASE_URL}/${orderId}/ship`;
          break;
        case 'complete':
          endpoint = `${BASE_URL}/${orderId}/complete`;
          break;
        case 'cancel':
          endpoint = `${BASE_URL}/${orderId}/cancel`;
          break;
        default:
          throw new Error('Invalid status update');
      }
      
      const response = await axios.put(endpoint, payload);
      
      // Log the action for audit trail
      await this.logOrderAction(orderId, status, staffId, data);
      
      return response.data;
    } catch (error: any) {
      console.error('Update order status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }

  /**
   * Bulk update orders
   */
  static async bulkUpdateOrders(bulkAction: BulkOrderAction): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const { orderIds, action, staffId, data } = bulkAction;
      
      const results = await Promise.allSettled(
        orderIds.map(orderId => 
          this.updateOrderStatus({
            orderId,
            status: action,
            staffId,
            ...data
          })
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason.message);
      
      return { successful, failed, errors };
    } catch (error: any) {
      console.error('Bulk update orders error:', error);
      throw new Error('Failed to perform bulk update');
    }
  }

  /**
   * Generate comprehensive order report
   */
  static async generateOrderReport(params: OrderReportParams): Promise<OrderReport> {
    try {
      const response = await axios.get(`${BASE_URL}/report`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Generate order report error:', error);
      throw new Error('Failed to generate order report');
    }
  }

  /**
   * Export orders to various formats
   */
  static async exportOrders(
    format: 'csv' | 'excel' | 'pdf',
    filters: any = {}
  ): Promise<void> {
    try {
      const response = await axios.get(`${BASE_URL}/export/${format}`, {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf';
      link.download = `orders_${timestamp}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export orders error:', error);
      throw new Error('Failed to export orders');
    }
  }

  /**
   * Get order analytics dashboard data
   */
  static async getOrderAnalytics(timeRange: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<{
    summary: {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      conversionRate: number;
    };
    trends: Array<{
      date: string;
      orders: number;
      revenue: number;
    }>;
    statusDistribution: { [key: string]: number };
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: number;
    }>;
    customerInsights: {
      newCustomers: number;
      returningCustomers: number;
      topCustomers: Array<{
        customerId: string;
        customerName: string;
        totalOrders: number;
        totalSpent: number;
      }>;
    };
  }> {
    try {
      const response = await axios.get(`${BASE_URL}/analytics`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get order analytics error:', error);
      throw new Error('Failed to fetch order analytics');
    }
  }

  /**
   * Log order actions for audit trail
   */
  private static async logOrderAction(
    orderId: string,
    action: string,
    staffId: string,
    data: any = {}
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/${orderId}/log`, {
        action,
        staffId,
        timestamp: new Date().toISOString(),
        data
      });
    } catch (error) {
      // Don't throw error for logging failures
      console.warn('Failed to log order action:', error);
    }
  }

  /**
   * Get delivery tracking information
   */
  static async getDeliveryTracking(orderId: string): Promise<{
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
    events: Array<{
      timestamp: string;
      location: string;
      description: string;
      status: string;
    }>;
  }> {
    try {
      const response = await axios.get(`${BASE_URL}/${orderId}/tracking`);
      return response.data;
    } catch (error: any) {
      console.error('Get delivery tracking error:', error);
      throw new Error('Failed to fetch delivery tracking information');
    }
  }

  /**
   * Process order refund
   */
  static async processRefund(
    orderId: string,
    refundData: {
      amount: number;
      reason: string;
      staffId: string;
      refundMethod: 'original' | 'bank_transfer' | 'cash';
      note?: string;
    }
  ): Promise<{
    refundId: string;
    status: string;
    processingTime: string;
  }> {
    try {
      const response = await axios.post(`${BASE_URL}/${orderId}/refund`, refundData);
      return response.data;
    } catch (error: any) {
      console.error('Process refund error:', error);
      throw new Error('Failed to process refund');
    }
    
  }

  
}

export default OrderManagementService;