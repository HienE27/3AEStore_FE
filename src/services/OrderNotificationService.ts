// src/services/OrderNotificationService.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_APPROVED = 'order_approved', 
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed'
}

export interface OrderNotification {
  id: string;
  customerId: string;
  orderId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// Fixed email template configuration
interface EmailTemplate {
  subject: string;
  template: string;
}

// Fixed SMS template type
type SMSTemplates = {
  [key in NotificationType]?: string;
};

export class OrderNotificationService {
  
  /**
   * Gửi thông báo khi tạo đơn hàng thành công
   */
  static async sendOrderCreatedNotification(
    customerId: string,
    orderId: string,
    orderTotal: number
  ): Promise<void> {
    try {
      const formatPrice = (price: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: NotificationType.ORDER_CREATED,
        title: 'Đặt hàng thành công',
        message: `Đơn hàng #${orderId.substring(0, 8)} trị giá ${formatPrice(orderTotal)} đã được tạo thành công. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.`,
        data: {
          orderId,
          orderTotal,
          actionUrl: `/profile/orders/${orderId}`
        }
      });

      // Gửi email thông báo
      await this.sendOrderEmailNotification(customerId, orderId, NotificationType.ORDER_CREATED, {
        orderTotal
      });
    } catch (error) {
      console.error('Failed to send order created notification:', error);
    }
  }

  /**
   * Gửi thông báo khi đơn hàng được duyệt
   */
  static async sendOrderApprovedNotification(
    customerId: string,
    orderId: string
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: NotificationType.ORDER_APPROVED,
        title: 'Đơn hàng đã được duyệt',
        message: `Đơn hàng #${orderId.substring(0, 8)} đã được duyệt và sẽ được chuẩn bị giao hàng trong thời gian sớm nhất.`,
        data: {
          orderId,
          actionUrl: `/profile/orders/${orderId}`
        }
      });

      await this.sendOrderEmailNotification(customerId, orderId, NotificationType.ORDER_APPROVED);
      await this.sendOrderSMSNotification(customerId, orderId, NotificationType.ORDER_APPROVED);
    } catch (error) {
      console.error('Failed to send order approved notification:', error);
    }
  }

  /**
   * Gửi thông báo khi đơn hàng được giao
   */
  static async sendOrderShippedNotification(
    customerId: string,
    orderId: string,
    trackingNumber?: string
  ): Promise<void> {
    try {
      const message = trackingNumber 
        ? `Đơn hàng #${orderId.substring(0, 8)} đã được giao cho đơn vị vận chuyển. Mã vận đơn: ${trackingNumber}. Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi".`
        : `Đơn hàng #${orderId.substring(0, 8)} đã được giao cho đơn vị vận chuyển. Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi".`;

      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: NotificationType.ORDER_SHIPPED,
        title: 'Đơn hàng đang được giao',
        message,
        data: {
          orderId,
          trackingNumber,
          actionUrl: `/profile/orders/${orderId}`
        }
      });

      await this.sendOrderEmailNotification(customerId, orderId, NotificationType.ORDER_SHIPPED, {
        trackingNumber
      });
      await this.sendOrderSMSNotification(customerId, orderId, NotificationType.ORDER_SHIPPED, {
        trackingNumber
      });
    } catch (error) {
      console.error('Failed to send order shipped notification:', error);
    }
  }

  /**
   * Gửi thông báo khi đơn hàng được giao thành công
   */
  static async sendOrderDeliveredNotification(
    customerId: string,
    orderId: string
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: NotificationType.ORDER_DELIVERED,
        title: 'Đơn hàng đã được giao thành công',
        message: `Đơn hàng #${orderId.substring(0, 8)} đã được giao thành công. Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng. Hãy đánh giá sản phẩm để giúp chúng tôi cải thiện dịch vụ.`,
        data: {
          orderId,
          actionUrl: `/profile/orders/${orderId}/review`
        }
      });

      await this.sendOrderEmailNotification(customerId, orderId, NotificationType.ORDER_DELIVERED);
    } catch (error) {
      console.error('Failed to send order delivered notification:', error);
    }
  }

  /**
   * Gửi thông báo khi đơn hàng bị hủy
   */
  static async sendOrderCancelledNotification(
    customerId: string,
    orderId: string,
    reason?: string
  ): Promise<void> {
    try {
      const message = reason 
        ? `Đơn hàng #${orderId.substring(0, 8)} đã bị hủy. Lý do: ${reason}. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.`
        : `Đơn hàng #${orderId.substring(0, 8)} đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.`;

      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: NotificationType.ORDER_CANCELLED,
        title: 'Đơn hàng đã bị hủy',
        message,
        data: {
          orderId,
          reason,
          actionUrl: `/contact`
        }
      });

      await this.sendOrderEmailNotification(customerId, orderId, NotificationType.ORDER_CANCELLED, {
        reason
      });
    } catch (error) {
      console.error('Failed to send order cancelled notification:', error);
    }
  }

  /**
   * Gửi email thông báo đơn hàng
   */
  private static async sendOrderEmailNotification(
    customerId: string,
    orderId: string,
    type: NotificationType,
    additionalData?: any
  ): Promise<void> {
    try {
      // Fixed: Properly type the email templates
      const emailTemplates: Record<NotificationType, EmailTemplate> = {
        [NotificationType.ORDER_CREATED]: {
          subject: `Xác nhận đơn hàng #${orderId.substring(0, 8)}`,
          template: 'order_created'
        },
        [NotificationType.ORDER_APPROVED]: {
          subject: `Đơn hàng #${orderId.substring(0, 8)} đã được duyệt`,
          template: 'order_approved'
        },
        [NotificationType.ORDER_SHIPPED]: {
          subject: `Đơn hàng #${orderId.substring(0, 8)} đang được giao`,
          template: 'order_shipped'
        },
        [NotificationType.ORDER_DELIVERED]: {
          subject: `Đơn hàng #${orderId.substring(0, 8)} đã được giao thành công`,
          template: 'order_delivered'
        },
        [NotificationType.ORDER_CANCELLED]: {
          subject: `Đơn hàng #${orderId.substring(0, 8)} đã bị hủy`,
          template: 'order_cancelled'
        },
        [NotificationType.PAYMENT_SUCCESS]: {
          subject: `Thanh toán thành công đơn hàng #${orderId.substring(0, 8)}`,
          template: 'payment_success'
        },
        [NotificationType.PAYMENT_FAILED]: {
          subject: `Thanh toán thất bại đơn hàng #${orderId.substring(0, 8)}`,
          template: 'payment_failed'
        }
      };

      const emailConfig = emailTemplates[type];
      if (!emailConfig) return;

      await axios.post(`${BASE_URL}/api/notifications/email`, {
        customerId,
        subject: emailConfig.subject,
        templateId: emailConfig.template,
        templateData: {
          orderId,
          orderIdShort: orderId.substring(0, 8),
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Gửi SMS thông báo đơn hàng
   */
  private static async sendOrderSMSNotification(
    customerId: string,
    orderId: string,
    type: NotificationType,
    additionalData?: any
  ): Promise<void> {
    try {
      // Fixed: Properly type the SMS templates
      const smsTemplates: SMSTemplates = {
        [NotificationType.ORDER_APPROVED]: `Don hang #${orderId.substring(0, 8)} da duoc duyet va se duoc chuan bi giao hang.`,
        [NotificationType.ORDER_SHIPPED]: additionalData?.trackingNumber 
          ? `Don hang #${orderId.substring(0, 8)} dang duoc giao. Ma van don: ${additionalData.trackingNumber}`
          : `Don hang #${orderId.substring(0, 8)} dang duoc giao.`
      };

      const message = smsTemplates[type];
      if (!message) return;

      await axios.post(`${BASE_URL}/api/notifications/sms`, {
        customerId,
        message
      });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Lấy danh sách thông báo của khách hàng
   */
  static async getCustomerNotifications(
    customerId: string,
    page: number = 1,
    size: number = 20,
    unreadOnly: boolean = false
  ): Promise<{
    notifications: OrderNotification[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
  }> {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/${customerId}/notifications`, {
        params: { 
          page: page - 1, 
          size, 
          unreadOnly 
        }
      });

      const data = response.data;
      return {
        notifications: data._embedded?.notifications || [],
        totalPages: data.page?.totalPages || 1,
        totalElements: data.page?.totalElements || 0,
        currentPage: page
      };
    } catch (error) {
      console.error('Failed to get customer notifications:', error);
      return {
        notifications: [],
        totalPages: 1,
        totalElements: 0,
        currentPage: 1
      };
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await axios.put(`${BASE_URL}/api/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  static async markAllNotificationsAsRead(customerId: string): Promise<boolean> {
    try {
      await axios.put(`${BASE_URL}/api/customers/${customerId}/notifications/mark-all-read`);
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  static async getUnreadNotificationCount(customerId: string): Promise<number> {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/${customerId}/notifications/unread-count`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      return 0;
    }
  }

  /**
   * Xóa thông báo
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await axios.delete(`${BASE_URL}/api/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * Gửi thông báo nhắc nhở thanh toán
   */
  static async sendPaymentReminderNotification(
    customerId: string,
    orderId: string,
    daysOverdue: number
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: NotificationType.PAYMENT_FAILED,
        title: 'Nhắc nhở thanh toán',
        message: `Đơn hàng #${orderId.substring(0, 8)} chưa được thanh toán sau ${daysOverdue} ngày. Vui lòng thanh toán để chúng tôi có thể xử lý đơn hàng.`,
        data: {
          orderId,
          daysOverdue,
          actionUrl: `/profile/orders/${orderId}/payment`
        }
      });
    } catch (error) {
      console.error('Failed to send payment reminder notification:', error);
    }
  }

  /**
   * Gửi thông báo khuyến mãi liên quan đến đơn hàng
   */
  static async sendOrderRelatedPromotionNotification(
    customerId: string,
    promotionTitle: string,
    promotionMessage: string,
    promotionCode?: string
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        type: 'promotion',
        title: promotionTitle,
        message: promotionMessage,
        data: {
          promotionCode,
          actionUrl: '/products'
        }
      });
    } catch (error) {
      console.error('Failed to send promotion notification:', error);
    }
  }

  /**
   * Gửi thông báo yêu cầu đánh giá sản phẩm
   */
  static async sendProductReviewRequestNotification(
    customerId: string,
    orderId: string,
    productIds: string[]
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/api/notifications/send`, {
        customerId,
        orderId,
        type: 'system',
        title: 'Đánh giá sản phẩm',
        message: `Bạn đã nhận được sản phẩm từ đơn hàng #${orderId.substring(0, 8)}. Hãy dành vài phút để đánh giá sản phẩm và chia sẻ trải nghiệm của bạn.`,
        data: {
          orderId,
          productIds,
          actionUrl: `/profile/orders/${orderId}/review`
        }
      });
    } catch (error) {
      console.error('Failed to send review request notification:', error);
    }
  }

  /**
   * Cập nhật cài đặt thông báo của khách hàng
   */
  static async updateNotificationSettings(
    customerId: string,
    settings: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      orderUpdates: boolean;
      promotions: boolean;
      systemNotifications: boolean;
    }
  ): Promise<boolean> {
    try {
      await axios.put(`${BASE_URL}/api/customers/${customerId}/notification-settings`, settings);
      return true;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return false;
    }
  }

  /**
   * Lấy cài đặt thông báo của khách hàng
   */
  static async getNotificationSettings(customerId: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/${customerId}/notification-settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotions: false,
        systemNotifications: true
      };
    }
  }
}

export default OrderNotificationService;