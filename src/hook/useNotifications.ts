// src/hooks/useNotifications.ts - Fixed version
import { useState, useEffect, useCallback } from 'react';
// Fixed: Import OrderNotificationService correctly
import OrderNotificationService, { OrderNotification } from '../services/OrderNotificationService';
import { getIdUserByToken } from '../utils/JwtService';

interface NotificationState {
  notifications: OrderNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    pageSize = 20
  } = options;

  const customerId = getIdUserByToken() || '';

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1
  });

  // Load notifications
  const loadNotifications = useCallback(async (
    page: number = 1,
    unreadOnly: boolean = false
  ) => {
    if (!customerId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await OrderNotificationService.getCustomerNotifications(
        customerId,
        page,
        pageSize,
        unreadOnly
      );

      setState(prev => ({
        ...prev,
        notifications: page === 1 ? result.notifications : [...prev.notifications, ...result.notifications],
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Không thể tải thông báo',
        loading: false
      }));
    }
  }, [customerId, pageSize]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!customerId) return;

    try {
      const count = await OrderNotificationService.getUnreadNotificationCount(customerId);
      setState(prev => ({ ...prev, unreadCount: count }));
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, [customerId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await OrderNotificationService.markNotificationAsRead(notificationId);
    
    if (success) {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    }

    return success;
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!customerId) return false;

    const success = await OrderNotificationService.markAllNotificationsAsRead(customerId);
    
    if (success) {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      }));
    }

    return success;
  }, [customerId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    const success = await OrderNotificationService.deleteNotification(notificationId);
    
    if (success) {
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    }

    return success;
  }, []);

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (state.currentPage < state.totalPages && !state.loading) {
      loadNotifications(state.currentPage + 1);
    }
  }, [state.currentPage, state.totalPages, state.loading, loadNotifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    loadNotifications(1);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial load
  useEffect(() => {
    if (customerId) {
      loadNotifications(1);
      loadUnreadCount();
    }
  }, [customerId, loadNotifications, loadUnreadCount]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !customerId) return;

    const interval = setInterval(() => {
      loadUnreadCount();
      // Only refresh first page if user is on first page
      if (state.currentPage === 1) {
        loadNotifications(1);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, customerId, refreshInterval, state.currentPage, loadNotifications, loadUnreadCount]);

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    hasMore: state.currentPage < state.totalPages,
    
    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
    clearError
  };
};

// Hook for notification settings
export const useNotificationSettings = () => {
  const customerId = getIdUserByToken() || '';
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await OrderNotificationService.getNotificationSettings(customerId);
      setSettings(result);
    } catch (error: any) {
      setError(error.message || 'Không thể tải cài đặt thông báo');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const updateSettings = useCallback(async (newSettings: any) => {
    if (!customerId) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await OrderNotificationService.updateNotificationSettings(customerId, newSettings);
      if (success) {
        setSettings(newSettings);
      }
      return success;
    } catch (error: any) {
      setError(error.message || 'Không thể cập nhật cài đặt');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings
  };
};

// Hook for real-time notifications (WebSocket or Server-Sent Events)
export const useRealTimeNotifications = () => {
  const customerId = getIdUserByToken() || '';
  const [connected, setConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<OrderNotification | null>(null);

  useEffect(() => {
    if (!customerId) return;

    // Simple polling implementation (replace with WebSocket in production)
    let lastCheck = Date.now();
    
    const checkForNewNotifications = async () => {
      try {
        const result = await OrderNotificationService.getCustomerNotifications(customerId, 1, 1);
        
        if (result.notifications.length > 0) {
          const latestNotification = result.notifications[0];
          const notificationTime = new Date(latestNotification.createdAt).getTime();
          
          if (notificationTime > lastCheck) {
            setNewNotification(latestNotification);
            lastCheck = notificationTime;
          }
        }
      } catch (error) {
        console.error('Failed to check for new notifications:', error);
      }
    };

    const interval = setInterval(checkForNewNotifications, 10000); // Check every 10 seconds
    setConnected(true);

    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, [customerId]);

  const clearNewNotification = useCallback(() => {
    setNewNotification(null);
  }, []);

  return {
    connected,
    newNotification,
    clearNewNotification
  };
};

// Hook for notification toast
export const useNotificationToast = () => {
  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 5000
  ) => {
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed`;
    toast.style.cssText = `
      top: 20px; 
      right: 20px; 
      z-index: 9999; 
      min-width: 300px;
      background-color: ${type === 'success' ? '#d1edff' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
      border: 1px solid ${type === 'success' ? '#b6d7ff' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
      color: ${type === 'success' ? '#0c5460' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    `;

    toast.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-${
          type === 'success' ? 'check-circle' : 
          type === 'error' ? 'exclamation-circle' : 
          type === 'warning' ? 'exclamation-triangle' : 
          'info-circle'
        } me-2"></i>
        <span class="flex-grow-1">${message}</span>
        <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);

    return toast;
  }, []);

  const showOrderNotification = useCallback((notification: OrderNotification) => {
    const toast = document.createElement('div');
    toast.className = 'toast show position-fixed';
    toast.style.cssText = `
      top: 20px; 
      right: 20px; 
      z-index: 9999; 
      min-width: 350px;
      background-color: #fff;
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      padding: 0;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      cursor: pointer;
    `;

    toast.innerHTML = `
      <div class="toast-header bg-primary text-white">
        <i class="fas fa-bell me-2"></i>
        <strong class="me-auto">${notification.title}</strong>
        <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
      <div class="toast-body">
        <p class="mb-2">${notification.message}</p>
        <small class="text-muted">
          <i class="fas fa-clock me-1"></i>
          ${new Date(notification.createdAt).toLocaleString('vi-VN')}
        </small>
      </div>
    `;

    // Click to navigate to order
    toast.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).classList.contains('btn-close')) {
        if (notification.data?.actionUrl) {
          window.location.href = notification.data.actionUrl;
        }
        toast.remove();
      }
    });

    document.body.appendChild(toast);

    // Auto remove after 8 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 8000);

    return toast;
  }, []);

  return {
    showToast,
    showOrderNotification
  };
};

export default useNotifications;