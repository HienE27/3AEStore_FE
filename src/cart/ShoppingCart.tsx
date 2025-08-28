import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getIdUserByToken } from '../utils/JwtService';
import { useCart } from '../contexts/CartContext';
import { config } from '../config/environment';

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

const ShoppingCart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingItems, setValidatingItems] = useState(false);

  const { refreshCartCount } = useCart();
  const customerId = getIdUserByToken() || '';

  const formatPrice = (price: number): string => {
    if (isNaN(price) || price < 0) price = 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Tải dữ liệu giỏ hàng
  const fetchCartItemsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/cardItems/search/findByCard_Customer_Id?customerId=${customerId}`);
      const data = res.data as { _embedded?: { cardItems: { id: string, quantity: number }[] } };
      const items = data._embedded?.cardItems || [];

      const detailedItems = await Promise.all(items.map(async item => {
        try {
          const productRes = await axios.get<Product>(`http://localhost:8080/cardItems/search/findProductByCardItemId?cardItemId=${item.id}`);
          let product = productRes.data;

          try {
            const galleryRes = await axios.get<{ _embedded: { galleries: { image: string, isThumbnail: boolean }[] } }>(
              `http://localhost:8080/gallerys/search/findByProduct`,
              { params: { product: `/api/products/${product.id}` } }
            );
            const galleries = galleryRes.data._embedded?.galleries || [];
            const thumbnailImage = galleries.find(g => g.isThumbnail)?.image || galleries[0]?.image || "images/default-image.jpg";
            product = { ...product, galleryImage: thumbnailImage };
          } catch {
            product = { ...product, galleryImage: "images/default-image.jpg" };
          }
          return {
            id: item.id,
            quantity: item.quantity,
            product,
          } as CartItem;
        } catch (err) {
          return null;
        }
      }));
      
      const validItems = detailedItems.filter(Boolean) as CartItem[];
      setCartItems(validItems);

      // *** SỬA LOGIC QUAN TRỌNG: Khôi phục hoặc thiết lập selected items ***
      const savedSelectedItems = localStorage.getItem('cart_selected_items');
      if (savedSelectedItems) {
        try {
          const parsed = JSON.parse(savedSelectedItems);
          const validSelectedItems = parsed.filter((id: string) => 
            validItems.some(item => item.id === id)
          );
          setSelectedItems(validSelectedItems);
        } catch {
          // Nếu parse lỗi, mặc định chọn tất cả
          setSelectedItems(validItems.map(item => item.id));
        }
      } else {
        // *** THAY ĐỔI: Mặc định chọn tất cả sản phẩm ***
        setSelectedItems(validItems.map(item => item.id));
      }
    } catch (err) {
      setCartItems([]);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Lưu selected items vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (selectedItems.length >= 0) { // Chấp nhận cả mảng rỗng
      localStorage.setItem('cart_selected_items', JSON.stringify(selectedItems));
    }
  }, [selectedItems]);

  useEffect(() => {
    if (!customerId) {
      navigate('/login');
      return;
    }
    fetchCartItemsData();
  }, [customerId, navigate, fetchCartItemsData]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    if (newQuantity <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    if (newQuantity > item.product.quantity) {
      alert(`Số lượng tối đa trong kho là ${item.product.quantity}`);
      return;
    }

    // Cập nhật UI ngay lập tức
    const updatedItems = cartItems.map(cartItem =>
      cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
    );
    setCartItems(updatedItems);

    try {
      await axios.put(`http://localhost:8080/api/cards/update-quantity/${customerId}/${item.product.id}?quantity=${newQuantity}`);
      await refreshCartCount();
    } catch (err) {
      // Revert on error
      fetchCartItemsData();
      alert('Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    try {
      await axios.delete(`http://localhost:8080/cardItems/${itemId}?customerId=${customerId}`);
      
      // Cập nhật state
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      
      await refreshCartCount();
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Xử lý tick chọn/bỏ chọn từng sản phẩm
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId];
      return newSelected;
    });
  };

  // Tick chọn tất cả
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]); // bỏ chọn tất
    } else {
      setSelectedItems(cartItems.map(item => item.id)); // chọn tất cả
    }
  };

  const getItemPrice = (product: Product): number => {
    const buyingPrice = product.buyingPrice ?? 0;
    const comparePrice = product.comparePrice ?? 0;
    const salePrice = product.salePrice ?? 0;
    const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    return isOnSale ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);
  };

  // Tính toán theo selectedItems
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));

  const calculateSubtotal = () => {
    return selectedCartItems.reduce((total, item) => {
      const itemPrice = getItemPrice(item.product);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // Validate selected items trước khi checkout
  const validateSelectedItems = async (): Promise<boolean> => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm để thanh toán!');
      return false;
    }

    setValidatingItems(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/cards/validate-selected/${customerId}`,
        selectedItems,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!response.data.success) {
        alert(response.data.message);
        await fetchCartItemsData();
        return false;
      }

      return true;
    } catch (error: any) {
      alert('Lỗi kiểm tra sản phẩm: ' + (error.response?.data?.message || error.message));
      await fetchCartItemsData();
      return false;
    } finally {
      setValidatingItems(false);
    }
  };

  // Sửa lại hoàn toàn hàm handleCheckout
  const handleCheckout = async () => {
    // Kiểm tra phải có ít nhất 1 item được chọn
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }

    // Validate selected items trước khi chuyển trang
    if (!(await validateSelectedItems())) {
      return;
    }

    // Lưu danh sách ID các sản phẩm đã chọn vào localStorage
    localStorage.setItem('selected_cart_items', JSON.stringify(selectedItems));
    localStorage.setItem('cart_selected_items', JSON.stringify(selectedItems));

    // Lưu thêm thông tin chi tiết của các sản phẩm đã chọn
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  
    // Tạo thông tin chi tiết để lưu vào localStorage
    const selectedItemsDetails = selectedCartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: getItemPrice(item.product)
    }));
  
    localStorage.setItem('selected_cart_items_details', JSON.stringify(selectedItemsDetails));

    console.log('=== DEBUG THANH TOÁN ===');
    console.log('Sản phẩm đã chọn:', selectedItems);
    console.log('Chi tiết sản phẩm đã chọn:', selectedCartItems);
    console.log('Đã lưu vào localStorage:', localStorage.getItem('selected_cart_items'));
  
    // Nếu chỉ có 1 sản phẩm, đảm bảo nó được chọn tự động ở trang checkout
    if (cartItems.length === 1) {
      console.log('Thanh toán một sản phẩm - đảm bảo tự động chọn');
    }
  
    navigate('/checkout');
  };

  // Cập nhật hàm handleRemoveSelected để sync với selected items
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm để xóa!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${config.API_BASE_URL}/api/cards/clear-selected/${customerId}`,
        {
          data: selectedItems,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        // Cập nhật state
        setCartItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        await refreshCartCount();
        
        // Xóa khỏi localStorage
        localStorage.removeItem('cart_selected_items');
        localStorage.removeItem('selected_cart_items');
        localStorage.removeItem('selected_cart_items_details');
        
        alert('Đã xóa các sản phẩm đã chọn thành công!');
      } else {
        alert('Có lỗi xảy ra: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Error removing selected items:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải giỏ hàng...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4>Giỏ hàng của bạn ({cartItems.length} sản phẩm)</h4>
                {selectedItems.length > 0 && (
                  <div className="d-flex gap-2">
                    <span className="badge bg-primary">
                      {selectedItems.length} đã chọn
                    </span>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleRemoveSelected}
                      title="Xóa các sản phẩm đã chọn"
                    >
                      <i className="fas fa-trash me-1"></i>
                      Xóa đã chọn
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="card-body text-center py-5">
                <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h5>Giỏ hàng trống</h5>
                <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                            onChange={handleSelectAll}
                            title="Chọn tất cả"
                          />
                        </th>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => {
                        const buyingPrice = item.product.buyingPrice ?? 0;
                        const comparePrice = item.product.comparePrice ?? 0;
                        const salePrice = item.product.salePrice ?? 0;
                        const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
                        const displayPrice = isOnSale ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);
                        const discountPercent = isOnSale ? Math.round(((comparePrice - salePrice) / comparePrice) * 100) : 0;
                        const isSelected = selectedItems.includes(item.id);

                        return (
                          <tr key={item.id} className={isSelected ? 'table-light' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectItem(item.id)}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item.product.galleryImage || "/images/default-image.jpg"}
                                  alt={item.product.productName}
                                  className="me-3"
                                  style={{ width: 60, height: 60, objectFit: 'cover' }}
                                  onError={(e) => (e.currentTarget.src = "/images/default-image.jpg")}
                                />
                                <div>
                                  <h6>{item.product.productName}</h6>
                                  <small className="text-muted">Còn lại: {item.product.quantity}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              {isOnSale ? (
                                <>
                                  <span className="text-danger fw-bold">{formatPrice(salePrice)}</span>
                                  <span className="text-muted text-decoration-line-through ms-2">{formatPrice(comparePrice)}</span>
                                  {discountPercent > 0 && (
                                    <small className="text-success ms-2">(-{discountPercent}%)</small>
                                  )}
                                </>
                              ) : (
                                <span className="fw-bold">{formatPrice(displayPrice)}</span>
                              )}
                            </td>
                            <td>
                              <div className="input-group" style={{ width: '120px' }}>
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  min={1}
                                  max={item.product.quantity}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQty = parseInt(e.target.value) || 1;
                                    handleQuantityChange(item.id, newQty);
                                  }}
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleQuantityChange(item.id, Math.min(item.product.quantity, item.quantity + 1))}
                                  disabled={item.quantity >= item.product.quantity}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>{formatPrice(displayPrice * item.quantity)}</td>
                            <td>
                              <button 
                                className="btn btn-outline-danger btn-sm" 
                                onClick={() => handleRemoveItem(item.id)}
                                title="Xóa sản phẩm này"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="card-footer">
                  <div className="d-flex justify-content-between align-items-center">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/products')}
                    >
                      Tiếp tục mua sắm
                    </button>
                    <div className="d-flex gap-2">
                      {selectedItems.length > 0 && selectedItems.length < cartItems.length && (
                        <button 
                          className="btn btn-outline-danger"
                          onClick={handleRemoveSelected}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Xóa đã chọn ({selectedItems.length})
                        </button>
                      )}
                      <button 
                        className="btn btn-primary"
                        onClick={handleCheckout}
                        disabled={selectedItems.length === 0 || validatingItems}
                      >
                        {validatingItems ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang kiểm tra...
                          </>
                        ) : (
                          <>
                            Thanh toán {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5>Tóm tắt đơn hàng</h5>
              {selectedItems.length > 0 && (
                <small className="text-muted">
                  {selectedItems.length}/{cartItems.length} sản phẩm đã chọn
                </small>
              )}
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-success">Miễn phí</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
              
              {selectedItems.length === 0 && (
                <div className="alert alert-warning mt-3 mb-0">
                  <small>
                    <i className="fas fa-info-circle me-1"></i>
                    Vui lòng chọn sản phẩm để thanh toán
                  </small>
                </div>
              )}
              
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || validatingItems}
              >
                {validatingItems ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang kiểm tra...
                  </>
                ) : (
                  `Thanh toán (${formatPrice(total)})`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
