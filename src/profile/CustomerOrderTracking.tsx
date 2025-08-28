import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Clock, CheckCircle, Package, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import { getIdUserByToken, getUsernameByToken, isToken } from '../utils/JwtService';
import { config } from '../config/environment';
import SidebarProfile from './SidebarProfile';

interface CustomerOrder {
  id: string;
  created_at: string;
  totalPrice: number;
  status: string;
  orderApprovedAt?: string;
  orderDeliveredCarrierDate?: string;
  orderDeliveredCustomerDate?: string;
  paymentMethod?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  phoneNumber?: string;
  note?: string;
  orderItems?: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderTracking {
  orderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  orderStatuses: OrderStatusHistory[];
}

interface OrderStatusHistory {
  status: string;
  timestamp: string;
  description: string;
}

interface CustomerInfo {
  email?: string;
  actualCustomerId?: string;
  userRole?: string;
  [key: string]: any;
}

const CustomerOrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trackingLoading, setTrackingLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [actualCustomerId, setActualCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showTrackingModal, setShowTrackingModal] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<OrderItem[]>([]);

  const customerId = getIdUserByToken() || '';
  const customerEmail = getUsernameByToken(); // username is email
  const API_BASE = config.API_BASE_URL + "/api/orders";

  // Format functions using config
  const formatPrice = (price: number): string =>
    new Intl.NumberFormat(config.LOCALE, { style: "currency", currency: config.CURRENCY }).format(price);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(config.LOCALE);
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString(config.LOCALE);
    } catch {
      return 'N/A';
    }
  };

  const getOrderStatusBadge = (status: string): React.ReactElement => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'pending':
        return (
          <span className="badge bg-warning text-dark d-inline-flex align-items-center">
            <i className="fas fa-clock me-1"></i>
            Chờ xử lý
          </span>
        );
      case 'approved':
        return (
          <span className="badge bg-info text-white d-inline-flex align-items-center">
            <i className="fas fa-check me-1"></i>
            Đã duyệt
          </span>
        );
      case 'shipped':
      case 'shipping':
        return (
          <span className="badge bg-primary text-white d-inline-flex align-items-center">
            <i className="fas fa-truck me-1"></i>
            Đang giao
          </span>
        );
      case 'delivered':
        return (
          <span className="badge bg-success text-white d-inline-flex align-items-center">
            <i className="fas fa-box me-1"></i>
            Đã giao
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge bg-danger text-white d-inline-flex align-items-center">
            <i className="fas fa-times me-1"></i>
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary text-white">
            {status}
          </span>
        );
    }
  };

  // Validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Safe API call with config timeout
  const safeApiCall = async (url: string, options: RequestInit = {}): Promise<{ data: any; status: number }> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textResponse = await response.text();
        try {
          responseData = JSON.parse(textResponse);
        } catch {
          responseData = { message: textResponse };
        }
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      return { data: responseData, status: response.status };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.');
      }
      throw error;
    }
  };

  const findCustomerByEmail = async (): Promise<string | null> => {
    if (!customerEmail) return null;

    try {
      try {
        // BE uses /email/ not /by-email/
        const { data } = await safeApiCall(`${config.API_BASE_URL}/api/customers/email/${encodeURIComponent(customerEmail)}`);
        return data.id;
      } catch (error) {
        try {
          const { data } = await safeApiCall(`${config.API_BASE_URL}/api/customers/search?email=${encodeURIComponent(customerEmail)}`);
          if (data.count > 0 && data.customers && data.customers.length > 0) {
            return data.customers[0].id;
          }
        } catch (error) {
          // Fallback error handling
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding customer by email:', error);
      return null;
    }
  };

  const initializeCustomer = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      let customerIdToUse: string | null = customerId;

      if (!customerIdToUse || !isValidUUID(customerIdToUse)) {
        customerIdToUse = await findCustomerByEmail();
      }

      if (!customerIdToUse) {
        setError('Không thể xác định thông tin khách hàng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      setActualCustomerId(customerIdToUse);

      // Set customer info from token
      if (isToken()) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            setCustomerInfo({
              email: decoded.sub || decoded.email,
              actualCustomerId: customerIdToUse
            });
          } catch (e) {
            console.error('Error decoding token for display:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing customer:', error);
      setError('Có lỗi xảy ra khi khởi tạo thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (): Promise<void> => {
    if (!actualCustomerId) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${API_BASE}/customer/${actualCustomerId}?page=${currentPage - 1}&size=10`;
      try {
        const { data } = await safeApiCall(apiUrl);
        if (data && (data._embedded?.orders || data.orders || Array.isArray(data))) {
          processOrdersResponse(data);
          return;
        } else {
          throw new Error('Empty response from main endpoint');
        }
      } catch (mainError: any) {
        if (customerEmail) {
          try {
            const fallbackUrl = `${API_BASE}/customer/by-email/${encodeURIComponent(customerEmail)}?page=${currentPage - 1}&size=10`;
            const { data } = await safeApiCall(fallbackUrl);
            if (data && (data._embedded?.orders || data.orders || Array.isArray(data))) {
              processOrdersResponse(data);
              return;
            } else {
              throw new Error('Empty response from email fallback');
            }
          } catch (fallbackError: any) {
            throw fallbackError;
          }
        } else {
          throw mainError;
        }
      }
    } catch (error: any) {
      setError(`Không thể tải đơn hàng: ${error.message || 'Có lỗi không xác định xảy ra'}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const processOrdersResponse = (data: any): void => {
    try {
      let ordersArray: any[] = [];
      let paginationInfo: any = null;

      if (data._embedded && data._embedded.orders && Array.isArray(data._embedded.orders)) {
        ordersArray = data._embedded.orders;
        paginationInfo = data.page;
      } else if (data.orders && Array.isArray(data.orders)) {
        ordersArray = data.orders;
        paginationInfo = data.page;
      } else if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data && typeof data === 'object') {
        const possibleOrderKeys = ['orders', 'data', 'content', 'results'];
        for (const key of possibleOrderKeys) {
          if (data[key] && Array.isArray(data[key])) {
            ordersArray = data[key];
            break;
          }
        }
      }

      if (ordersArray.length === 0) {
        setOrders([]);
        setTotalPages(1);
        return;
      }

      const ordersData = ordersArray.map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        totalPrice: order.totalPrice || 0,
        status: order.status || 'unknown',
        orderApprovedAt: order.orderApprovedAt,
        orderDeliveredCarrierDate: order.orderDeliveredCarrierDate,
        orderDeliveredCustomerDate: order.orderDeliveredCustomerDate,
        paymentMethod: order.paymentMethod || 'COD',
        shippingAddress: order.shippingAddress || '',
        trackingNumber: order.trackingNumber,
        phoneNumber: order.phoneNumber,
        note: order.note,
        orderItems: order.orderItems || []
      }));

      setOrders(ordersData);
      if (paginationInfo) {
        setTotalPages(paginationInfo.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      setOrders([]);
      setTotalPages(1);
    }
  };

  const loadOrderDetails = async (orderId: string): Promise<void> => {
    try {
      const { data } = await safeApiCall(`${API_BASE}/${orderId}/details`);
      setOrderDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      setOrderDetails([]);
    }
  };

  const debugTokenInfo = async (): Promise<void> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = window.localStorage?.getItem('token') || window.sessionStorage?.getItem('token');
    }
    
    let debugMessage = `=== COMPLETE DEBUG INFO ===\n\nFRONTEND:\nToken exists: ${!!token}\nCustomer ID from token: ${customerId}\nEmail from token: ${customerEmail}\nActual ID used: ${actualCustomerId}\n\n`;
    
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setCustomerInfo(decoded);
        debugMessage += `Token payload:\n${JSON.stringify(decoded, null, 2)}\n\n`;
        
        if (actualCustomerId) {
          try {
            const { data: debugData } = await safeApiCall(`${config.API_BASE_URL}/api/orders/debug/customer/${actualCustomerId}`);
            debugMessage += `BACKEND DEBUG:\n${JSON.stringify(debugData, null, 2)}\n\n`;
          } catch (debugError: any) {
            debugMessage += `Debug endpoint error: ${debugError.message}\n\n`;
          }
          
          try {
            const { data: ordersData } = await safeApiCall(`${API_BASE}/customer/${actualCustomerId}?page=0&size=1`);
            debugMessage += `ORDERS API RESPONSE:\n${JSON.stringify(ordersData, null, 2)}\n\n`;
          } catch (ordersError: any) {
            debugMessage += `Orders API error: ${ordersError.message}\n\n`;
          }
          
          if (customerEmail) {
            try {
              const { data: searchData } = await safeApiCall(`${config.API_BASE_URL}/api/customers/search?email=${encodeURIComponent(customerEmail)}`);
              debugMessage += `CUSTOMER SEARCH:\n${JSON.stringify(searchData, null, 2)}\n\n`;
            } catch (searchError: any) {
              debugMessage += `Customer search error: ${searchError.message}\n\n`;
            }
          }
        }
        
        debugMessage += `\nCURRENT STATE:\nOrders count: ${orders.length}\nLoading: ${loading}\nError: ${error || 'None'}\nCurrent Page: ${currentPage}\nTotal Pages: ${totalPages}`;
        
        console.log(debugMessage);
        alert(debugMessage);
      } catch (e) {
        const errorMsg = 'Could not decode token: ' + e;
        alert(errorMsg);
      }
    } else {
      alert('No token found in localStorage or sessionStorage');
    }
  };

  const trackOrder = async (orderId: string): Promise<void> => {
    setTrackingLoading(true);
    try {
      const { data: trackingData } = await safeApiCall(`${API_BASE}/${orderId}/track`);
      setSelectedOrder(trackingData);
      setShowTrackingModal(true);
    } catch (error: any) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const mockTracking: OrderTracking = {
          orderId,
          status: order.status,
          trackingNumber: order.trackingNumber || 'VN' + orderId.substring(0, 8).toUpperCase(),
          estimatedDelivery: order.orderDeliveredCarrierDate ? 
            new Date(new Date(order.orderDeliveredCarrierDate).getTime() + 24 * 60 * 60 * 1000).toISOString() : 
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          orderStatuses: generateOrderStatusHistory(order)
        };
        setSelectedOrder(mockTracking);
        setShowTrackingModal(true);
      } else {
        alert('Không thể tải thông tin theo dõi đơn hàng');
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  const generateOrderStatusHistory = (order: CustomerOrder): OrderStatusHistory[] => {
    const history: OrderStatusHistory[] = [
      {
        status: 'created',
        timestamp: order.created_at,
        description: 'Đơn hàng đã được tạo'
      }
    ];

    if (order.orderApprovedAt) {
      history.push({
        status: 'approved',
        timestamp: order.orderApprovedAt,
        description: 'Đơn hàng đã được duyệt'
      });
    }

    if (order.orderDeliveredCarrierDate) {
      history.push({
        status: 'shipped',
        timestamp: order.orderDeliveredCarrierDate,
        description: 'Đơn hàng đã được giao cho vận chuyển'
      });
    }

    if (order.orderDeliveredCustomerDate) {
      history.push({
        status: 'delivered',
        timestamp: order.orderDeliveredCustomerDate,
        description: 'Đơn hàng đã được giao thành công'
      });
    }

    return history;
  };

  const confirmReceipt = async (orderId: string): Promise<void> => {
    const confirmAction = window.confirm('Xác nhận bạn đã nhận được đơn hàng này?');
    if (!confirmAction) return;
    
    setActionLoading(orderId);
    try {
      const { data: result } = await safeApiCall(`${API_BASE}/${orderId}/confirm-receipt`, {
        method: 'PUT',
        body: JSON.stringify({
          customerId: actualCustomerId,
          rating: 5,
          review: 'Đã nhận hàng'
        })
      });
      
      if (result.success) {
        alert('Xác nhận nhận hàng thành công!');
        await loadCustomerOrders();
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      alert('Có lỗi xảy ra khi xác nhận nhận hàng: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const cancelOrder = async (orderId: string): Promise<void> => {
    const reason = prompt('Lý do hủy đơn hàng:');
    if (!reason || !reason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng!');
      return;
    }
    
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    setActionLoading(orderId);
    try {
      const { data: result } = await safeApiCall(`${API_BASE}/${orderId}/customer-cancel`, {
        method: 'PUT',
        body: JSON.stringify({
          customerId: actualCustomerId,
          reason: reason.trim()
        })
      });
      
      if (result.success) {
        alert('Hủy đơn hàng thành công!');
        await loadCustomerOrders();
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      alert('Có lỗi xảy ra khi hủy đơn hàng: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const viewOrderDetails = async (order: CustomerOrder): Promise<void> => {
    setSelectedOrderDetails(order);
    setShowOrderModal(true);
    await loadOrderDetails(order.id);
  };

  const getFilteredOrders = (): CustomerOrder[] => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => !order.orderApprovedAt);
      case 'shipping':
        return orders.filter(order => order.orderApprovedAt && !order.orderDeliveredCustomerDate);
      case 'completed':
        return orders.filter(order => order.orderDeliveredCustomerDate);
      default:
        return orders;
    }
  };

  const canConfirmReceipt = (order: CustomerOrder): boolean => {
    return !!(order.orderDeliveredCarrierDate && !order.orderDeliveredCustomerDate && 
           order.status.toLowerCase() === 'shipped');
  };

  const canCancel = (order: CustomerOrder): boolean => {
    return !!((!order.orderApprovedAt && order.status.toLowerCase() === 'pending'));
  };

  useEffect(() => {
    initializeCustomer();
  }, []);

  useEffect(() => {
    if (actualCustomerId) {
      loadCustomerOrders();
    }
  }, [actualCustomerId]);

  useEffect(() => {
    if (actualCustomerId && currentPage > 1) {
      loadCustomerOrders();
    }
  }, [currentPage]);

  if (loading && !actualCustomerId) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Đang khởi tạo thông tin khách hàng...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="card shadow-lg border-0" style={{ maxWidth: '400px' }}>
            <div className="card-body p-4">
              <div className="text-danger mb-3">
                <AlertCircle size={48} />
              </div>
              <h4 className="card-title text-danger mb-3">Có lỗi xảy ra</h4>
              <p className="text-muted mb-4">{error}</p>
              <div className="d-grid gap-2">
                <button
                  onClick={initializeCustomer}
                  className="btn btn-primary"
                >
                  <RefreshCw size={16} className="me-2" />
                  Thử lại
                </button>
                <button
                  onClick={debugTokenInfo}
                  className="btn btn-outline-secondary"
                >
                  🐛 Xem thông tin debug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom CSS for enhanced styling */}
      <style>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-icon {
          position: absolute;
          left: -23px;
          top: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        .timeline-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #0d6efd;
        }
        .card-hover {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .status-timeline {
          position: relative;
          padding: 20px 0;
        }
        .nav-pills .nav-link {
          border-radius: 20px;
          margin-right: 10px;
          padding: 8px 20px;
        }
        .order-card {
          border: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
        }
        .btn-group-custom .btn {
          margin-right: 8px;
          margin-bottom: 8px;
        }
        .customer-info-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }
      `}</style>

      {/* Section Pagetop */}
      <section className="bg-light py-4">
        <div className="container">
          <div className="row">
            <div className="col">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                  <li className="breadcrumb-item active">Tài khoản của tôi</li>
                </ol>
              </nav>
              <h2 className="h3 mt-2 mb-0 fw-bold text-dark">Tài khoản của tôi</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Section Content */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
<div className="col-lg-3 col-md-4 mb-4">
    <SidebarProfile />
  </div>
                  
               
              
            

            {/* Main Content */}
            <div className="col-lg-9 col-md-8">
              <div className="card border-0 shadow-sm order-card">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex align-items-center">
                    <ShoppingBag size={24} className="text-primary me-3" />
                    <h4 className="mb-0 fw-bold">Đơn hàng của tôi</h4>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={debugTokenInfo}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      🐛 Debug
                    </button>
                    <button
                      onClick={loadCustomerOrders}
                      className="btn btn-outline-primary btn-sm d-flex align-items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <RefreshCw size={16} className="me-2" />
                      )}
                      Tải lại
                    </button>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Customer Info */}
                  {customerInfo && (
                    <div className="customer-info-card p-4 mb-4">
                      <h6 className="text-white mb-3">
                        <i className="fas fa-user-circle me-2"></i>
                        Thông tin khách hàng
                      </h6>
                      <div className="row text-sm">
                        <div className="col-md-6 mb-2">
                          <strong>Email:</strong> {customerInfo.email || 'N/A'}
                        </div>
                        <div className="col-md-6 mb-2">
                          <strong>Customer ID:</strong> {customerInfo.actualCustomerId || actualCustomerId}
                        </div>
                        <div className="col-md-6 mb-2">
                          <strong>Tổng đơn hàng:</strong> {orders.length}
                        </div>
                        <div className="col-md-6 mb-2">
                          <strong>Role:</strong> {customerInfo.userRole || 'Customer'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Tabs */}
                  <div className="mb-4">
                    <ul className="nav nav-pills">
                      {[
                        { key: 'all', label: 'Tất cả', count: orders.length, icon: 'fas fa-list' },
                        { key: 'pending', label: 'Chờ xử lý', count: orders.filter(o => !o.orderApprovedAt).length, icon: 'fas fa-clock' },
                        { key: 'shipping', label: 'Đang giao', count: orders.filter(o => o.orderApprovedAt && !o.orderDeliveredCustomerDate).length, icon: 'fas fa-truck' },
                        { key: 'completed', label: 'Đã hoàn thành', count: orders.filter(o => o.orderDeliveredCustomerDate).length, icon: 'fas fa-check-circle' }
                      ].map(tab => (
                        <li key={tab.key} className="nav-item">
                          <button
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                          >
                            <i className={`${tab.icon} me-2`}></i>
                            {tab.label} ({tab.count})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Orders Content */}
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <h5 className="text-muted">Đang tải danh sách đơn hàng...</h5>
                    </div>
                  ) : !actualCustomerId ? (
                    <div className="text-center py-5">
                      <AlertCircle size={48} className="text-muted mb-3" />
                      <h4 className="text-dark mb-3">Bạn cần đăng nhập</h4>
                      <p className="text-muted mb-4">Vui lòng đăng nhập để xem đơn hàng của bạn</p>
                      <Link to="/login" className="btn btn-primary">
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Đăng nhập ngay
                      </Link>
                    </div>
                  ) : getFilteredOrders().length === 0 ? (
                    <div className="text-center py-5">
                      <Package size={48} className="text-muted mb-3" />
                      <h4 className="text-dark mb-3">
                        {activeTab === 'all' ? 'Bạn chưa có đơn hàng nào' : `Không có đơn hàng ở trạng thái này`}
                      </h4>
                      <p className="text-muted mb-4">
                        {activeTab === 'all' ? 'Hãy tiếp tục mua sắm để tạo đơn hàng đầu tiên' : 'Hãy kiểm tra các tab khác'}
                      </p>
                      {activeTab === 'all' && (
                        <Link to="/products" className="btn btn-primary">
                          <ShoppingBag size={16} className="me-2" />
                          Mua sắm ngay
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="orders-list">
                      {getFilteredOrders().map(order => (
                        <div key={order.id} className="card border order-card card-hover mb-4">
                          <div className="card-body">
                            {/* Order Header */}
                            <div className="row align-items-center mb-3">
                              <div className="col-md-8">
                                <div className="d-flex align-items-center mb-2">
                                  <strong className="me-3">
                                    <i className="fas fa-receipt me-2 text-primary"></i>
                                    Mã đơn hàng: #{order.id.substring(0, 8).toUpperCase()}
                                  </strong>
                                  <small className="text-muted">
                                    <i className="fas fa-calendar me-1"></i>
                                    {formatDate(order.created_at)}
                                  </small>
                                </div>
                                <div>{getOrderStatusBadge(order.status)}</div>
                              </div>
                              <div className="col-md-4 text-md-end">
                                <h5 className="mb-0 text-primary fw-bold">{formatPrice(order.totalPrice)}</h5>
                              </div>
                            </div>

                            {/* Order Info */}
                            <div className="row mb-3">
                              <div className="col-md-8">
                                <h6 className="text-muted mb-2">
                                  <i className="fas fa-shipping-fast me-2"></i>
                                  Thông tin giao hàng
                                </h6>
                                <div className="small">
                                  <div className="mb-1">
                                    <i className="fas fa-envelope me-2 text-muted"></i>
                                    {customerInfo?.email || 'N/A'}
                                  </div>
                                  {order.phoneNumber && (
                                    <div className="mb-1">
                                      <i className="fas fa-phone me-2 text-muted"></i>
                                      {order.phoneNumber}
                                    </div>
                                  )}
                                  <div className="mb-1">
                                    <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                                    {order.shippingAddress || 'Chưa cập nhật địa chỉ'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <h6 className="text-muted mb-2">
                                  <i className="fas fa-credit-card me-2"></i>
                                  Thanh toán
                                </h6>
                                <div className="small">
                                  <div className="mb-1">
                                    <i className="fas fa-money-bill me-2 text-muted"></i>
                                    {order.paymentMethod || 'COD'}
                                  </div>
                                  <div className="fw-bold text-success">
                                    <i className="fas fa-calculator me-2"></i>
                                    Tổng: {formatPrice(order.totalPrice)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            {order.orderItems && order.orderItems.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-muted mb-2">
                                  <i className="fas fa-box me-2"></i>
                                  Sản phẩm
                                </h6>
                                <div className="table-responsive">
                                  <table className="table table-sm table-borderless">
                                    <tbody>
                                      {order.orderItems.slice(0, 3).map(item => (
                                        <tr key={item.id}>
                                          <td className="ps-0">
                                            <div className="d-flex align-items-center">
                                              <div className="bg-light rounded p-2 me-3" style={{ width: '40px', height: '40px' }}>
                                                <i className="fas fa-cube text-muted"></i>
                                              </div>
                                              <div>
                                                <div className="fw-medium">{item.productName}</div>
                                                <small className="text-muted">Số lượng: {item.quantity}</small>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="text-end pe-0">
                                            <span className="fw-bold">{formatPrice(item.total)}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {order.orderItems.length > 3 && (
                                    <div className="text-center">
                                      <small className="text-muted fst-italic">
                                        và {order.orderItems.length - 3} sản phẩm khác...
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="btn btn-outline-primary btn-sm"
                              >
                                <Package size={16} className="me-1" />
                                Chi tiết
                              </button>
                              
                              <button
                                onClick={() => trackOrder(order.id)}
                                disabled={trackingLoading}
                                className="btn btn-outline-info btn-sm"
                              >
                                {trackingLoading ? (
                                  <div className="spinner-border spinner-border-sm me-1" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                ) : (
                                  <MapPin size={16} className="me-1" />
                                )}
                                Theo dõi
                              </button>

                              {canConfirmReceipt(order) && (
                                <button
                                  onClick={() => confirmReceipt(order.id)}
                                  disabled={actionLoading === order.id}
                                  className="btn btn-success btn-sm"
                                >
                                  {actionLoading === order.id ? (
                                    <div className="spinner-border spinner-border-sm me-1" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  ) : (
                                    <CheckCircle size={16} className="me-1" />
                                  )}
                                  Đã nhận
                                </button>
                              )}

                              {canCancel(order) && (
                                <button
                                  onClick={() => cancelOrder(order.id)}
                                  disabled={actionLoading === order.id}
                                  className="btn btn-danger btn-sm"
                                >
                                  {actionLoading === order.id ? (
                                    <div className="spinner-border spinner-border-sm me-1" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  ) : (
                                    <AlertCircle size={16} className="me-1" />
                                  )}
                                  Hủy
                                </button>
                              )}

                              {order.trackingNumber && (
                                <span className="badge bg-info text-dark ms-auto">
                                  <Truck size={14} className="me-1" />
                                  {order.trackingNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline-secondary"
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Trước
                      </button>
                      <span className="text-muted">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline-secondary"
                      >
                        Sau
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrderDetails && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-receipt me-2"></i>
                  Chi tiết đơn hàng #{selectedOrderDetails.id.substring(0, 8).toUpperCase()}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <h6 className="card-title text-primary mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Thông tin đơn hàng
                        </h6>
                        <div className="small">
                          <div className="mb-2">
                            <strong>Mã đơn hàng:</strong> {selectedOrderDetails.id}
                          </div>
                          <div className="mb-2">
                            <strong>Trạng thái:</strong> {getOrderStatusBadge(selectedOrderDetails.status)}
                          </div>
                          <div className="mb-2">
                            <strong>Ngày tạo:</strong> {formatDateTime(selectedOrderDetails.created_at)}
                          </div>
                          <div className="mb-2">
                            <strong>Tổng tiền:</strong> 
                            <span className="fw-bold text-success ms-2">{formatPrice(selectedOrderDetails.totalPrice)}</span>
                          </div>
                          <div className="mb-2">
                            <strong>Thanh toán:</strong> {selectedOrderDetails.paymentMethod || 'COD'}
                          </div>
                          {selectedOrderDetails.trackingNumber && (
                            <div className="mb-2">
                              <strong>Mã vận đơn:</strong> 
                              <span className="badge bg-info text-dark ms-2">{selectedOrderDetails.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <h6 className="card-title text-success mb-3">
                          <i className="fas fa-shipping-fast me-2"></i>
                          Thông tin giao hàng
                        </h6>
                        <div className="small">
                          <div className="mb-2">
                            <strong>Địa chỉ:</strong><br />
                            {selectedOrderDetails.shippingAddress || 'Chưa cập nhật'}
                          </div>
                          <div className="mb-2">
                            <strong>SĐT:</strong> {selectedOrderDetails.phoneNumber || 'Chưa cập nhật'}
                          </div>
                          {selectedOrderDetails.note && (
                            <div className="mb-2">
                              <strong>Ghi chú:</strong><br />
                              <em className="text-muted">{selectedOrderDetails.note}</em>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 bg-light">
                  <div className="card-header bg-white border-0">
                    <h6 className="mb-0 text-dark">
                      <i className="fas fa-box me-2"></i>
                      Chi tiết sản phẩm
                    </h6>
                  </div>
                  <div className="card-body">
                    {orderDetails.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-primary">
                            <tr>
                              <th>Sản phẩm</th>
                              <th className="text-center">Số lượng</th>
                              <th className="text-end">Đơn giá</th>
                              <th className="text-end">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderDetails.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary rounded p-2 me-3" style={{ width: '40px', height: '40px' }}>
                                      <i className="fas fa-cube text-white"></i>
                                    </div>
                                    <span className="fw-medium">{item.productName}</span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-secondary">{item.quantity}</span>
                                </td>
                                <td className="text-end">{formatPrice(item.price)}</td>
                                <td className="text-end fw-bold">{formatPrice(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <th colSpan={3} className="text-end">Tổng cộng:</th>
                              <th className="text-end text-success">{formatPrice(selectedOrderDetails.totalPrice)}</th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                        <p className="text-muted">Không thể tải chi tiết sản phẩm</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                  <i className="fas fa-times me-1"></i>
                  Đóng
                </button>
                {canConfirmReceipt(selectedOrderDetails) && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      confirmReceipt(selectedOrderDetails.id);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === selectedOrderDetails.id}
                  >
                    {actionLoading === selectedOrderDetails.id ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="me-1" />
                        Đã nhận hàng
                      </>
                    )}
                  </button>
                )}
                {canCancel(selectedOrderDetails) && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      cancelOrder(selectedOrderDetails.id);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === selectedOrderDetails.id}
                  >
                    {actionLoading === selectedOrderDetails.id ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="me-1" />
                        Hủy đơn hàng
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-route me-2"></i>
                  Theo dõi đơn hàng #{selectedOrder.orderId.substring(0, 8).toUpperCase()}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTrackingModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <h6 className="card-title text-info mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Thông tin đơn hàng
                    </h6>
                    <div className="row text-sm">
                      <div className="col-md-6 mb-2">
                        <strong>Mã đơn hàng:</strong> {selectedOrder.orderId}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Trạng thái:</strong> {getOrderStatusBadge(selectedOrder.status)}
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="col-md-6 mb-2">
                          <strong>Mã vận đơn:</strong> 
                          <span className="badge bg-info text-dark ms-2">{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div className="col-md-6 mb-2">
                          <strong>Dự kiến giao:</strong> {formatDate(selectedOrder.estimatedDelivery)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h6 className="text-muted mb-3">
                  <i className="fas fa-history me-2"></i>
                  Lịch sử đơn hàng
                </h6>
                <div className="timeline">
                  {selectedOrder.orderStatuses?.map((status, index) => (
                    <div key={index} className="timeline-item">
                      <div className={`timeline-icon ${
                        status.status === 'delivered' ? 'bg-success' :
                        status.status === 'shipped' ? 'bg-primary' :
                        status.status === 'approved' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {status.status === 'delivered' ? (
                          <i className="fas fa-check"></i>
                        ) : status.status === 'shipped' ? (
                          <i className="fas fa-truck"></i>
                        ) : status.status === 'approved' ? (
                          <i className="fas fa-clock"></i>
                        ) : (
                          <i className="fas fa-box"></i>
                        )}
                      </div>
                      <div className="timeline-content">
                        <h6 className="mb-1 fw-bold">{status.description}</h6>
                        <small className="text-muted">
                          <i className="fas fa-calendar-alt me-1"></i>
                          {formatDateTime(status.timestamp)}
                        </small>
                      </div>
                    </div>
                  )) || (
                    <div className="timeline-item">
                      <div className="timeline-icon bg-secondary">
                        <i className="fas fa-box"></i>
                      </div>
                      <div className="timeline-content">
                        <h6 className="mb-1 fw-bold">Đơn hàng đã được tạo</h6>
                        <small className="text-muted">Đang chờ xử lý...</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTrackingModal(false)}>
                  <i className="fas fa-times me-1"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerOrderTracking;