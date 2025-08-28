import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
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
  orderApprovedAt?: string | null;
  orderDeliveredCarrierDate?: string | null;
  orderDeliveredCustomerDate?: string | null;
  shippingAddress?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  note?: string;
  trackingNumber?: string;
}

interface OrderDetail {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderStatistics {
  totalOrders: number;
  statusStatistics: { [key: string]: number };
  totalRevenue: number;
  averageOrderValue: number;
}

interface BulkAction {
  orderIds: string[];
  action: 'approve' | 'ship' | 'cancel' | 'deliver';
  note?: string;
}

interface ShippingStatus {
  orderId: string;
  status: 'shipped' | 'in_transit' | 'delivered';
  trackingNumber?: string;
  note?: string;
}

const OrderPage: React.FC = () => {
  // Detect sidebar width from CSS variable
  const [sidebarWidth, setSidebarWidth] = useState(300);

  useEffect(() => {
    const updateSidebarWidth = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const width = rootStyles.getPropertyValue('--sidebar-width');
      if (width) {
        setSidebarWidth(parseInt(width) || 300);
      }
    };

    updateSidebarWidth();
    
    const observer = new MutationObserver(updateSidebarWidth);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => observer.disconnect();
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction>({ orderIds: [], action: 'approve' });
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>({ orderId: '', status: 'shipped' });
  const [exportLoading, setExportLoading] = useState(false);

  // Staff ID management
  const getStaffId = () => {
    const stored = localStorage.getItem('staffId') || localStorage.getItem('userId') || localStorage.getItem('adminId');
    if (stored && stored !== 'default-staff-id') {
      return stored;
    }
    return '9a091641-2a25-11f0-ba3c-601895cc3ad';
  };
  
  const staffId = getStaffId();
  const ORDER_API_BASE = "http://localhost:8080/api/orders";

  // Format functions
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const formatDateTime = (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const getOrderStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'primary';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'returned':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getOrderStatusText = (status: string): string => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      case 'returned':
        return 'Đã trả';
      default:
        return status;
    }
  };

  const getShippingStatusText = (status: string): string => {
    switch (status) {
      case 'shipped':
        return 'Đã xuất kho';
      case 'in_transit':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao hàng';
      default:
        return status;
    }
  };

  // NEW: Invoice generation function
  const generateInvoicePDF = (order: Order, details: OrderDetail[]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (A4 proportions)
    canvas.width = 595;
    canvas.height = 842;
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set default font
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    
    let y = 40;
    const leftMargin = 40;
    const rightMargin = canvas.width - 40;
    
    // Header - Company Info
    ctx.fillStyle = '#2c5aa0';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('3AE STORE', leftMargin, y);
    y += 30;
    
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText('Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM', leftMargin, y);
    y += 15;
    ctx.fillText('Điện thoại: (028) 1234-5678 | Email: info@3aestore.com', leftMargin, y);
    y += 15;
    ctx.fillText('Website: www.3aestore.com', leftMargin, y);
    y += 40;
    
    // Title
    ctx.fillStyle = '#2c5aa0';
    ctx.font = 'bold 20px Arial';
    const title = 'HÓA ĐƠN BÁN HÀNG';
    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, (canvas.width - titleWidth) / 2, y);
    y += 40;
    
    // Invoice info
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText(`Số hóa đơn: ${order.id.substring(0, 8).toUpperCase()}`, leftMargin, y);
    ctx.fillText(`Ngày: ${formatDateTime(order.created_at).split(',')[0]}`, rightMargin - 150, y);
    y += 20;
    
    // Customer info
    ctx.font = 'bold 14px Arial';
    ctx.fillText('THÔNG TIN KHÁCH HÀNG:', leftMargin, y);
    y += 20;
    
    ctx.font = '12px Arial';
    ctx.fillText(`Họ tên: ${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`, leftMargin, y);
    y += 15;
    ctx.fillText(`Email: ${order.customer?.email || 'N/A'}`, leftMargin, y);
    y += 15;
    ctx.fillText(`Số điện thoại: ${order.phoneNumber || 'N/A'}`, leftMargin, y);
    y += 15;
    ctx.fillText(`Địa chỉ: ${order.shippingAddress || 'N/A'}`, leftMargin, y);
    y += 30;
    
    // Table header
    const tableStartY = y;
    const colWidths = [40, 250, 60, 100, 100];
    const colX = [leftMargin, leftMargin + 40, leftMargin + 290, leftMargin + 350, leftMargin + 450];
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(leftMargin, y - 5, rightMargin - leftMargin, 25);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('STT', colX[0], y + 10);
    ctx.fillText('Sản phẩm', colX[1], y + 10);
    ctx.fillText('SL', colX[2], y + 10);
    ctx.fillText('Đơn giá', colX[3], y + 10);
    ctx.fillText('Thành tiền', colX[4], y + 10);
    y += 25;
    
    // Table content
    ctx.font = '12px Arial';
    let totalAmount = 0;
    
    if (details && details.length > 0) {
      details.forEach((item, index) => {
        const rowY = y + 15;
        
        // Alternate row background
        if (index % 2 === 1) {
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(leftMargin, y, rightMargin - leftMargin, 20);
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillText((index + 1).toString(), colX[0], rowY);
        
        // Product name (truncate if too long)
        let productName = item.productName;
        if (productName.length > 35) {
          productName = productName.substring(0, 32) + '...';
        }
        ctx.fillText(productName, colX[1], rowY);
        
        ctx.fillText(item.quantity.toString(), colX[2], rowY);
        ctx.fillText(formatPrice(item.price), colX[3], rowY);
        ctx.fillText(formatPrice(item.total), colX[4], rowY);
        
        totalAmount += item.total;
        y += 20;
      });
    } else {
      // No details available
      ctx.fillStyle = '#666666';
      ctx.fillText('Không có thông tin chi tiết sản phẩm', colX[1], y + 15);
      totalAmount = order.totalPrice;
      y += 20;
    }
    
    // Total section
    y += 20;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(rightMargin, y);
    ctx.stroke();
    y += 20;
    
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('TỔNG CỘNG:', colX[3], y);
    ctx.fillText(formatPrice(order.totalPrice), colX[4], y);
    y += 30;
    
    // Payment info
    ctx.font = '12px Arial';
    ctx.fillText(`Phương thức thanh toán: ${order.paymentMethod || 'COD (Thanh toán khi nhận hàng)'}`, leftMargin, y);
    y += 15;
    ctx.fillText(`Trạng thái: ${getOrderStatusText(order.orderStatus?.statusName || '')}`, leftMargin, y);
    y += 40;
    
    // Footer
    const footerY = canvas.height - 100;
    ctx.font = '12px Arial';
    ctx.fillText('Cảm ơn quý khách đã mua hàng tại 3AE Store!', leftMargin, footerY);
    ctx.fillText('Mọi thắc mắc xin liên hệ: (028) 1234-5678', leftMargin, footerY + 15);
    
    // Signature area
    ctx.fillText('Người bán hàng', leftMargin, footerY + 40);
    ctx.fillText('Khách hàng', rightMargin - 100, footerY + 40);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${order.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  // NEW: Handle invoice export
  const handleExportInvoice = async (order: Order) => {
    setActionLoading(`invoice-${order.id}`);
    try {
      // Load order details first
      await loadOrderDetails(order.id);
      
      // Generate invoice with current orderDetails
      setTimeout(() => {
        generateInvoicePDF(order, orderDetails);
        setActionLoading(null);
        alert('Xuất hóa đơn thành công!');
      }, 500);
      
    } catch (error) {
      console.error('Error exporting invoice:', error);
      alert('Lỗi khi xuất hóa đơn!');
      setActionLoading(null);
    }
  };

  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [currentPage, searchTerm, filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', (currentPage - 1).toString());
      params.append('size', '10');
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (filterStatus) {
        params.append('status', filterStatus);
      }
      
      console.log('Loading orders with params:', params.toString());
      
      const response = await fetch(`${ORDER_API_BASE}/admin/all?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Orders API response:', data);
      
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (data.page) {
          setTotalPages(data.page.totalPages || 1);
        }
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(1);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
      
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setOrders([]);
      alert('Lỗi khi tải danh sách đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${ORDER_API_BASE}/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      console.log('Loading order details for:', orderId);
      
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/details`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Order details response:', data);
        setOrderDetails(Array.isArray(data) ? data : []);
      } else {
        console.warn('Order details endpoint returned:', response.status);
        setOrderDetails([]);
      }
      
    } catch (error) {
      console.error('Error loading order details:', error);
      setOrderDetails([]);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đơn hàng này?')) return;
    
    setActionLoading(orderId);
    try {
      console.log('Approving order:', orderId, 'with staffId:', staffId);
      
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/approve?staffId=${encodeURIComponent(staffId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let result: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        result = { message: textResult, success: response.ok };
      }
      
      console.log('Approve response:', result);
      
      if (response.ok) {
        alert('Duyệt đơn hàng thành công!');
        await loadOrders();
        await loadStatistics();
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            orderStatus: { statusName: 'Approved' },
            orderApprovedAt: new Date().toISOString()
          } : null);
        }
      } else {
        throw new Error(result.message || result || 'Có lỗi xảy ra khi duyệt đơn hàng');
      }
    } catch (error: any) {
      console.error('Error approving order:', error);
      alert('Lỗi khi duyệt đơn hàng: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    const trackingNumber = prompt('Nhập mã vận đơn (tùy chọn):');
    
    setActionLoading(orderId);
    try {
      console.log('Shipping order:', orderId, 'with staffId:', staffId);
      
      const payload: any = {};
      if (trackingNumber && trackingNumber.trim()) {
        payload.trackingNumber = trackingNumber.trim();
      }
      
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/ship?staffId=${encodeURIComponent(staffId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      let result: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        result = { message: textResult, success: response.ok };
      }
      
      console.log('Ship response:', result);
      
      if (response.ok) {
        alert('Đánh dấu đơn hàng đã giao thành công!');
        await loadOrders();
        await loadStatistics();
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            orderStatus: { statusName: 'Shipped' },
            orderDeliveredCarrierDate: new Date().toISOString(),
            trackingNumber: trackingNumber || prev.trackingNumber
          } : null);
        }
      } else {
        throw new Error(result.message || result || 'Có lỗi xảy ra khi cập nhật trạng thái giao hàng');
      }
    } catch (error: any) {
      console.error('Error shipping order:', error);
      alert('Lỗi khi cập nhật trạng thái giao hàng: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc muốn xác nhận đơn hàng đã được giao thành công?')) return;
    
    setActionLoading(orderId);
    try {
      console.log('Confirming delivery for order:', orderId, 'with staffId:', staffId);
      
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/confirm-delivery?staffId=${encodeURIComponent(staffId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let result: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        result = { message: textResult, success: response.ok };
      }
      
      console.log('Delivery response:', result);
      
      if (response.ok) {
        alert('Xác nhận giao hàng thành công!');
        await loadOrders();
        await loadStatistics();
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            orderStatus: { statusName: 'Delivered' },
            orderDeliveredCustomerDate: new Date().toISOString()
          } : null);
        }
      } else {
        throw new Error(result.message || result || 'Có lỗi xảy ra khi xác nhận giao hàng');
      }
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      alert('Lỗi khi xác nhận giao hàng: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateShippingStatus = async () => {
    if (!shippingStatus.orderId) {
      alert('Vui lòng chọn đơn hàng!');
      return;
    }

    setActionLoading('shipping');
    try {
      console.log('Updating shipping status:', shippingStatus);
      
      const payload = {
        status: shippingStatus.status,
        trackingNumber: shippingStatus.trackingNumber || '',
        note: shippingStatus.note || ''
      };
      
      const response = await fetch(`${ORDER_API_BASE}/${shippingStatus.orderId}/update-shipping?staffId=${encodeURIComponent(staffId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      let result: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        result = { message: textResult, success: response.ok };
      }
      
      console.log('Shipping update response:', result);
      
      if (response.ok) {
        alert('Cập nhật trạng thái vận chuyển thành công!');
        await loadOrders();
        await loadStatistics();
        setShowShippingModal(false);
        setShippingStatus({ orderId: '', status: 'shipped' });
      } else {
        throw new Error(result.message || result || 'Có lỗi xảy ra khi cập nhật trạng thái vận chuyển');
      }
    } catch (error: any) {
      console.error('Error updating shipping status:', error);
      alert('Lỗi khi cập nhật trạng thái vận chuyển: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Nhập lý do hủy đơn hàng:');
    if (!reason || !reason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng!');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${orderId.substring(0, 8).toUpperCase()} với lý do: "${reason}"?`)) {
      return;
    }

    setActionLoading(orderId);
    try {
      console.log('Canceling order:', orderId, 'with staffId:', staffId);
      
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/admin-cancel?staffId=${encodeURIComponent(staffId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      
      let result: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        result = { message: textResult, success: response.ok };
      }
      
      console.log('Cancel response:', result);
      
      if (response.ok) {
        alert('Hủy đơn hàng thành công!');
        await loadOrders();
        await loadStatistics();
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            orderStatus: { statusName: 'Cancelled' }
          } : null);
        }
      } else {
        throw new Error(result.message || result || 'Có lỗi xảy ra khi hủy đơn hàng');
      }
    } catch (error: any) {
      console.error('Error canceling order:', error);
      alert('Lỗi khi hủy đơn hàng: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async () => {
    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    const actionText = bulkAction.action === 'approve' ? 'duyệt' : 
                      bulkAction.action === 'ship' ? 'đánh dấu đã giao' : 
                      bulkAction.action === 'deliver' ? 'xác nhận giao hàng' : 'hủy';
    
    if (!window.confirm(`Bạn có chắc muốn ${actionText} ${selectedOrders.length} đơn hàng?`)) return;

    setActionLoading('bulk');
    try {
      console.log('Bulk action:', bulkAction.action, 'for orders:', selectedOrders);
      
      const promises = selectedOrders.map(async (orderId) => {
        try {
          let response: Response;
          switch (bulkAction.action) {
            case 'approve':
              response = await fetch(`${ORDER_API_BASE}/${orderId}/approve?staffId=${encodeURIComponent(staffId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
              });
              break;
            case 'ship':
              response = await fetch(`${ORDER_API_BASE}/${orderId}/ship?staffId=${encodeURIComponent(staffId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
              });
              break;
            case 'deliver':
              response = await fetch(`${ORDER_API_BASE}/${orderId}/confirm-delivery?staffId=${encodeURIComponent(staffId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
              });
              break;
            case 'cancel':
              response = await fetch(`${ORDER_API_BASE}/${orderId}/admin-cancel?staffId=${encodeURIComponent(staffId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: bulkAction.note || 'Bulk cancel' })
              });
              break;
            default:
              throw new Error('Invalid action');
          }
          
          let result: any;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            const textResult = await response.text();
            result = { message: textResult, success: response.ok };
          }
          
          return { orderId, success: response.ok, response, result };
        } catch (error) {
          return { orderId, success: false, error };
        }
      });

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log('Bulk action results:', { successful, failed, results });

      alert(`Xử lý thành công ${successful} đơn hàng${failed > 0 ? `, ${failed} đơn hàng thất bại` : ''}`);
      
      setSelectedOrders([]);
      setShowBulkModal(false);
      await loadOrders();
      await loadStatistics();
    } catch (error: any) {
      console.error('Bulk action error:', error);
      alert('Lỗi khi xử lý hàng loạt: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportOrders = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('size', '1000');
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${ORDER_API_BASE}/admin/all?${params.toString()}`);
      const data = await response.json();
      
      const ordersData = data.orders || data || [];
      
      if (ordersData.length === 0) {
        alert('Không có dữ liệu để xuất');
        return;
      }

      const headers = ['Mã đơn hàng', 'Khách hàng', 'Email', 'Số điện thoại', 'Địa chỉ', 'Tổng tiền', 'Trạng thái', 'Ngày tạo', 'Phương thức thanh toán'];
      const csvContent = [
        headers.join(','),
        ...ordersData.map((order: Order) => [
          order.id,
          `"${order.customer?.first_name || ''} ${order.customer?.last_name || ''}"`,
          order.customer?.email || '',
          order.phoneNumber || '',
          `"${order.shippingAddress || ''}"`,
          order.totalPrice,
          order.orderStatus?.statusName || '',
          formatDateTime(order.created_at),
          order.paymentMethod || 'COD'
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Xuất dữ liệu thành công!');
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Lỗi khi xuất dữ liệu: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    await loadOrderDetails(order.id);
  };

  const getOrderBadge = (status: string | undefined) => {
    const statusName = status || 'unknown';
    const color = getOrderStatusColor(statusName);
    const text = getOrderStatusText(statusName);
    
    return <span className={`badge bg-${color}`}>{text}</span>;
  };

  const canApprove = (order: Order) => {
    return order.orderStatus?.statusName?.toLowerCase() === 'pending' && !order.orderApprovedAt;
  };

  const canShip = (order: Order) => {
    return order.orderStatus?.statusName?.toLowerCase() === 'approved' && order.orderApprovedAt && !order.orderDeliveredCarrierDate;
  };

  const canDeliver = (order: Order) => {
    return order.orderStatus?.statusName?.toLowerCase() === 'shipped' && order.orderDeliveredCarrierDate && !order.orderDeliveredCustomerDate;
  };

  const canUpdateShipping = (order: Order) => {
    const status = order.orderStatus?.statusName?.toLowerCase();
    return status === 'approved' || status === 'shipped';
  };

  const canCancel = (order: Order) => {
    return !order.orderDeliveredCustomerDate && 
           order.orderStatus?.statusName?.toLowerCase() !== 'cancelled' &&
           order.orderStatus?.statusName?.toLowerCase() !== 'delivered';
  };

  const canExportInvoice = (order: Order) => {
    const status = order.orderStatus?.statusName?.toLowerCase();
    return status === 'approved' || status === 'shipped' || status === 'delivered';
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const showDebugInfo = () => {
    console.log('=== DEBUG INFO ===');
    console.log('Staff ID:', staffId);
    console.log('Orders count:', orders.length);
    console.log('Current page:', currentPage);
    console.log('Total pages:', totalPages);
    console.log('API Base:', ORDER_API_BASE);
    alert(`Debug Info:\nStaff ID: ${staffId}\nOrders: ${orders.length}\nPage: ${currentPage}/${totalPages}\nAPI: ${ORDER_API_BASE}`);
  };

  return (
    <div 
      style={{ 
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                📦 Quản lý đơn hàng - 3AE Store
              </h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-outline-info"
                  onClick={showDebugInfo}
                  title="Debug Information"
                  style={{ 
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px'
                  }}
                >
                  🐛 Debug
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={handleExportOrders}
                  disabled={exportLoading}
                  style={{ 
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px'
                  }}
                >
                  {exportLoading ? '📥 Đang xuất...' : '📥 Xuất CSV'}
                </button>
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => setShowShippingModal(true)}
                  style={{ 
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px'
                  }}
                >
                  🚛 Cập nhật vận chuyển
                </button>
                {selectedOrders.length > 0 && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowBulkModal(true)}
                    style={{ 
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                      fontSize: '14px'
                    }}
                  >
                    ⚡ Xử lý hàng loạt ({selectedOrders.length})
                  </button>
                )}
              </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div className="card text-white" style={{ backgroundColor: '#0d6efd', borderRadius: '10px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Tổng đơn hàng</h5>
                        <h2>{statistics.totalOrders}</h2>
                      </div>
                      <div className="align-self-center">
                        <span style={{ fontSize: '32px' }}>🛒</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card text-white" style={{ backgroundColor: '#ffc107', borderRadius: '10px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Chờ duyệt</h5>
                        <h2>{statistics.statusStatistics['Pending'] || 0}</h2>
                      </div>
                      <div className="align-self-center">
                        <span style={{ fontSize: '32px' }}>⏰</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card text-white" style={{ backgroundColor: '#198754', borderRadius: '10px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Tổng doanh thu</h5>
                        <h4>{formatPrice(statistics.totalRevenue)}</h4>
                      </div>
                      <div className="align-self-center">
                        <span style={{ fontSize: '32px' }}>💰</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card text-white" style={{ backgroundColor: '#0dcaf0', borderRadius: '10px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Giá trị TB/đơn</h5>
                        <h4>{formatPrice(statistics.averageOrderValue)}</h4>
                      </div>
                      <div className="align-self-center">
                        <span style={{ fontSize: '32px' }}>📊</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="card mb-4" style={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div className="card-body">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  alignItems: 'end'
                }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: '600' }}>Tìm kiếm</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm theo mã đơn, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: '600' }}>Trạng thái</label>
                    <select 
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ borderRadius: '6px' }}
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="Pending">Chờ duyệt</option>
                      <option value="Approved">Đã duyệt</option>
                      <option value="Shipped">Đang giao</option>
                      <option value="Delivered">Đã giao</option>
                      <option value="Cancelled">Đã hủy</option>
                      <option value="Returned">Đã trả</option>
                    </select>
                  </div>
                  <div>
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => {
                        setCurrentPage(1);
                        loadOrders();
                      }}
                      style={{ borderRadius: '6px' }}
                    >
                      🔍 Lọc
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="card" style={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: '#0d6efd' }}>
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h5>Không tìm thấy đơn hàng nào</h5>
                    <button className="btn btn-outline-primary mt-2" onClick={loadOrders} style={{ borderRadius: '6px' }}>
                      🔄 Tải lại
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table table-hover" style={{ minWidth: '900px' }}>
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={selectedOrders.length === orders.length && orders.length > 0}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th style={{ fontWeight: '600' }}>Mã đơn</th>
                          <th style={{ fontWeight: '600' }}>Khách hàng</th>
                          <th style={{ fontWeight: '600' }}>Tổng tiền</th>
                          <th style={{ fontWeight: '600' }}>Trạng thái</th>
                          <th style={{ fontWeight: '600' }}>Ngày tạo</th>
                          <th style={{ fontWeight: '600' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} style={{ transition: 'background-color 0.2s' }}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => handleSelectOrder(order.id)}
                              />
                            </td>
                            <td>
                              <strong>#{order.id.substring(0, 8).toUpperCase()}</strong>
                              <br />
                              <small className="text-muted">{order.id}</small>
                            </td>
                            <td>
                              <div>
                                <strong>{order.customer?.first_name} {order.customer?.last_name}</strong>
                                <br />
                                <small className="text-muted">{order.customer?.email}</small>
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#198754' }}>{formatPrice(order.totalPrice)}</strong>
                            </td>
                            <td>
                              {getOrderBadge(order.orderStatus?.statusName)}
                            </td>
                            <td>
                              {formatDateTime(order.created_at)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => viewOrderDetails(order)}
                                  title="Xem chi tiết"
                                  style={{ borderRadius: '4px' }}
                                >
                                  👁️
                                </button>
                                
                                {canExportInvoice(order) && (
                                  <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleExportInvoice(order)}
                                    title="Xuất hóa đơn"
                                    disabled={actionLoading === `invoice-${order.id}`}
                                    style={{ borderRadius: '4px' }}
                                  >
                                    {actionLoading === `invoice-${order.id}` ? '⏳' : '🧾'}
                                  </button>
                                )}
                                
                                {canApprove(order) && (
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleApproveOrder(order.id)}
                                    title="Duyệt đơn hàng"
                                    disabled={actionLoading === order.id}
                                    style={{ borderRadius: '4px' }}
                                  >
                                    {actionLoading === order.id ? '⏳' : '✅'}
                                  </button>
                                )}

                                {canShip(order) && (
                                  <button 
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => handleShipOrder(order.id)}
                                    title="Đánh dấu đã giao"
                                    disabled={actionLoading === order.id}
                                    style={{ borderRadius: '4px' }}
                                  >
                                    {actionLoading === order.id ? '⏳' : '🚚'}
                                  </button>
                                )}

                                {canDeliver(order) && (
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => handleDeliverOrder(order.id)}
                                    title="Xác nhận giao hàng"
                                    disabled={actionLoading === order.id}
                                    style={{ borderRadius: '4px' }}
                                  >
                                    {actionLoading === order.id ? '⏳' : '📦'}
                                  </button>
                                )}

                                {canUpdateShipping(order) && (
                                  <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                      setShippingStatus({ orderId: order.id, status: 'shipped' });
                                      setShowShippingModal(true);
                                    }}
                                    title="Cập nhật vận chuyển"
                                    style={{ borderRadius: '4px' }}
                                  >
                                    🚛
                                  </button>
                                )}

                                {canCancel(order) && (
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleCancelOrder(order.id)}
                                    title="Hủy đơn hàng"
                                    disabled={actionLoading === order.id}
                                    style={{ borderRadius: '4px' }}
                                  >
                                    {actionLoading === order.id ? '⏳' : '❌'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-4">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      {/* Page Info */}
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Hiển thị {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, orders.length + (currentPage - 1) * 10)} của {totalPages * 10} đơn hàng
                      </div>
                      
                      {/* Pagination Controls */}
                      <ul className="pagination justify-content-center m-0" style={{ flexWrap: 'wrap' }}>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            style={{ borderRadius: '6px', marginRight: '4px' }}
                            title="Trang đầu"
                          >
                            ⏮️
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ borderRadius: '6px', marginRight: '4px' }}
                            title="Trang trước"
                          >
                            ⬅️
                          </button>
                        </li>
                        
                        {/* Page Numbers */}
                        {(() => {
                          const maxVisiblePages = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }
                          
                          const pages = [];
                          
                          // Show first page if not in range
                          if (startPage > 1) {
                            pages.push(
                              <li key={1} className="page-item">
                                <button 
                                  className="page-link"
                                  onClick={() => setCurrentPage(1)}
                                  style={{ borderRadius: '6px', marginRight: '4px' }}
                                >
                                  1
                                </button>
                              </li>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <li key="start-ellipsis" className="page-item disabled">
                                  <span className="page-link" style={{ borderRadius: '6px', marginRight: '4px' }}>...</span>
                                </li>
                              );
                            }
                          }
                          
                          // Show page range
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                <button 
                                  className="page-link"
                                  onClick={() => setCurrentPage(i)}
                                  style={{ 
                                    backgroundColor: currentPage === i ? '#0d6efd' : 'white',
                                    color: currentPage === i ? 'white' : '#0d6efd',
                                    borderRadius: '6px',
                                    marginRight: '4px',
                                    fontWeight: currentPage === i ? '600' : '400'
                                  }}
                                >
                                  {i}
                                </button>
                              </li>
                            );
                          }
                          
                          // Show last page if not in range
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <li key="end-ellipsis" className="page-item disabled">
                                  <span className="page-link" style={{ borderRadius: '6px', marginRight: '4px' }}>...</span>
                                </li>
                              );
                            }
                            pages.push(
                              <li key={totalPages} className="page-item">
                                <button 
                                  className="page-link"
                                  onClick={() => setCurrentPage(totalPages)}
                                  style={{ borderRadius: '6px', marginRight: '4px' }}
                                >
                                  {totalPages}
                                </button>
                              </li>
                            );
                          }
                          
                          return pages;
                        })()}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ borderRadius: '6px', marginLeft: '4px' }}
                            title="Trang sau"
                          >
                            ➡️
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            style={{ borderRadius: '6px', marginLeft: '4px' }}
                            title="Trang cuối"
                          >
                            ⏭️
                          </button>
                        </li>
                      </ul>
                      
                      {/* Page Size Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#6c757d', whiteSpace: 'nowrap' }}>Hiển thị:</span>
                        <select 
                          className="form-select form-select-sm"
                          value="10"
                          onChange={(e) => {
                            // Có thể mở rộng để thay đổi page size
                            console.log('Page size changed:', e.target.value);
                          }}
                          style={{ 
                            width: 'auto',
                            minWidth: '70px',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="10">10</option>
                          <option value="20" disabled>20</option>
                          <option value="50" disabled>50</option>
                        </select>
                        <span style={{ color: '#6c757d', whiteSpace: 'nowrap' }}>/ trang</span>
                      </div>
                    </div>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Status Update Modal */}
        {showShippingModal && (
          <div className="modal-overlay" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="modal-content" style={{ 
              backgroundColor: 'white', 
              borderRadius: '10px', 
              width: '90%', 
              maxWidth: '600px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div className="modal-header" style={{ 
                padding: '20px', 
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  🚛 Cập nhật trạng thái vận chuyển
                </h5>
                <button 
                  onClick={() => setShowShippingModal(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '24px', 
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600' }}>Đơn hàng:</label>
                  <select 
                    className="form-select"
                    value={shippingStatus.orderId}
                    onChange={(e) => setShippingStatus(prev => ({ ...prev, orderId: e.target.value }))}
                    style={{ borderRadius: '6px' }}
                  >
                    <option value="">Chọn đơn hàng...</option>
                    {orders.filter(order => canUpdateShipping(order)).map(order => (
                      <option key={order.id} value={order.id}>
                        #{order.id.substring(0, 8).toUpperCase()} - {order.customer?.first_name} {order.customer?.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600' }}>Trạng thái vận chuyển:</label>
                  <select 
                    className="form-select"
                    value={shippingStatus.status}
                    onChange={(e) => setShippingStatus(prev => ({ ...prev, status: e.target.value as any }))}
                    style={{ borderRadius: '6px' }}
                  >
                    <option value="shipped">🚚 Đã xuất kho</option>
                    <option value="in_transit">🛣️ Đang vận chuyển</option>
                    <option value="delivered">📦 Đã giao hàng</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600' }}>Mã vận đơn:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã vận đơn (tùy chọn)..."
                    value={shippingStatus.trackingNumber || ''}
                    onChange={(e) => setShippingStatus(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    style={{ borderRadius: '6px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600' }}>Ghi chú:</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập ghi chú về tình trạng vận chuyển..."
                    value={shippingStatus.note || ''}
                    onChange={(e) => setShippingStatus(prev => ({ ...prev, note: e.target.value }))}
                    style={{ borderRadius: '6px' }}
                  />
                </div>

                <div style={{ 
                  backgroundColor: '#d1ecf1', 
                  color: '#0c5460', 
                  padding: '15px', 
                  borderRadius: '8px'
                }}>
                  ℹ️ Trạng thái vận chuyển: <strong>{getShippingStatusText(shippingStatus.status)}</strong>
                  <br />
                  {shippingStatus.orderId && (
                    <small>Đơn hàng: #{shippingStatus.orderId.substring(0, 8).toUpperCase()}</small>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ 
                padding: '20px', 
                borderTop: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowShippingModal(false)}
                  style={{ borderRadius: '6px' }}
                >
                  Hủy
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleUpdateShippingStatus}
                  disabled={actionLoading === 'shipping' || !shippingStatus.orderId}
                  style={{ borderRadius: '6px' }}
                >
                  {actionLoading === 'shipping' ? '⏳ Đang cập nhật...' : '✅ Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="modal-overlay" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="modal-content" style={{ 
              backgroundColor: 'white', 
              borderRadius: '10px', 
              width: '90%', 
              maxWidth: '1200px', 
              maxHeight: '90vh', 
              overflow: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div className="modal-header" style={{ 
                padding: '20px', 
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  🧾 Chi tiết đơn hàng #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h5>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '24px', 
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="row">
                  {/* Order Information */}
                  <div className="col-md-6">
                    <h6 style={{ fontWeight: '600', marginBottom: '15px' }}>📋 Thông tin đơn hàng</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Mã đơn hàng:</strong></td>
                          <td>{selectedOrder.id}</td>
                        </tr>
                        <tr>
                          <td><strong>Trạng thái:</strong></td>
                          <td>{getOrderBadge(selectedOrder.orderStatus?.statusName)}</td>
                        </tr>
                        <tr>
                          <td><strong>Ngày tạo:</strong></td>
                          <td>{formatDateTime(selectedOrder.created_at)}</td>
                        </tr>
                        <tr>
                          <td><strong>Tổng tiền:</strong></td>
                          <td><strong style={{ color: '#198754' }}>{formatPrice(selectedOrder.totalPrice)}</strong></td>
                        </tr>
                        <tr>
                          <td><strong>Phương thức thanh toán:</strong></td>
                          <td>{selectedOrder.paymentMethod || 'COD'}</td>
                        </tr>
                        {selectedOrder.trackingNumber && (
                          <tr>
                            <td><strong>Mã vận đơn:</strong></td>
                            <td>{selectedOrder.trackingNumber}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Information */}
                  <div className="col-md-6">
                    <h6 style={{ fontWeight: '600', marginBottom: '15px' }}>👤 Thông tin khách hàng</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Họ tên:</strong></td>
                          <td>{selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{selectedOrder.customer?.email}</td>
                        </tr>
                        <tr>
                          <td><strong>Số điện thoại:</strong></td>
                          <td>{selectedOrder.phoneNumber || 'Chưa cập nhật'}</td>
                        </tr>
                        <tr>
                          <td><strong>Địa chỉ giao hàng:</strong></td>
                          <td>{selectedOrder.shippingAddress || 'Chưa cập nhật'}</td>
                        </tr>
                        {selectedOrder.note && (
                          <tr>
                            <td><strong>Ghi chú:</strong></td>
                            <td>{selectedOrder.note}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h6 style={{ fontWeight: '600', marginBottom: '15px' }}>📅 Timeline đơn hàng</h6>
                    <div style={{ position: 'relative', paddingLeft: '30px' }}>
                      <div style={{
                        position: 'absolute',
                        left: '15px',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        backgroundColor: '#dee2e6'
                      }}></div>
                      
                      <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <div style={{
                          position: 'absolute',
                          left: '-23px',
                          top: 0,
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#0d6efd',
                          border: '2px solid #fff',
                          boxShadow: '0 0 0 2px #dee2e6'
                        }}></div>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          padding: '15px',
                          borderRadius: '8px',
                          borderLeft: '3px solid #0d6efd'
                        }}>
                          <h6 style={{ marginBottom: '5px', color: '#333' }}>📝 Đơn hàng được tạo</h6>
                          <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                            {formatDateTime(selectedOrder.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {selectedOrder.orderApprovedAt && (
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                          <div style={{
                            position: 'absolute',
                            left: '-23px',
                            top: 0,
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: '#198754',
                            border: '2px solid #fff',
                            boxShadow: '0 0 0 2px #dee2e6'
                          }}></div>
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            borderLeft: '3px solid #198754'
                          }}>
                            <h6 style={{ marginBottom: '5px', color: '#333' }}>✅ Đơn hàng được duyệt</h6>
                            <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                              {formatDateTime(selectedOrder.orderApprovedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.orderDeliveredCarrierDate && (
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                          <div style={{
                            position: 'absolute',
                            left: '-23px',
                            top: 0,
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: '#0dcaf0',
                            border: '2px solid #fff',
                            boxShadow: '0 0 0 2px #dee2e6'
                          }}></div>
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            borderLeft: '3px solid #0dcaf0'
                          }}>
                            <h6 style={{ marginBottom: '5px', color: '#333' }}>🚚 Đơn hàng được giao cho vận chuyển</h6>
                            <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                              {formatDateTime(selectedOrder.orderDeliveredCarrierDate)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.orderDeliveredCustomerDate && (
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                          <div style={{
                            position: 'absolute',
                            left: '-23px',
                            top: 0,
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: '#198754',
                            border: '2px solid #fff',
                            boxShadow: '0 0 0 2px #dee2e6'
                          }}></div>
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            borderLeft: '3px solid #198754'
                          }}>
                            <h6 style={{ marginBottom: '5px', color: '#333' }}>🎯 Đơn hàng được giao thành công</h6>
                            <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                              {formatDateTime(selectedOrder.orderDeliveredCustomerDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {orderDetails.length > 0 ? (
                  <div className="row mt-4">
                    <div className="col-12">
                      <h6 style={{ fontWeight: '600', marginBottom: '15px' }}>🛍️ Sản phẩm trong đơn hàng</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                              <th>Sản phẩm</th>
                              <th>Số lượng</th>
                              <th>Đơn giá</th>
                              <th>Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderDetails.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {item.productImage && (
                                      <img 
                                        src={item.productImage} 
                                        alt={item.productName}
                                        style={{ 
                                          width: '40px', 
                                          height: '40px', 
                                          objectFit: 'cover',
                                          borderRadius: '6px',
                                          marginRight: '8px',
                                          backgroundColor: '#f8f9fa'
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span>{item.productName}</span>
                                  </div>
                                </td>
                                <td>{item.quantity}</td>
                                <td>{formatPrice(item.price)}</td>
                                <td><strong style={{ color: '#198754' }}>{formatPrice(item.total)}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                              <th colSpan={3}>Tổng cộng:</th>
                              <th><strong style={{ color: '#198754', fontSize: '16px' }}>{formatPrice(selectedOrder.totalPrice)}</strong></th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row mt-4">
                    <div className="col-12">
                      <div style={{ 
                        backgroundColor: '#d1ecf1', 
                        color: '#0c5460', 
                        padding: '15px', 
                        borderRadius: '8px',
                        border: 'none'
                      }}>
                        ℹ️ Không thể tải chi tiết sản phẩm. Endpoint có thể chưa được implement hoặc đơn hàng chưa có sản phẩm.
                        <br />
                        <small>Order ID: {selectedOrder.id}</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ 
                padding: '20px', 
                borderTop: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowOrderModal(false)}
                  style={{ borderRadius: '6px' }}
                >
                  Đóng
                </button>
                
                {canExportInvoice(selectedOrder) && (
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => {
                      handleExportInvoice(selectedOrder);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === `invoice-${selectedOrder.id}`}
                    style={{ borderRadius: '6px' }}
                  >
                    {actionLoading === `invoice-${selectedOrder.id}` ? '⏳ Đang xuất...' : '🧾 Xuất hóa đơn'}
                  </button>
                )}
                
                {canApprove(selectedOrder) && (
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleApproveOrder(selectedOrder.id);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === selectedOrder.id}
                    style={{ borderRadius: '6px' }}
                  >
                    {actionLoading === selectedOrder.id ? '⏳ Đang xử lý...' : '✅ Duyệt đơn hàng'}
                  </button>
                )}
                
                {canShip(selectedOrder) && (
                  <button 
                    className="btn btn-info"
                    onClick={() => {
                      handleShipOrder(selectedOrder.id);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === selectedOrder.id}
                    style={{ borderRadius: '6px' }}
                  >
                    {actionLoading === selectedOrder.id ? '⏳ Đang xử lý...' : '🚚 Đánh dấu đã giao'}
                  </button>
                )}

                {canDeliver(selectedOrder) && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      handleDeliverOrder(selectedOrder.id);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === selectedOrder.id}
                    style={{ borderRadius: '6px' }}
                  >
                    {actionLoading === selectedOrder.id ? '⏳ Đang xử lý...' : '📦 Xác nhận giao hàng'}
                  </button>
                )}

                {canUpdateShipping(selectedOrder) && (
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => {
                      setShippingStatus({ orderId: selectedOrder.id, status: 'shipped' });
                      setShowShippingModal(true);
                      setShowOrderModal(false);
                    }}
                    style={{ borderRadius: '6px' }}
                  >
                    🚛 Cập nhật vận chuyển
                  </button>
                )}
                
                {canCancel(selectedOrder) && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setShowOrderModal(false);
                    }}
                    disabled={actionLoading === selectedOrder.id}
                    style={{ borderRadius: '6px' }}
                  >
                    {actionLoading === selectedOrder.id ? '⏳ Đang xử lý...' : '❌ Hủy đơn hàng'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Modal */}
        {showBulkModal && (
          <div className="modal-overlay" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="modal-content" style={{ 
              backgroundColor: 'white', 
              borderRadius: '10px', 
              width: '90%', 
              maxWidth: '500px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div className="modal-header" style={{ 
                padding: '20px', 
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  ⚡ Xử lý hàng loạt ({selectedOrders.length} đơn hàng)
                </h5>
                <button 
                  onClick={() => setShowBulkModal(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '24px', 
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600' }}>Chọn hành động:</label>
                  <select 
                    className="form-select"
                    value={bulkAction.action}
                    onChange={(e) => setBulkAction(prev => ({ ...prev, action: e.target.value as any }))}
                    style={{ borderRadius: '6px' }}
                  >
                    <option value="approve">✅ Duyệt đơn hàng</option>
                    <option value="ship">🚚 Đánh dấu đã giao</option>
                    <option value="deliver">📦 Xác nhận giao hàng</option>
                    <option value="cancel">❌ Hủy đơn hàng</option>
                  </select>
                </div>
                
                {bulkAction.action === 'cancel' && (
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600' }}>Lý do hủy:</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={bulkAction.note || ''}
                      onChange={(e) => setBulkAction(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Nhập lý do hủy đơn hàng..."
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                )}
                
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  color: '#856404', 
                  padding: '15px', 
                  borderRadius: '8px'
                }}>
                  ⚠️ Bạn sắp {
                    bulkAction.action === 'approve' ? 'duyệt' : 
                    bulkAction.action === 'ship' ? 'đánh dấu đã giao' : 
                    bulkAction.action === 'deliver' ? 'xác nhận giao hàng' : 'hủy'
                  } {selectedOrders.length} đơn hàng.
                  Hành động này không thể hoàn tác.
                </div>

                <div className="mt-3">
                  <small style={{ color: '#6c757d' }}>
                    Đơn hàng đã chọn: {selectedOrders.map(id => '#' + id.substring(0, 8)).join(', ')}
                  </small>
                </div>
              </div>

              <div className="modal-footer" style={{ 
                padding: '20px', 
                borderTop: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                  style={{ borderRadius: '6px' }}
                >
                  Hủy
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleBulkAction}
                  disabled={actionLoading === 'bulk' || (bulkAction.action === 'cancel' && !bulkAction.note?.trim())}
                  style={{ borderRadius: '6px' }}
                >
                  {actionLoading === 'bulk' ? '⏳ Đang xử lý...' : '✅ Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;