// src/api/NotificationAPI.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Interfaces
export interface Notification {
  id: string;
  customerId: string;
  orderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any; // Additional data for notification
}

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_APPROVED = 'order_approved',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PROMOTION = 'promotion',
  SYSTEM = 'system'
}

export interface NotificationResponse {
  _embedded: {
    notifications: Notification[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Notification API functions
export const notificationAPI = {
  /**
   * Gửi thông báo đến khách hàng
   */
  sendOrderNotification: async (
    customerId: string, 
    orderId: string, 
    type: NotificationType,
    additionalData?: any
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type,
        additionalData
      });
      return response.data;
    } catch (error: any) {
      console.error('Send notification error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send notification' };
    }
  },

  /**
   * Lấy danh sách thông báo của khách hàng
   */
  getCustomerNotifications: async (
    customerId: string, 
    unreadOnly: boolean = false,
    page: number = 1,
    size: number = 20
  ): Promise<NotificationResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/${customerId}/notifications`, {
        params: { unreadOnly, page: page - 1, size }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get notifications error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead: async (notificationId: string) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to mark as read' };
    }
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async (customerId: string) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/customers/${customerId}/notifications/mark-all-read`);
      return response.data;
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to mark all as read' };
    }
  },

  /**
   * Xóa thông báo
   */
  deleteNotification: async (notificationId: string) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete notification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async (customerId: string): Promise<{ count: number }> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/${customerId}/notifications/unread-count`);
      return response.data;
    } catch (error: any) {
      console.error('Get unread count error:', error);
      return { count: 0 };
    }
  },

  /**
   * Cập nhật setting thông báo của khách hàng
   */
  updateNotificationSettings: async (
    customerId: string, 
    settings: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      orderUpdates: boolean;
      promotions: boolean;
      systemNotifications: boolean;
    }
  ) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/customers/${customerId}/notification-settings`, settings);
      return response.data;
    } catch (error: any) {
      console.error('Update notification settings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  },

  /**
   * Lấy setting thông báo của khách hàng
   */
  getNotificationSettings: async (customerId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/${customerId}/notification-settings`);
      return response.data;
    } catch (error: any) {
      console.error('Get notification settings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notification settings');
    }
  },

  /**
   * Gửi thông báo push (cho mobile app)
   */
  sendPushNotification: async (
    customerId: string,
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/notifications/push`, {
        customerId,
        title,
        message,
        data
      });
      return response.data;
    } catch (error: any) {
      console.error('Send push notification error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send push notification' };
    }
  },

  /**
   * Gửi email thông báo
   */
  sendEmailNotification: async (
    customerId: string,
    subject: string,
    htmlContent: string,
    templateId?: string,
    templateData?: any
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/notifications/email`, {
        customerId,
        subject,
        htmlContent,
        templateId,
        templateData
      });
      return response.data;
    } catch (error: any) {
      console.error('Send email notification error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send email notification' };
    }
  },

  /**
   * Gửi SMS thông báo
   */
  sendSMSNotification: async (
    customerId: string,
    message: string,
    phoneNumber?: string
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/notifications/sms`, {
        customerId,
        message,
        phoneNumber
      });
      return response.data;
    } catch (error: any) {
      console.error('Send SMS notification error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send SMS notification' };
    }
  },

  /**
   * Lấy template thông báo
   */
  getNotificationTemplates: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/notifications/templates`);
      return response.data;
    } catch (error: any) {
      console.error('Get notification templates error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notification templates');
    }
  },

  /**
   * Tạo thông báo bulk cho nhiều khách hàng
   */
  sendBulkNotification: async (
    customerIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/notifications/bulk`, {
        customerIds,
        type,
        title,
        message,
        data
      });
      return response.data;
    } catch (error: any) {
      console.error('Send bulk notification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send bulk notification');
    }
  }
};

export default notificationAPI;