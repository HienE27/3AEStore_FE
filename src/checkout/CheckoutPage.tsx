import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getIdUserByToken } from '../utils/JwtService';
import { config } from '../config/environment';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  productName: string;
  buyingPrice: number;
  salePrice: number;
  comparePrice: number;
  shortDescription: string;
  quantity: number;
  galleryImage?: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  note?: string;
}

interface CustomerAddress {
  id?: string;
  recipient_name: string;
  address_line1: string;
  ward: string;
  district: string;
  address_line2?: string;
  phone_number: string;
  dial_code: string;
  country: string;
  postal_code: string;
  city: string;
  isDefault?: boolean;
  createdAt?: string;
}

interface CouponData {
  id: string;
  code: string;
  discountValue: number;
  discountType: string;
  orderAmountLimit?: number;
}

interface CheckoutResult {
  success: boolean;
  orderId?: string;
  message: string;
  originalTotal?: number;
  discountAmount?: number;
  finalTotal?: number;
}

// Danh sách 63 tỉnh thành Việt Nam
const vietnamProvinces = [
  { code: 'HCM', name: 'TP. Hồ Chí Minh' },
  { code: 'HN', name: 'Hà Nội' },
  { code: 'DN', name: 'Đà Nẵng' },
  { code: 'HP', name: 'Hải Phòng' },
  { code: 'CT', name: 'Cần Thơ' },
  { code: 'AG', name: 'An Giang' },
  { code: 'BR-VT', name: 'Bà Rịa - Vũng Tàu' },
  { code: 'BL', name: 'Bạc Liêu' },
  { code: 'BK', name: 'Bắc Kạn' },
  { code: 'BG', name: 'Bắc Giang' },
  { code: 'BN', name: 'Bắc Ninh' },
  { code: 'BT', name: 'Bến Tre' },
  { code: 'BD', name: 'Bình Dương' },
  { code: 'BĐ', name: 'Bình Định' },
  { code: 'BP', name: 'Bình Phước' },
  { code: 'BTh', name: 'Bình Thuận' },
  { code: 'CM', name: 'Cà Mau' },
  { code: 'CB', name: 'Cao Bằng' },
  { code: 'DL', name: 'Đắk Lắk' },
  { code: 'DN-Đắk Nông', name: 'Đắk Nông' },
  { code: 'ĐB', name: 'Điện Biên' },
  { code: 'ĐN', name: 'Đồng Nai' },
  { code: 'ĐT', name: 'Đồng Tháp' },
  { code: 'GL', name: 'Gia Lai' },
  { code: 'HG', name: 'Hà Giang' },
  { code: 'HNam', name: 'Hà Nam' },
  { code: 'HTinh', name: 'Hà Tĩnh' },
  { code: 'HD', name: 'Hải Dương' },
  { code: 'HB', name: 'Hòa Bình' },
  { code: 'HU', name: 'Thừa Thiên Huế' },
  { code: 'HY', name: 'Hưng Yên' },
  { code: 'KH', name: 'Khánh Hòa' },
  { code: 'KG', name: 'Kiên Giang' },
  { code: 'KT', name: 'Kon Tum' },
  { code: 'LC', name: 'Lai Châu' },
  { code: 'LĐ', name: 'Lâm Đồng' },
  { code: 'LS', name: 'Lạng Sơn' },
  { code: 'LC-LCai', name: 'Lào Cai' },
  { code: 'LA', name: 'Long An' },
  { code: 'ND', name: 'Nam Định' },
  { code: 'NB', name: 'Ninh Bình' },
  { code: 'NT', name: 'Ninh Thuận' },
  { code: 'PT', name: 'Phú Thọ' },
  { code: 'PY', name: 'Phú Yên' },
  { code: 'QB', name: 'Quảng Bình' },
  { code: 'QNam', name: 'Quảng Nam' },
  { code: 'QNgai', name: 'Quảng Ngãi' },
  { code: 'QNinh', name: 'Quảng Ninh' },
  { code: 'QTri', name: 'Quảng Trị' },
  { code: 'ST', name: 'Sóc Trăng' },
  { code: 'SL', name: 'Sơn La' },
  { code: 'TN', name: 'Tây Ninh' },
  { code: 'TB', name: 'Thái Bình' },
  { code: 'TN-ThaiNguyen', name: 'Thái Nguyên' },
  { code: 'TH', name: 'Thanh Hóa' },
  { code: 'TG', name: 'Tiền Giang' },
  { code: 'TV', name: 'Trà Vinh' },
  { code: 'TQ', name: 'Tuyên Quang' },
  { code: 'VL', name: 'Vĩnh Long' },
  { code: 'VP', name: 'Vĩnh Phúc' },
  { code: 'YB', name: 'Yên Bái' }
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const customerId = getIdUserByToken() || '';
  const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);

  // State lưu các item đã chọn
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phoneNumber: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    note: ''
  });
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderResult, setOrderResult] = useState<CheckoutResult | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [saveCurrentAddress, setSaveCurrentAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const { refreshCartCount } = useCart();
  
  // Utility functions
  const formatPrice = (price: number): string => {
    if (isNaN(price) || price < 0) price = 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getItemPrice = (product: Product): number => {
    const buyingPrice = product.buyingPrice ?? 0;
    const comparePrice = product.comparePrice ?? 0;
    const salePrice = product.salePrice ?? 0;
    const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    return isOnSale ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const calculateEstimatedDeliveryDate = useCallback(() => {
    const now = new Date();
    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + (shippingInfo.province === 'TP. Hồ Chí Minh' ? 1 : 3));
    return deliveryDate.toLocaleDateString('vi-VN');
  }, [shippingInfo.province]);

  // Address management functions
  const loadSavedAddresses = useCallback(async () => {
    if (!customerId) return;
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/customer-addresses/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSavedAddresses(response.data || []);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  }, [customerId]);

  const loadLatestAddress = useCallback(async () => {
    if (!customerId) return;
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/customer-addresses/customer/${customerId}/latest`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data) {
        const address = response.data;
        setShippingInfo({
          fullName: address.recipient_name || '',
          phoneNumber: address.phone_number || '',
          address: address.address_line1 || '',
          ward: address.ward || '',
          district: address.district || '',
          province: address.city || '',
          note: address.address_line2 || ''
        });
      }
    } catch (error) {
      console.error('Error loading latest address:', error);
    }
  }, [customerId]);

  const saveCurrentAddressToDb = useCallback(async () => {
    if (!customerId || !shippingInfo.address.trim()) return;
    setAddressLoading(true);
    try {
      const addressData = {
        customerId: customerId,
        recipient_name: shippingInfo.fullName,
        address_line1: shippingInfo.address,
        ward: shippingInfo.ward,
        district: shippingInfo.district,
        address_line2: shippingInfo.note || '',
        phone_number: shippingInfo.phoneNumber,
        dial_code: '+84',
        country: 'Vietnam',
        postal_code: '00000',
        city: shippingInfo.province
      };

      await axios.post(`${config.API_BASE_URL}/api/customer-addresses/save`, addressData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await loadSavedAddresses();
      setSaveCurrentAddress(false);

      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
      successAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; width: 300px;';
      successAlert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Đã lưu địa chỉ thành công!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(successAlert);
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 3000);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Không thể lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setAddressLoading(false);
    }
  }, [customerId, shippingInfo, loadSavedAddresses]);

  const selectSavedAddress = useCallback((address: CustomerAddress) => {
    setShippingInfo(prev => ({
      ...prev,
      fullName: address.recipient_name || '',
      phoneNumber: address.phone_number || '',
      address: address.address_line1 || '',
      ward: address.ward || '',
      district: address.district || '',
      province: address.city || '',
      note: address.address_line2 || ''
    }));
    setShowSavedAddresses(false);
  }, []);

  const deleteSavedAddress = useCallback(async (addressId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await axios.delete(`${config.API_BASE_URL}/api/customer-addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await loadSavedAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  }, [loadSavedAddresses]);

  const loadCartItemsData = useCallback(async () => {
    setLoading(true);

    // Kiểm tra callback VNPay
    const urlParams = new URLSearchParams(window.location.search);
    const isVNPayCallback = urlParams.get('success') && urlParams.get('orderId');

    try {
      const res = await axios.get(`${config.API_BASE_URL}/cardItems/search/findByCard_Customer_Id?customerId=${customerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = res.data as { _embedded?: { cardItems: { id: string, quantity: number }[] } };
      const items = data._embedded?.cardItems || [];
      
      if (items.length === 0) {
        // Nếu KHÔNG phải callback từ VNPay thì mới chuyển trang
        if (!isVNPayCallback) {
          navigate('/cart');
        }
        return;
      }
      
      const detailedItems = await Promise.allSettled(items.map(async item => {
        try {
          const productRes = await axios.get<Product>(`${config.API_BASE_URL}/cardItems/search/findProductByCardItemId?cardItemId=${item.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          let product = productRes.data;
          try {
            const galleryRes = await axios.get<{ _embedded: { galleries: { image: string, isThumbnail: boolean }[] } }>(
              `${config.API_BASE_URL}/gallerys/search/findByProduct`,
              {
                params: { product: `/api/products/${product.id}` },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              }
            );
            const galleries = galleryRes.data._embedded?.galleries || [];
            const thumbnailImage = galleries.find(g => g.isThumbnail)?.image || galleries[0]?.image || "/images/default-image.jpg";
            product = { ...product, galleryImage: thumbnailImage };
          } catch {
            product = { ...product, galleryImage: "/images/default-image.jpg" };
          }
          return {
            id: item.id,
            quantity: item.quantity,
            product,
          } as CartItem;
        } catch {
          return null;
        }
      }));
      
      const validItems = detailedItems
        .filter((result): result is PromiseFulfilledResult<CartItem> =>
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      setCartItems(validItems);
    } catch (err) {
      // Nếu KHÔNG phải callback từ VNPay thì mới chuyển trang
      if (!isVNPayCallback) {
        navigate('/cart');
      }
    } finally {
      setLoading(false);
    }
  }, [customerId, navigate]);

  const navigateToOrders = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    navigate('/profile/orders', {
      state: { reload: true },
      replace: true
    });
  }, [navigate]);

  const clearSelectedCartItems = useCallback(async () => {
    try {
      // Lấy danh sách các item đã được chọn để thanh toán
      const selectedCartItemIds = JSON.parse(localStorage.getItem('selected_cart_items') || '[]');
      
      if (selectedCartItemIds.length === 0) {
        console.log('Không có item nào được chọn để xóa');
        return;
      }

      console.log('Clearing selected items:', selectedCartItemIds);
      
      // Gọi API để xóa các items đã chọn
      const response = await axios.delete(
        `${config.API_BASE_URL}/api/cards/clear-selected/${customerId}`,
        {
          data: selectedCartItemIds,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        console.log(`Đã xóa ${response.data.deletedCount} sản phẩm khỏi giỏ hàng`);
        
        // Xóa khỏi localStorage
        localStorage.removeItem('selected_cart_items');
        localStorage.removeItem('cart_selected_items');
        localStorage.removeItem('selected_cart_items_details');
        
        // Refresh cart count
        await refreshCartCount();

        // *** KHÔNG RELOAD CART DATA ĐỂ TRÁNH GIÁN ĐOẠN MODAL ***
        // await loadCartItemsData(); // Bỏ comment này để tránh reload
      } else {
        console.error('Lỗi khi xóa items:', response.data.message);
      }

    } catch (error) {
      console.error('Error clearing selected cart items:', error);
      // Không throw error để không làm gián đoạn flow checkout success
    }
  }, [customerId, refreshCartCount]);

  // =================== SỬA LẠI handleCheckoutSuccess ===================

const handleCheckoutSuccess = useCallback(async (result: CheckoutResult) => {
  console.log('=== CHECKOUT SUCCESS DEBUG ===');
  console.log('result:', result);
  console.log('Bắt đầu xử lý checkout success...');

  // *** BƯỚC 1: ƯU TIÊN TUYỆT ĐỐI - SET MODAL SUCCESS NGAY LẬP TỨC ***
  console.log('Bước 1: Setting modal success...');
  setOrderResult(result);
  setShowSuccessModal(true);
  console.log('Modal success đã được set:', { orderResult: result, showSuccessModal: true });

  // *** BƯỚC 2: XỬ LÝ CÁC TASK PHỤ (KHÔNG ĐƯỢC FAIL) ***
  try {
    console.log('Bước 2: Xử lý các task phụ...');

    // Lưu địa chỉ nếu cần
    if (saveCurrentAddress) {
      console.log('Đang lưu địa chỉ hiện tại...');
      try {
        await saveCurrentAddressToDb();
        console.log('Lưu địa chỉ thành công');
      } catch (addressError) {
        console.error('Lỗi khi lưu địa chỉ (không ảnh hưởng đến modal):', addressError);
      }
    }

    // Xóa items đã chọn khỏi giỏ hàng
    console.log('Đang xóa items đã chọn khỏi giỏ hàng...');
    try {
      await clearSelectedCartItems();
      console.log('Xóa items thành công');
    } catch (clearError) {
      console.error('Lỗi khi xóa items (không ảnh hưởng đến modal):', clearError);
    }

    // Set timeout để chuyển trang
    console.log('Setting timeout để chuyển trang sau 5 giây...');
    timeoutRef.current = setTimeout(() => {
      if (!isNavigatingRef.current) {
        console.log('Timeout: Chuyển đến trang orders');
        navigateToOrders();
      }
    }, 5000);

    console.log('Hoàn thành tất cả các bước xử lý checkout success');

  } catch (error) {
    console.error('Lỗi trong quá trình xử lý checkout success (modal vẫn hiển thị):', error);
    // *** QUAN TRỌNG: Dù có lỗi gì đi nữa, modal vẫn phải hiển thị ***
    // Modal đã được set ở bước 1, không cần làm gì thêm
  }
}, [clearSelectedCartItems, navigateToOrders, saveCurrentAddress, saveCurrentAddressToDb]);

  // Form validation functions
  const validateField = (field: keyof ShippingInfo, value: string) => {
    const errors = { ...formErrors };
    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Vui lòng nhập họ tên';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        } else {
          delete errors.fullName;
        }
        break;
      case 'phoneNumber':
        if (!value.trim()) {
          errors.phoneNumber = 'Vui lòng nhập số điện thoại';
        } else if (!isValidPhoneNumber(value)) {
          errors.phoneNumber = 'Số điện thoại không hợp lệ';
        } else {
          delete errors.phoneNumber;
        }
        break;
      case 'address':
        if (!value.trim()) {
          errors.address = 'Vui lòng nhập địa chỉ cụ thể';
        } else if (value.trim().length < 5) {
          errors.address = 'Địa chỉ quá ngắn';
        } else {
          delete errors.address;
        }
        break;
      case 'ward':
        if (!value.trim()) {
          errors.ward = 'Vui lòng nhập phường/xã';
        } else {
          delete errors.ward;
        }
        break;
      case 'district':
        if (!value.trim()) {
          errors.district = 'Vui lòng nhập quận/huyện';
        } else {
          delete errors.district;
        }
        break;
      case 'province':
        if (!value.trim()) {
          errors.province = 'Vui lòng chọn tỉnh/thành phố';
        } else {
          delete errors.province;
        }
        break;
    }
    setFormErrors(errors);
  };

  const handleShippingInfoChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    validateField(field, value);
  };

  const isFormComplete = () => {
    const { fullName, phoneNumber, address, ward, district, province } = shippingInfo;
    return (
      typeof fullName === "string" && fullName.trim().length > 0 &&
      typeof phoneNumber === "string" && phoneNumber.trim().length > 0 &&
      typeof address === "string" && address.trim().length > 0 &&
      typeof ward === "string" && ward.trim().length > 0 &&
      typeof district === "string" && district.trim().length > 0 &&
      typeof province === "string" && province.trim().length > 0 &&
      Object.keys(formErrors).length === 0
    );
  };

  // Coupon functions
  const validateCoupon = async (code: string, orderAmount: number) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/coupons/validate/${code}`, {
        params: { orderAmount },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { valid: false, message: 'Mã giảm giá không tồn tại' };
      } else if (error.response?.status === 400) {
        return { valid: false, message: error.response.data?.message || 'Mã giảm giá không hợp lệ' };
      }
      return { valid: false, message: 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại sau.' };
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }
    setCouponLoading(true);
    try {
      const subtotal = calculateSubtotal();
      const validation = await validateCoupon(couponCode, subtotal);
      if (validation.valid && validation.coupon) {
        setAppliedCoupon(validation.coupon);
        alert('Áp dụng mã giảm giá thành công!');
      } else {
        alert(validation.message || 'Mã giảm giá không hợp lệ');
        setAppliedCoupon(null);
      }
    } catch {
      alert('Có lỗi xảy ra khi kiểm tra mã giảm giá');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // *** SỬA LẠI CÁC HÀM TÍNH TOÁN ĐỂ FALLBACK ***
  const calculateSubtotal = () => {
    console.log('calculateSubtotal called, selectedCartItems:', selectedCartItems.length);
    
    if (selectedCartItems.length > 0) {
      return selectedCartItems.reduce((total, item) => {
        const itemPrice = getItemPrice(item.product);
        return total + (itemPrice * item.quantity);
      }, 0);
    }
    
    // Fallback: lấy từ localStorage
    const savedDetails = localStorage.getItem('selected_cart_items_details');
    if (savedDetails) {
      try {
        const details = JSON.parse(savedDetails);
        const total = details.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        console.log('Using saved details for subtotal:', total);
        return total;
      } catch (e) {
        console.log('Error parsing saved details');
      }
    }
    return 0;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return Math.min(subtotal * (appliedCoupon.discountValue / 100), subtotal);
    } else {
      return Math.min(appliedCoupon.discountValue, subtotal);
    }
  };

  const calculateShippingFee = () => {
    const subtotal = calculateSubtotal();
    const baseShippingFee = subtotal >= 500000 ? 0 : 30000;
    if (paymentMethod === 'BANK_TRANSFER' && baseShippingFee > 0) {
      const discount = Math.max(baseShippingFee * 0.02, 5000);
      return Math.max(baseShippingFee - discount, 0);
    }
    return baseShippingFee;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shippingFee = calculateShippingFee();
    return Math.max(subtotal - discount + shippingFee, 0);
  };

  // Order submission functions
  const validateForm = (): boolean => {
    // *** KHÔNG KIỂM TRA selectedCartItems TRONG validateForm ***
    // Vì có thể selectedCartItems rỗng nhưng có dữ liệu trong localStorage
    
    const { fullName, phoneNumber, address, ward, district, province } = shippingInfo;
    if (!fullName.trim()) {
      alert('Vui lòng nhập họ tên');
      return false;
    }
    if (!phoneNumber.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Số điện thoại không hợp lệ');
      return false;
    }
    if (!address.trim() || !ward.trim() || !district.trim() || !province.trim()) {
      alert('Vui lòng điền đầy đủ địa chỉ giao hàng');
      return false;
    }
    if (address === ward || address === district) {
      alert('Địa chỉ cụ thể không được trùng với phường/xã hoặc quận/huyện');
      return false;
    }
    return true;
  };

  const handleVNPayPayment = async (orderId: string) => {
    setCheckoutLoading(true);
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/payments/vnpay`, {
        orderId,
        amount: calculateTotal(),
        customerId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const paymentUrl = response.data.paymentUrl;
      if (paymentUrl) {
        localStorage.setItem('vnpay_callback', 'pending');
        window.location.href = paymentUrl;
      }
    } catch (error: any) {
      alert('Lỗi khi tạo thanh toán VNPay: ' + (error.response?.data?.message || error.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // =================== SỬA LẠI handleSubmitOrder ĐỂ ĐẢM BẢO CALL handleCheckoutSuccess ===================

const handleSubmitOrder = async () => {
  console.log('=== DEBUG GỬI ĐƠN HÀNG ===');
  console.log('Số sản phẩm đã chọn:', selectedCartItems.length);

  if (!validateForm()) return;
  setCheckoutLoading(true);

  try {
    // *** ĐẢM BẢO CÓ DỮ LIỆU SẢN PHẨM ĐỂ ĐẶT HÀNG ***
    let orderDetails = [];
    let hasValidProducts = false;

    // Kiểm tra selectedCartItems trước
    if (selectedCartItems.length > 0) {
      console.log('Sử dụng selectedCartItems:', selectedCartItems.length);
      orderDetails = selectedCartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: getItemPrice(item.product),
        productName: item.product.productName
      }));
      hasValidProducts = true;

      // Lưu thông tin chi tiết vào localStorage để đảm bảo tính nhất quán
      localStorage.setItem('selected_cart_items_details', JSON.stringify(orderDetails));
      console.log('Đã lưu orderDetails vào localStorage:', orderDetails);

      // Kiểm tra tồn kho cho những sản phẩm đã chọn
      const stockValidation = await Promise.all(
        selectedCartItems.map(async (item) => {
          try {
            const productRes = await axios.get(`${config.API_BASE_URL}/api/products/${item.product.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            return productRes.data.quantity >= item.quantity
              ? null
              : `Sản phẩm ${item.product.productName} chỉ còn ${productRes.data.quantity} trong kho.`;
          } catch (e) {
            return `Không thể kiểm tra tồn kho cho sản phẩm ${item.product.productName}`;
          }
        })
      );

      const stockErrors = stockValidation.filter((error) => error !== null);
      if (stockErrors.length > 0) {
        alert(stockErrors.join('\n'));
        setCheckoutLoading(false);
        return;
      }
    } else {
      // Fallback: sử dụng dữ liệu từ localStorage
      console.log('selectedCartItems rỗng, sử dụng fallback từ localStorage');
      const savedDetails = localStorage.getItem('selected_cart_items_details');
      if (savedDetails) {
        try {
          const details = JSON.parse(savedDetails);
          if (details && details.length > 0) {
            orderDetails = details.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              productName: item.productName || 'Sản phẩm'
            }));
            hasValidProducts = true;
            console.log('Sử dụng dữ liệu dự phòng từ localStorage:', orderDetails);
          }
        } catch (e) {
          console.error('Lỗi parse localStorage:', e);
        }
      }
    }

    // *** KIỂM TRA CUỐI CÙNG ***
    if (!hasValidProducts || orderDetails.length === 0) {
      console.error('Không có sản phẩm hợp lệ để đặt hàng');
      alert('Không có sản phẩm để đặt hàng. Vui lòng quay lại giỏ hàng và chọn sản phẩm.');
      setCheckoutLoading(false);
      navigate('/cart');
      return;
    }

    console.log('Tiến hành đặt hàng với orderDetails:', orderDetails);

    const fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.province}`;

    const checkoutData = {
      customerId,
      orderDetails,
      couponCode: appliedCoupon?.code,
      shippingAddress: fullAddress,
      paymentMethod,
      phoneNumber: shippingInfo.phoneNumber,
      note: shippingInfo.note || "Không có ghi chú"
    };

    console.log('Gửi checkoutData:', checkoutData);

    const response = await axios.post(`${config.API_BASE_URL}/api/orders/checkout`, checkoutData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const result = response.data;
    console.log('Kết quả checkout từ API:', result);

    if (result.orderId) {
      if (paymentMethod === 'BANK_TRANSFER') {
        console.log('Chuyển hướng đến VNPay...');
        await handleVNPayPayment(result.orderId);
        return;
      }

      // *** COD: ĐẢM BẢO LUÔN HIỂN THỊ MODAL SUCCESS ***
      if (paymentMethod === 'COD') {
        const checkoutResult: CheckoutResult = {
          success: true,
          orderId: result.orderId,
          message: result.message || 'Đặt hàng thành công!',
          originalTotal: result.originalTotal || calculateSubtotal(),
          discountAmount: result.discountAmount || calculateDiscount(),
          finalTotal: Math.max(result.finalTotal || calculateTotal(), 0)
        };

        console.log('=== COD THÀNH CÔNG ===');
        console.log('checkoutResult:', checkoutResult);
        console.log('Gọi handleCheckoutSuccess...');

        // *** QUAN TRỌNG: ĐẢM BẢO handleCheckoutSuccess ĐƯỢC GỌI ***
        await handleCheckoutSuccess(checkoutResult);

        console.log('handleCheckoutSuccess hoàn thành, modal should be visible now');
      }
    } else {
      console.error('Không có orderId trong response:', result);
      alert(result.message || 'Đặt hàng thất bại');
    }
  } catch (error: any) {
    console.error('Lỗi trong handleSubmitOrder:', error);
    alert('Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại. Chi tiết: ' + (error.response?.data?.message || error.message));
  } finally {
    setCheckoutLoading(false);
  }
};

  // Modal handlers
  const handleContinueShopping = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSuccessModal(false);
    setOrderResult(null);
    isNavigatingRef.current = false;
    navigate('/', { replace: true });
  };

  const handleViewOrder = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSuccessModal(false);
    setOrderResult(null);
    navigateToOrders();
  };

  // useEffect hooks
  useEffect(() => {
    if (!customerId || !UUID_REGEX.test(customerId)) {
      alert('Lỗi: ID khách hàng không hợp lệ');
      navigate('/login');
      return;
    }
    loadCartItemsData();
    loadSavedAddresses();
    loadLatestAddress();
  }, [customerId, navigate, loadCartItemsData, loadSavedAddresses, loadLatestAddress]);

  useEffect(() => {
    if (shippingInfo.province) {
      setEstimatedDelivery(calculateEstimatedDeliveryDate());
    }
  }, [shippingInfo.province, calculateEstimatedDeliveryDate]);

  // *** SỬA LẠI USEEFFECT ĐỂ XỬ LÝ selectedCartItems ***
  useEffect(() => {
    console.log('=== DEBUG KHỞI TẠO TRANG THANH TOÁN ===');
    console.log('Số lượng sản phẩm trong giỏ:', cartItems.length);

    // Kiểm tra xem có phải đang xử lý kết quả thanh toán không
    const urlParams = new URLSearchParams(window.location.search);
    const isVNPayCallback = urlParams.get('success') && urlParams.get('orderId');
    const isProcessingSuccess = showSuccessModal || orderResult;

    console.log('Callback từ VNPay:', isVNPayCallback);
    console.log('Đang xử lý thành công:', isProcessingSuccess);

    // *** QUAN TRỌNG: Nếu đang hiển thị modal success, KHÔNG chuyển hướng ***
    if (isProcessingSuccess) {
      console.log('Đang hiển thị modal success, bỏ qua logic chuyển hướng');
      // Vẫn cho phép set selectedCartItems nhưng không chuyển hướng
    }

    // Lấy selectedIds từ localStorage
    const selectedIds = JSON.parse(localStorage.getItem('selected_cart_items') || '[]');
    console.log('ID sản phẩm đã chọn từ localStorage:', selectedIds);

    if (cartItems.length > 0) {
      if (selectedIds.length > 0) {
        // Chỉ lấy những items có ID trong selectedIds
        const validSelectedItems = cartItems.filter(item => selectedIds.includes(item.id));
        console.log('Sản phẩm hợp lệ đã chọn:', validSelectedItems.length);
        setSelectedCartItems(validSelectedItems);

        // *** LƯU CHI TIẾT SẢN PHẨM ĐÃ CHỌN VÀO LOCALSTORAGE ***
        const selectedDetails = validSelectedItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: getItemPrice(item.product),
          productName: item.product.productName
        }));
        localStorage.setItem('selected_cart_items_details', JSON.stringify(selectedDetails));
        console.log('Đã lưu chi tiết sản phẩm đã chọn vào localStorage:', selectedDetails);

      } else if (cartItems.length === 1) {
        // Nếu chỉ có 1 sản phẩm trong giỏ hàng, tự động chọn
        console.log('Tự động chọn sản phẩm duy nhất trong giỏ');
        setSelectedCartItems([cartItems[0]]);

        // *** LƯU VÀO LOCALSTORAGE ĐỂ ĐẢM BẢO TÍNH NHẤT QUÁN ***
        localStorage.setItem('selected_cart_items', JSON.stringify([cartItems[0].id]));

        // *** LƯU CHI TIẾT SẢN PHẨM DUY NHẤT ***
        const singleItemDetails = [{
          productId: cartItems[0].product.id,
          quantity: cartItems[0].quantity,
          price: getItemPrice(cartItems[0].product),
          productName: cartItems[0].product.productName
        }];
        localStorage.setItem('selected_cart_items_details', JSON.stringify(singleItemDetails));
        console.log('Đã lưu chi tiết sản phẩm duy nhất vào localStorage:', singleItemDetails);

      } else {
        console.log('Không tìm thấy sản phẩm đã chọn');
        setSelectedCartItems([]);

        // Chỉ chuyển hướng nếu không đang xử lý success và không phải VNPay callback
        if (!isVNPayCallback && !isProcessingSuccess) {
          setTimeout(() => {
            // Kiểm tra lại sau 2 giây xem có đang xử lý success không
            if (!showSuccessModal && !orderResult) {
              console.log('Chuyển hướng về trang giỏ hàng sau timeout');
              navigate('/cart');
            }
          }, 2000);
        }
      }
    } else {
      // *** TRƯỜNG HỢP KHÔNG CÓ SẢN PHẨM TRONG GIỎ ***
      console.log('Không có sản phẩm trong giỏ hàng');

      // Kiểm tra xem có đang trong quá trình checkout success không
      if (!isVNPayCallback && !isProcessingSuccess) {
        // Kiểm tra xem có dữ liệu fallback không
        const savedDetails = localStorage.getItem('selected_cart_items_details');
        if (!savedDetails) {
          // Chỉ chuyển hướng nếu không có modal success đang hiển thị và không có dữ liệu fallback
          setTimeout(() => {
            if (!showSuccessModal && !orderResult) {
              console.log('Chuyển hướng về trang giỏ hàng - không có sản phẩm và không có dữ liệu fallback');
              navigate('/cart');
            }
          }, 2000);
        }
      }
    }
  }, [cartItems, navigate, showSuccessModal, orderResult]); // Thêm lại dependencies để theo dõi modal state

  //  =================== SỬA LẠI VNPAY CALLBACK USEEFFECT ===================

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const orderId = urlParams.get('orderId');

  console.log('=== VNPAY CALLBACK DEBUG ===');
  console.log('VNPay callback check:', { success, orderId });

  if (success && orderId) {
    const isSuccess = success === 'true';
    console.log('Đang xử lý VNPay callback...', { isSuccess, orderId });

    const showVNPayResult = async () => {
      console.log('=== BẮT ĐẦU XỬ LÝ VNPAY RESULT ===');

      // *** BƯỚC 1: TẠO RESULT VÀ HIỂN THỊ MODAL NGAY LẬP TỨC ***
      let orderInfo = null;
      try {
        console.log('Đang lấy thông tin order từ API...');
        const res = await axios.get(`${config.API_BASE_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        orderInfo = res.data;
        console.log('Thông tin order từ API:', orderInfo);
      } catch (e) {
        console.log('Không thể lấy thông tin order từ API (sẽ dùng fallback):', e);
      }

      // Tạo result với thông tin có sẵn
      const result: CheckoutResult = {
        success: isSuccess,
        orderId,
        message: isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!',
        originalTotal: orderInfo?.originalTotal || calculateSubtotal(),
        discountAmount: orderInfo?.discountAmount || calculateDiscount(),
        finalTotal: orderInfo?.finalTotal || calculateTotal()
      };

      console.log('=== VNPay result được tạo ===');
      console.log('result:', result);

      // *** HIỂN THỊ MODAL NGAY LẬP TỨC - ƯU TIÊN TUYỆT ĐỐI ***
      console.log('Setting modal success cho VNPay...');
      setOrderResult(result);
      setShowSuccessModal(true);
      console.log('Modal success đã được set cho VNPay');

      // *** BƯỚC 2: XỬ LÝ CÁC TASK PHỤ CHỈ KHI THÀNH CÔNG ***
      if (isSuccess) {
        try {
          console.log('VNPay thành công, đang xóa selected items...');
          await clearSelectedCartItems();
          console.log('Đã xóa selected items thành công');

          console.log('Setting timeout để chuyển trang...');
          timeoutRef.current = setTimeout(() => {
            if (!isNavigatingRef.current) {
              console.log('Timeout: Chuyển đến trang orders từ VNPay');
              navigateToOrders();
            }
          }, 5000);
        } catch (error) {
          console.error('Lỗi khi xử lý task phụ VNPay (modal vẫn hiển thị):', error);
        }
      } else {
        console.log('VNPay thất bại, không xóa items');
      }

      // Clean URL
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('Đã clean URL');
      } catch (e) {
        console.log('Không thể clean URL:', e);
      }

      console.log('=== HOÀN THÀNH XỬ LÝ VNPAY CALLBACK ===');
    };

    // Gọi hàm xử lý
    showVNPayResult().catch(error => {
      console.error('Lỗi nghiêm trọng trong VNPay callback:', error);

      // *** FALLBACK CUỐI CÙNG: VẪN PHẢI HIỂN THỊ MODAL ***
      const fallbackResult: CheckoutResult = {
        success: isSuccess,
        orderId,
        message: isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!',
        originalTotal: 0,
        discountAmount: 0,
        finalTotal: 0
      };

      console.log('Sử dụng fallback result:', fallbackResult);
      setOrderResult(fallbackResult);
      setShowSuccessModal(true);
      console.log('Fallback modal đã được set');
    });
  }
}, [clearSelectedCartItems, navigateToOrders, calculateTotal, calculateSubtotal, calculateDiscount]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;
    if (showSuccessModal && orderResult?.success) {

      setCountdown(5);
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownInterval) clearInterval(countdownInterval);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showSuccessModal, orderResult?.success]);



  // Loading state
  // if (loading) {
  //   return (
  //     <div className="container py-5">
  //       <div className="text-center">
  //         <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
  //           <span className="visually-hidden">Đang tải...</span>
  //         </div>
  //         <p className="mt-3 text-muted">Đang tải thông tin đơn hàng...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Loading state
if (loading) {
  return (
    <div className="container py-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải thông tin đơn hàng...</p>
      </div>
    </div>
  );
}

  // *** SỬA LẠI PHẦN RENDER ĐỂ KHÔNG BLOCK KHI ĐANG XỬ LÝ SUCCESS ***
  const urlParams = new URLSearchParams(window.location.search);
  const isVNPayCallback = urlParams.get('success') && urlParams.get('orderId');

// *** CHỈ HIỂN THỊ EMPTY STATE KHI THỰC SỰ KHÔNG CÓ DỮ LIỆU ***
if (!loading &&
    cartItems.length === 0 &&
    selectedCartItems.length === 0 &&
    !isVNPayCallback &&
    !showSuccessModal &&
    !orderResult) {

  // Kiểm tra xem có dữ liệu fallback trong localStorage không
  const savedDetails = localStorage.getItem('selected_cart_items_details');
  if (!savedDetails) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4>Không có sản phẩm để thanh toán</h4>
          <p className="text-muted">Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/cart')}
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }
}


  // Calculate values for display
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shippingFee = calculateShippingFee();
  const total = calculateTotal();

  // *** DEBUG MODAL STATE ***
  console.log('=== RENDER STATE ===');
  console.log('showSuccessModal:', showSuccessModal);
  console.log('orderResult:', orderResult);
  console.log('Modal should be visible:', showSuccessModal && orderResult);



  // UI Render
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12 mb-4">
          <h2 className="mb-0">
            <i className="fas fa-credit-card me-2 text-primary"></i>
            Thanh toán đơn hàng
          </h2>
          <span className="badge bg-secondary ms-3">
            {selectedCartItems.length || 'đang tải...'} sản phẩm đã chọn
          </span>
          {cartItems.length > selectedCartItems.length && selectedCartItems.length > 0 && (
            <span className="badge bg-warning ms-2">
              {cartItems.length - selectedCartItems.length} sản phẩm khác trong giỏ
            </span>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Shipping Information Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-shipping-fast me-2"></i>
                  Thông tin giao hàng
                </h5>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    className={`btn btn-sm fw-bold shadow-sm
    ${showSavedAddresses
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary border-primary'}
  `}
                    onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                    style={{
                      border: '2px solid',
                      borderColor: showSavedAddresses ? '#0d6efd' : '#0d6efd',
                      borderRadius: 24,
                      padding: '10px 22px',
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: showSavedAddresses ? '0 3px 12px 0 rgba(13,110,253,.08)' : 'none',
                      outline: 'none',
                      transition: 'all 0.2s',
                      letterSpacing: 0.1,
                    }}
                  >
                    <i className="fas fa-address-book me-2"></i>
                    {showSavedAddresses ? 'Ẩn địa chỉ đã lưu' : `Địa chỉ đã lưu (${savedAddresses.length})`}
                    <i className={`fas ms-2 ${showSavedAddresses ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </button>

                )}
              </div>
            </div>
            <div className="card-body">
              {/* Saved Addresses Section - IMPROVED */}
              {showSavedAddresses && savedAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="alert alert-primary border-0" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-address-book text-white"></i>
                      </div>
                      <h6 className="mb-0 text-primary fw-bold">Chọn địa chỉ đã lưu</h6>
                    </div>
                    <div className="row g-3">
                      {savedAddresses.map((address, index) => (
                        <div key={address.id} className="col-12">
                          <div className="card border-0 shadow-sm h-100" style={{
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                            }}>
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                                      <i className="fas fa-user text-success" style={{ fontSize: '12px' }}></i>
                                    </div>
                                    <h6 className="mb-0 fw-bold text-dark">{address.recipient_name}</h6>
                                    {index === 0 && (
                                      <span className="badge bg-success ms-2" style={{ fontSize: '10px' }}>Mới nhất</span>
                                    )}
                                  </div>
                                  <div className="d-flex align-items-start mb-2">
                                    <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center me-2 mt-1" style={{ width: '20px', height: '20px' }}>
                                      <i className="fas fa-map-marker-alt text-info" style={{ fontSize: '10px' }}></i>
                                    </div>
                                    <span className="text-muted small">
                                      {address.address_line1}, {address.ward}, {address.district}, {address.city}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '20px', height: '20px' }}>
                                      <i className="fas fa-phone text-warning" style={{ fontSize: '10px' }}></i>
                                    </div>
                                    <span className="text-muted small">{address.phone_number}</span>
                                  </div>
                                  {address.address_line2 && (
                                    <div className="d-flex align-items-center">
                                      <div className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '20px', height: '20px' }}>
                                        <i className="fas fa-sticky-note text-secondary" style={{ fontSize: '10px' }}></i>
                                      </div>
                                      <span className="text-muted small">{address.address_line2}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="d-flex flex-column gap-2 ms-3">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => selectSavedAddress(address)}
                                    style={{
                                      borderRadius: '8px',
                                      padding: '8px 16px',
                                      fontWeight: '500',
                                      fontSize: '13px'
                                    }}
                                  >
                                    <i className="fas fa-check me-1"></i>
                                    Chọn
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => deleteSavedAddress(address.id!)}
                                    style={{
                                      borderRadius: '8px',
                                      padding: '8px 16px',
                                      fontWeight: '500',
                                      fontSize: '13px'
                                    }}
                                  >
                                    <i className="fas fa-trash me-1"></i>
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowSavedAddresses(false)}
                        style={{ borderRadius: '20px', padding: '8px 20px' }}
                      >
                        <i className="fas fa-times me-1"></i>
                        Đóng danh sách
                      </button>
                    </div>
                  </div>
                </div>
                
              )}

              {/* Shipping Form */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.fullName ? 'is-invalid' : shippingInfo.fullName.trim() ? 'is-valid' : ''}`}
                    value={shippingInfo.fullName}
                    onChange={(e) => handleShippingInfoChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    required
                  />
                  {formErrors.fullName && (
                    <div className="invalid-feedback">{formErrors.fullName}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : shippingInfo.phoneNumber.trim() && isValidPhoneNumber(shippingInfo.phoneNumber) ? 'is-valid' : ''}`}
                    value={shippingInfo.phoneNumber}
                    onChange={(e) => handleShippingInfoChange('phoneNumber', e.target.value)}
                    placeholder="0xxx xxx xxx"
                    required
                  />
                  {formErrors.phoneNumber && (
                    <div className="invalid-feedback">{formErrors.phoneNumber}</div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">
                    Tỉnh/Thành phố <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${formErrors.province ? 'is-invalid' : shippingInfo.province ? 'is-valid' : ''}`}
                    value={shippingInfo.province}
                    onChange={(e) => handleShippingInfoChange('province', e.target.value)}
                    required
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {vietnamProvinces.map(province => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.province && (
                    <div className="invalid-feedback">{formErrors.province}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">
                    Quận/Huyện <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.district ? 'is-invalid' : shippingInfo.district.trim() ? 'is-valid' : ''}`}
                    value={shippingInfo.district}
                    onChange={(e) => handleShippingInfoChange('district', e.target.value)}
                    placeholder="Nhập quận/huyện"
                    required
                  />
                  {formErrors.district && (
                    <div className="invalid-feedback">{formErrors.district}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">
                    Phường/Xã <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.ward ? 'is-invalid' : shippingInfo.ward.trim() ? 'is-valid' : ''}`}
                    value={shippingInfo.ward}
                    onChange={(e) => handleShippingInfoChange('ward', e.target.value)}
                    placeholder="Nhập phường/xã"
                    required
                  />
                  {formErrors.ward && (
                    <div className="invalid-feedback">{formErrors.ward}</div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Địa chỉ cụ thể <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.address ? 'is-invalid' : shippingInfo.address.trim() ? 'is-valid' : ''}`}
                  value={shippingInfo.address}
                  onChange={(e) => handleShippingInfoChange('address', e.target.value)}
                  placeholder="Số nhà, tên đường..."
                  required
                />
                {formErrors.address && (
                  <div className="invalid-feedback">{formErrors.address}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Ghi chú (tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={shippingInfo.note || ''}
                  onChange={(e) => handleShippingInfoChange('note', e.target.value)}
                  placeholder="Ghi chú cho người giao hàng..."
                />
              </div>
              {isFormComplete() && (
                <div className="mb-3">
                  <div className="form-check p-3 bg-light rounded" style={{ border: '2px dashed #dee2e6' }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="saveAddress"
                      checked={saveCurrentAddress}
                      onChange={(e) => setSaveCurrentAddress(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-primary" htmlFor="saveAddress">
                      <i className="fas fa-save me-2"></i>
                      Lưu địa chỉ này để sử dụng cho lần mua hàng tiếp theo
                    </label>
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="fas fa-shield-alt me-1"></i>
                        Thông tin sẽ được lưu an toàn và chỉ bạn mới có thể truy cập
                      </small>
                    </div>
                  </div>
                </div>
              )}
              {estimatedDelivery && (
                <div className="alert alert-info border-0" style={{ background: 'linear-gradient(135deg, #e1f5fe 0%, #f8f9fa 100%)' }}>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-truck text-white"></i>
                    </div>
                    <div>
                      <h6 className="mb-1 text-info fw-bold">Thời gian giao hàng dự kiến</h6>
                      <p className="mb-0 text-muted">{estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Card - IMPROVED */}
          <div className="card shadow-sm mb-4">
            <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
              <h5 className="mb-0">
                <i className="fas fa-credit-card me-2"></i>
                Phương thức thanh toán
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* COD Payment */}
                <div className="col-md-6">
                  <div
                    className={`payment-option h-100 ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                    style={{
                      border: paymentMethod === 'COD' ? '3px solid #28a745' : '2px solid #dee2e6',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: paymentMethod === 'COD'
                        ? 'linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%)'
                        : 'white',
                      position: 'relative',
                      minHeight: '160px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    {paymentMethod === 'COD' && (
                      <div
                        className="position-absolute"
                        style={{ top: '12px', right: '12px' }}
                      >
                        <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-check text-white"></i>
                        </div>
                      </div>
                    )}
                    <div className={`rounded-circle d-flex align-items-center justify-content-center mb-3 ${paymentMethod === 'COD' ? 'bg-success' : 'bg-light'
                      }`} style={{ width: '60px', height: '60px' }}>
                      <i className={`fas fa-money-bill-wave fa-2x ${paymentMethod === 'COD' ? 'text-white' : 'text-success'
                        }`}></i>
                    </div>
                    <h6 className={`fw-bold mb-2 ${paymentMethod === 'COD' ? 'text-success' : 'text-dark'}`}>
                      Thanh toán khi nhận hàng
                    </h6>
                    <p className={`small mb-0 ${paymentMethod === 'COD' ? 'text-success' : 'text-muted'}`}>
                      COD - Tiền mặt
                    </p>
                    <div className="mt-2">
                      <span className={`badge ${paymentMethod === 'COD' ? 'bg-success' : 'bg-light text-dark'}`}>
                        Miễn phí
                      </span>
                    </div>
                  </div>
                </div>

                {/* VNPay Payment */}
                <div className="col-md-6">
                  <div
                    className={`payment-option h-100 ${paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    style={{
                      border: paymentMethod === 'BANK_TRANSFER' ? '3px solid #007bff' : '2px solid #dee2e6',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: paymentMethod === 'BANK_TRANSFER'
                        ? 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)'
                        : 'white',
                      position: 'relative',
                      minHeight: '160px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <div
                        className="position-absolute"
                        style={{ top: '12px', right: '12px' }}
                      >
                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-check text-white"></i>
                        </div>
                      </div>
                    )}
                    <div className={`rounded-circle d-flex align-items-center justify-content-center mb-3 ${paymentMethod === 'BANK_TRANSFER' ? 'bg-primary' : 'bg-light'
                      }`} style={{ width: '60px', height: '60px' }}>
                      <i className={`fab fa-cc-visa fa-2x ${paymentMethod === 'BANK_TRANSFER' ? 'text-white' : 'text-primary'
                        }`}></i>
                    </div>
                    <h6 className={`fw-bold mb-2 ${paymentMethod === 'BANK_TRANSFER' ? 'text-primary' : 'text-dark'}`}>
                      Thanh toán VNPay
                    </h6>
                    <p className={`small mb-0 ${paymentMethod === 'BANK_TRANSFER' ? 'text-primary' : 'text-muted'}`}>
                      Chuyển khoản ngay
                    </p>
                    <div className="mt-2">
                      <span className={`badge ${paymentMethod === 'BANK_TRANSFER' ? 'bg-primary' : 'bg-light text-dark'}`}>
                        Giảm phí ship 2%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info COD */}
              <div className="mt-4">
                {paymentMethod === 'COD' && (
                  <div
                    className="alert border-0 mb-0 p-3"
                    style={{
                      background: 'linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%)',
                      border: '2px solid #c3e6cb',
                      maxWidth: 520,
                      margin: '0 auto',
                    }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle bg-success d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 36, height: 36, minWidth: 36 }}
                      >
                        <i className="fas fa-info-circle text-white"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="text-success fw-bold mb-2">Thanh toán khi nhận hàng (COD)</h6>
                        <ul className="list-unstyled mb-0 ps-0 small">
                          <li className="d-flex align-items-center mb-1">
                            <i className="fas fa-check-circle text-primary" style={{ minWidth: 16 }}></i>
                            <span className="ms-2">Thanh toán tiền mặt trực tiếp cho nhân viên giao hàng</span>
                          </li>
                          <li className="d-flex align-items-center mb-1">
                            <i className="fas fa-check-circle text-primary" style={{ minWidth: 16 }}></i>
                            <span className="ms-2">Đơn hàng sẽ được xác nhận và giao nhanh nhất</span>
                          </li>
                          <li className="d-flex align-items-center mb-1">
                            <i className="fas fa-check-circle text-primary" style={{ minWidth: 16 }}></i>
                            <span className="ms-2">Không cần thẻ ngân hàng hay tài khoản online</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method Info */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <div
                    className="alert border-0 mb-0 p-3"
                    style={{
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)',
                      border: '2px solid #b8e0fb',
                      maxWidth: 520,
                      margin: '0 auto',
                    }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 36, height: 36, minWidth: 36 }}
                      >
                        <i className="fas fa-info-circle text-white"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="text-primary fw-bold mb-2">Thanh toán qua VNPay</h6>
                        <ul className="list-unstyled mb-0 ps-0 small">
                          <li className="d-flex align-items-center mb-1">
                            <i className="fas fa-check-circle text-success" style={{ minWidth: 16 }}></i>
                            <span className="ms-2">Thanh toán trực tuyến an toàn, hỗ trợ đa dạng ngân hàng nội địa</span>
                          </li>
                          <li className="d-flex align-items-center mb-1">
                            <i className="fas fa-check-circle text-success" style={{ minWidth: 16 }}></i>
                            <span className="ms-2">Được giảm <span className="fw-bold text-primary">2% phí vận chuyển</span></span>
                          </li>
                          <li className="d-flex align-items-center mb-1">
                            <i className="fas fa-check-circle text-success" style={{ minWidth: 16 }}></i>
                            <span className="ms-2">Xử lý đơn hàng nhanh hơn, không cần thanh toán khi nhận hàng</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="text-center mt-4 pt-3 border-top">
                <div className="d-flex justify-content-center align-items-center gap-4 text-muted small">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                      <i className="fas fa-shield-alt text-success" style={{ fontSize: '12px' }}></i>
                    </div>
                    <span>Bảo mật SSL</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                      <i className="fas fa-lock text-primary" style={{ fontSize: '12px' }}></i>
                    </div>
                    <span>Mã hóa 256-bit</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                      <i className="fas fa-user-shield text-info" style={{ fontSize: '12px' }}></i>
                    </div>
                    <span>Thông tin bảo mật</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)' }}>
              <h5 className="mb-0 text-dark">
                <i className="fas fa-receipt me-2"></i>
                Đơn hàng của bạn
              </h5>
            </div>
            <div className="card-body">
              {/* Product List - CẬP NHẬT ĐỂ HIỂN THỊ FALLBACK */}
              <div className="mb-3">
                <h6>Sản phẩm đã chọn ({selectedCartItems.length || 'đang tải...'})</h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedCartItems.length > 0 ? (
                    selectedCartItems.map(item => {
                      const comparePrice = item.product.comparePrice ?? 0;
                      const salePrice = item.product.salePrice ?? 0;
                      const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
                      const displayPrice = getItemPrice(item.product);
                      const discountPercent = isOnSale ? Math.round(((comparePrice - salePrice) / comparePrice) * 100) : 0;

                      return (
                        <div key={item.id} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                          <img
                            src={item.product.galleryImage || "/images/default-image.jpg"}
                            alt={item.product.productName}
                            className="rounded me-2"
                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = "/images/default-image.jpg"; }}
                          />
                          <div className="flex-grow-1">
                            <div className="small fw-bold">
                              {item.product.productName.length > 30
                                ? item.product.productName.substring(0, 30) + '...'
                                : item.product.productName
                              }
                            </div>
                            <div className="text-muted small">
                              {isOnSale ? (
                                <>
                                  <span className="text-danger fw-bold">{formatPrice(salePrice)}</span>
                                  <span className="text-decoration-line-through ms-1">{formatPrice(comparePrice)}</span>
                                  {discountPercent > 0 && (
                                    <span className="text-success ms-1">(-{discountPercent}%)</span>
                                  )}
                                  <span> x {item.quantity}</span>
                                </>
                              ) : (
                                <>
                                  {formatPrice(displayPrice)} x {item.quantity}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">
                              {formatPrice(displayPrice * item.quantity)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Fallback: hiển thị từ localStorage nếu selectedCartItems rỗng
                    (() => {
                      const savedDetails = localStorage.getItem('selected_cart_items_details');
                      if (savedDetails) {
                        try {
                          const details = JSON.parse(savedDetails);
                          return details.map((item: any, index: number) => (
                            <div key={index} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                              <div className="rounded me-2 bg-light d-flex align-items-center justify-content-center" 
                                   style={{ width: 40, height: 40 }}>
                                <i className="fas fa-box text-muted"></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="small fw-bold">{item.productName}</div>
                                <div className="text-muted small">
                                  {formatPrice(item.price)} x {item.quantity}
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            </div>
                          ));
                        } catch (e) {
                          return (
                            <div className="text-center text-muted py-3">
                              <i className="fas fa-exclamation-circle me-2"></i>
                              Đang tải thông tin sản phẩm...
                            </div>
                          );
                        }
                      }
                      return (
                        <div className="text-center text-muted py-3">
                          <i className="fas fa-shopping-cart me-2"></i>
                          Đang tải sản phẩm...
                        </div>
                      );
                    })()
                  )}
                </div>
                
                {cartItems.length > selectedCartItems.length && selectedCartItems.length > 0 && (
                  <div className="alert alert-info border-0 mt-2" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)' }}>
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      Còn {cartItems.length - selectedCartItems.length} sản phẩm khác trong giỏ hàng chưa được chọn thanh toán
                    </small>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="mb-3">
                <label className="form-label fw-bold">Mã giảm giá</label>
                {!appliedCoupon ? (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                    >
                      {couponLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        'Áp dụng'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-2 rounded border border-success">
                    <span className="text-success">
                      <i className="fas fa-check-circle me-1"></i>
                      <strong>{appliedCoupon.code}</strong>
                    </span>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveCoupon}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Order Totals */}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>
                  {(() => {
                    const subtotal = calculateSubtotal();
                    const baseShippingFee = subtotal >= 500000 ? 0 : 30000;
                    const actualShippingFee = shippingFee;
                    if (baseShippingFee === 0) {
                      return (
                        <span className="text-success">
                          <i className="fas fa-gift me-1"></i>
                          Miễn phí
                        </span>
                      );
                    }
                    if (paymentMethod === 'BANK_TRANSFER' && baseShippingFee > actualShippingFee) {
                      const discount = baseShippingFee - actualShippingFee;
                      return (
                        <div className="text-end">
                          <span className="text-decoration-line-through text-muted small">
                            {formatPrice(baseShippingFee)}
                          </span>
                          <br />
                          <span className="text-success fw-bold">
                            {formatPrice(actualShippingFee)}
                            <small className="ms-1">(-{formatPrice(discount)})</small>
                          </span>
                        </div>
                      );
                    }
                    return formatPrice(actualShippingFee);
                  })()}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 text-primary">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Checkout Button */}
              <button
                className={`btn w-100 mt-3 py-3 ${isFormComplete() ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={handleSubmitOrder}
                disabled={checkoutLoading || !isFormComplete()}
                style={{
                  transition: 'all 0.3s ease',
                  transform: isFormComplete() ? 'scale(1)' : 'scale(0.98)',
                  opacity: isFormComplete() ? 1 : 0.7,
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                {checkoutLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    {isFormComplete()
                      ? `Đặt hàng (${formatPrice(total)})`
                      : 'Vui lòng điền đầy đủ thông tin'
                    }
                  </>
                )}
              </button>

              {/* Progress Indicator */}
              {!isFormComplete() && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Hoàn thành thông tin:</small>
                    <small className="text-muted">
                      {(() => {
                        const requiredFields = ['fullName', 'phoneNumber', 'address', 'ward', 'district', 'province'];
                        const filledFields = requiredFields.filter(field =>
                          shippingInfo[field as keyof ShippingInfo]?.trim()
                        ).length;
                        return `${filledFields}/${requiredFields.length}`;
                      })()}
                    </small>
                  </div>
                  <div className="progress" style={{ height: '4px', borderRadius: '4px' }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{
                        width: `${(() => {
                          const requiredFields = ['fullName', 'phoneNumber', 'address', 'ward', 'district', 'province'];
                          const filledFields = requiredFields.filter(field =>
                            shippingInfo[field as keyof ShippingInfo]?.trim()
                          ).length;
                          return (filledFields / requiredFields.length) * 100;
                        })()}%`,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Thông tin của bạn được bảo mật an toàn
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal - IMPROVED */}
      {showSuccessModal && orderResult && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className={`modal-header border-0 text-white position-relative ${orderResult.success ? 'bg-success' : 'bg-danger'}`} style={{
                background: orderResult.success
                  ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                  : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                    {orderResult.success ? (
                      <svg width="40" height="40" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="32" fill="#4caf50" />
                        <path d="M18 34 L28 44 L46 26" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="32" fill="#dc3545" />
                        <line x1="22" y1="22" x2="42" y2="42" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                        <line x1="42" y1="22" x2="22" y2="42" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <h5 className="modal-title mb-0 fw-bold">
                    {orderResult.success ? 'Đặt hàng thành công!' : 'Đặt hàng thất bại'}
                  </h5>
                </div>
                {!orderResult.success && (
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowSuccessModal(false)}
                  ></button>
                )}
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 ${orderResult.success ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                    }`} style={{ width: '80px', height: '80px' }}>
                    {orderResult.success ? (
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="32" fill="#4caf50" />
                        <path d="M18 34 L28 44 L46 26" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="32" fill="#dc3545" />
                        <line x1="22" y1="22" x2="42" y2="42" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                        <line x1="42" y1="22" x2="22" y2="42" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <h4 className={`fw-bold ${orderResult.success ? 'text-success' : 'text-danger'}`}>
                    {orderResult.message}
                  </h4>
                  <p className="text-muted mb-0">
                    {orderResult.success
                      ? 'Đơn hàng của bạn đã được tạo thành công và đang được xử lý.'
                      : 'Vui lòng thử lại hoặc liên hệ hỗ trợ.'
                    }
                  </p>
                  {orderResult.success && countdown > 0 && (
                    <div className="alert alert-info border-0 mt-3" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="fas fa-clock text-info me-2"></i>
                        <span className="text-info fw-bold">
                          Tự động chuyển đến trang đơn hàng sau {countdown} giây...
                        </span>
                      </div>
                      <div className="progress mt-2" style={{ height: '8px', borderRadius: '8px' }}>
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{
                            width: `${(countdown / 5) * 100}%`,
                            borderRadius: '8px',
                            transition: 'width 1s linear'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                {orderResult.success && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 h-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <i className="fas fa-receipt text-white" style={{ fontSize: '14px' }}></i>
                            </div>
                            <h6 className="card-title mb-0 fw-bold">Thông tin đơn hàng</h6>
                          </div>
                          <div className="space-y-2">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted small">Mã đơn hàng:</span>
                              <span className="fw-bold small">#{orderResult.orderId?.substring(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted small">Tổng tiền:</span>
                              <span className="text-success fw-bold">{formatPrice(orderResult.finalTotal || 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted small">Thanh toán:</span>
                              <span className="fw-bold small">{paymentMethod === 'COD' ? 'COD' : 'VNPay'}</span>
                            </div>
                            {orderResult.discountAmount && orderResult.discountAmount > 0 && (
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">Giảm giá:</span>
                                <span className="text-success fw-bold small">-{formatPrice(orderResult.discountAmount)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 h-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-info d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <i className="fas fa-shipping-fast text-white" style={{ fontSize: '14px' }}></i>
                            </div>
                            <h6 className="card-title mb-0 fw-bold">Thông tin giao hàng</h6>
                          </div>
                          <div className="space-y-2">
                            <div className="mb-2">
                              <span className="text-muted small d-block">Người nhận:</span>
                              <span className="fw-bold small">{shippingInfo.fullName}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-muted small d-block">Số điện thoại:</span>
                              <span className="fw-bold small">{shippingInfo.phoneNumber}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-muted small d-block">Địa chỉ:</span>
                              <span className="fw-bold small">{shippingInfo.address}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.province}</span>
                            </div>
                            <div>
                              <span className="text-muted small d-block">Dự kiến giao:</span>
                              <span className="text-info fw-bold small">{estimatedDelivery}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {!orderResult.success && (
                  <div className="alert alert-danger border-0" style={{ background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' }}>
                    <div className="d-flex align-items-start">
                      <i className="fas fa-exclamation-triangle text-danger me-2 mt-1"></i>
                      <div>
                        <h6 className="text-danger fw-bold mb-1">Chi tiết lỗi:</h6>
                        <p className="mb-0 text-danger">{orderResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 bg-light d-flex justify-content-center gap-3 p-4">
                <button
                  className="btn btn-outline-primary px-4 py-2"
                  onClick={handleContinueShopping}
                  style={{ borderRadius: '8px', fontWeight: '500' }}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Tiếp tục mua sắm
                </button>
                {orderResult.success && (
                  <button
                    className="btn btn-primary px-4 py-2"
                    onClick={handleViewOrder}
                    style={{ borderRadius: '8px', fontWeight: '500' }}
                  >
                    <i className="fas fa-eye me-2"></i>
                    Xem đơn hàng {countdown > 0 && `(${countdown})`}
                  </button>
                )}
                {!orderResult.success && (
                  <button
                    className="btn btn-danger px-4 py-2"
                    onClick={() => setShowSuccessModal(false)}
                    style={{ borderRadius: '8px', fontWeight: '500' }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(checkoutLoading || addressLoading) && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
        >
          <div className="bg-white p-5 rounded-3 shadow-lg text-center" style={{ minWidth: '300px' }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <h5 className="fw-bold mb-2">{addressLoading ? 'Đang lưu địa chỉ...' : 'Đang xử lý đơn hàng...'}</h5>
            <p className="text-muted mb-0">Vui lòng không tắt trình duyệt</p>
            <div className="mt-3">
              <div className="progress" style={{ height: '4px', borderRadius: '4px' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style={{ width: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
