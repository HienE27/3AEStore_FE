import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  getIdUserByToken, 
  getUsernameByToken, 
  getLastNameByToken, 
  getAvatarByToken, 
  isToken
} from '../utils/JwtService';
import { config } from '../config/environment';

import SidebarProfile from './SidebarProfile';


interface CustomerInfo {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  wishlistCount?: number;
  approvedOrders?: number;
  shippedOrders?: number;
  cancelledOrders?: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  totalPrice: number;
  status: string;
  orderItems?: Array<{
    productName: string;
    productImage?: string;
    quantity: number;
  }>;
}

const Main: React.FC = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    wishlistCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = getIdUserByToken() || '';
  const customerEmail = getUsernameByToken();

  // Utils
  const formatPrice = (price: number): string =>
    new Intl.NumberFormat(config.LOCALE, { style: "currency", currency: config.CURRENCY }).format(price);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(config.LOCALE);
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return <span className="badge bg-warning text-dark">Chờ xử lý</span>;
    if (s === 'approved') return <span className="badge bg-info text-white">Đã duyệt</span>;
    if (s === 'shipped' || s === 'shipping') return <span className="badge bg-primary text-white">Đang giao</span>;
    if (s === 'delivered') return <span className="badge bg-success text-white">Đã giao</span>;
    if (s === 'cancelled') return <span className="badge bg-danger text-white">Đã hủy</span>;
    return <span className="badge bg-secondary text-white">{status}</span>;
  };

  // Chỉ lấy thông tin khách hàng theo đúng logic cũ, tối ưu nhỏ (tránh gọi lại khi không đổi token)
  const fetchCustomerInfo = useCallback(async () => {
    if (!customerId) return null;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/customers/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Not found');
      return await res.json();
    } catch {
      // fallback lấy bằng token
      if (isToken()) {
        return {
          id: getIdUserByToken(),
          email: getUsernameByToken(),
          firstName: 'Khách hàng',
          lastName: getLastNameByToken() || '',
          avatar: getAvatarByToken(),
        };
      }
      return null;
    }
  }, [customerId]);

  // Lấy danh sách orders
  const fetchOrders = useCallback(async () => {
    if (!customerId) return [];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/orders/customer/${customerId}?page=0&size=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data._embedded?.orders) return data._embedded.orders;
      if (data.orders) return data.orders;
      return [];
    } catch {
      return [];
    }
  }, [customerId]);

  // Lấy thống kê orders (API BE mới)
  const fetchOrderStats = useCallback(async () => {
    if (!customerId) return null;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/orders/customer/${customerId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, [customerId]);

  // Gọi dữ liệu
  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isToken() || !customerId) {
          setError('Vui lòng đăng nhập để xem thông tin tài khoản');
          setLoading(false);
          return;
        }
        const [customer, orders, stats] = await Promise.all([
          fetchCustomerInfo(),
          fetchOrders(),
          fetchOrderStats(),
        ]);
        if (ignore) return;

        setCustomerInfo(customer);

        if (stats) {
          setOrderStats({
            totalOrders: stats.totalOrders || 0,
            pendingOrders: stats.pendingOrders || 0,
            deliveredOrders: stats.deliveredOrders || 0,
            wishlistCount: 0,
            approvedOrders: stats.approvedOrders || 0,
            shippedOrders: stats.shippedOrders || 0,
            cancelledOrders: stats.cancelledOrders || 0,
          });
        } else {
          // Fallback: tự tính nếu không có stats
          const totalOrders = orders.length;
          const pendingOrders = orders.filter((o: any) => !o.status || o.status.toLowerCase() === 'pending').length;
          const deliveredOrders = orders.filter((o: any) => o.status?.toLowerCase() === 'delivered').length;
          setOrderStats({
            totalOrders,
            pendingOrders,
            deliveredOrders,
            wishlistCount: 0,
          });
        }

        // Đơn gần đây nhất (giữ như cũ)
        const sortedOrders = orders
          .slice()
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4);
        setRecentOrders(sortedOrders);

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tải thông tin');
        setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, [customerId, fetchCustomerInfo, fetchOrders, fetchOrderStats]);

  // Refresh function
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    window.location.reload();
  }, []);

  // Render UI (giữ nguyên như code cũ bạn gửi)
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Đang tải thông tin tài khoản...</h5>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="text-danger mb-3">
            <i className="fas fa-exclamation-triangle fa-3x"></i>
          </div>
          <h4 className="text-danger mb-3">Có lỗi xảy ra</h4>
          <p className="text-muted mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn btn-primary">
            <i className="fas fa-refresh me-2"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SECTION PAGETOP */}
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">My account</h2>
        </div>
      </section>
      {/* SECTION CONTENT */}
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <aside className="col-md-3">
    <SidebarProfile />
  </aside>

            {/* Main content */}
            <main className="col-md-9">
              {/* User Info Card */}
              <article className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {customerInfo?.avatar ? (
                        <img 
                          className="rounded-circle border" 
                          src={customerInfo.avatar} 
                          alt="User Avatar"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                          style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                        >
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="mb-1">
                        {customerInfo?.firstName && customerInfo?.lastName 
                          ? `${customerInfo.firstName} ${customerInfo.lastName}`
                          : customerInfo?.firstName || customerInfo?.lastName || 'Khách hàng'
                        }
                      </h4>
                      <p className="text-muted mb-2">
                        <i className="fas fa-envelope me-2"></i>
                        {customerInfo?.email || 'Chưa cập nhật email'}
                      </p>
                      {customerInfo?.phoneNumber && (
                        <p className="text-muted mb-2">
                          <i className="fas fa-phone me-2"></i>
                          {customerInfo.phoneNumber}
                        </p>
                      )}
                      <Link to="/profile/settings" className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-edit me-1"></i>
                        Chỉnh sửa
                      </Link>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  {customerInfo?.address && (
                    <div className="mb-3">
                      <p className="mb-2">
                        <i className="fa fa-map-marker-alt text-muted me-2"></i>
                        <strong>Địa chỉ của tôi:</strong>
                      </p>
                      <p className="ms-4 text-muted">
                        {customerInfo.address}
                        <Link to="/profile/address" className="btn-link ms-2">
                          <i className="fas fa-edit"></i> Chỉnh sửa
                        </Link>
                      </p>
                    </div>
                  )}

                  {/* Stats Card Group */}
                  <div className="row g-3 mt-3">
                    <div className="col-6 col-md-3">
                      <div className="card bg-primary text-white text-center h-100">
                        <div className="card-body py-3">
                          <h4 className="mb-1">{orderStats.totalOrders}</h4>
                          <small>Đơn hàng</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card bg-info text-white text-center h-100">
                        <div className="card-body py-3">
                          <h4 className="mb-1">{orderStats.wishlistCount}</h4>
                          <small>Yêu thích</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card bg-warning text-white text-center h-100">
                        <div className="card-body py-3">
                          <h4 className="mb-1">{orderStats.pendingOrders}</h4>
                          <small>Chờ giao</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card bg-success text-white text-center h-100">
                        <div className="card-body py-3">
                          <h4 className="mb-1">{orderStats.deliveredOrders}</h4>
                          <small>Đã giao</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Recent Orders Card */}
              <article className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0">
                      <i className="fas fa-clock me-2 text-primary"></i>
                      Đơn hàng gần đây
                    </h5>
                    <Link to="/profile/orders" className="btn btn-outline-primary btn-sm">
                      Xem tất cả
                    </Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                      <h6 className="text-muted">Chưa có đơn hàng nào</h6>
                      <p className="text-muted small">Hãy bắt đầu mua sắm ngay!</p>
                      <Link to="/products" className="btn btn-primary">
                        <i className="fas fa-shopping-cart me-2"></i>
                        Mua sắm ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {recentOrders.map(order => (
                        <div className="col-md-6 mb-3" key={order.id}>
                          <div className="border rounded p-3 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <small className="text-muted">
                                <i className="fa fa-calendar-alt me-1"></i>
                                {formatDate(order.created_at)}
                              </small>
                              {getStatusBadge(order.status)}
                            </div>
                            
                            <h6 className="mb-2">
                              <i className="fas fa-receipt me-2 text-primary"></i>
                              #{order.id.substring(0, 8).toUpperCase()}
                            </h6>
                            
                            <p className="mb-2 fw-bold text-success">
                              {formatPrice(order.totalPrice)}
                            </p>
                            
                            {order.orderItems && order.orderItems.length > 0 && (
                              <div className="small text-muted">
                                <i className="fas fa-box me-1"></i>
                                {order.orderItems.length} sản phẩm
                                {order.orderItems[0] && (
                                  <span> - {order.orderItems[0].productName}</span>
                                )}
                                {order.orderItems.length > 1 && (
                                  <span> và {order.orderItems.length - 1} sản phẩm khác</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {recentOrders.length > 0 && (
                    <div className="text-center mt-3">
                      <Link to="/profile/orders" className="btn btn-outline-primary">
                        Xem tất cả đơn hàng
                        <i className="fa fa-chevron-right ms-2"></i>
                      </Link>
                    </div>
                  )}
                </div>
              </article>

              {/* Quick Actions */}
              <article className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-bolt me-2 text-warning"></i>
                    Thao tác nhanh
                  </h5>
                  <div className="row g-3">
                    <div className="col-6 col-md-3">
                      <Link to="/profile/orders" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                        <i className="fas fa-shopping-bag fa-2x mb-2"></i>
                        <span>Đơn hàng</span>
                      </Link>
                    </div>
                    <div className="col-6 col-md-3">
                      <Link to="/profile/address" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                        <i className="fas fa-map-marker-alt fa-2x mb-2"></i>
                        <span>Địa chỉ</span>
                      </Link>
                    </div>
                    <div className="col-6 col-md-3">
                      <Link to="/profile/wishlist" className="btn btn-outline-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                        <i className="fas fa-heart fa-2x mb-2"></i>
                        <span>Yêu thích</span>
                      </Link>
                    </div>
                    <div className="col-6 col-md-3">
                      <Link to="/profile/settings" className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                        <i className="fas fa-cog fa-2x mb-2"></i>
                        <span>Cài đặt</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Main;
