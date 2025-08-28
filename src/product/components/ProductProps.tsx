import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';
import axios from 'axios';
import ProductModel from '../../models/ProductModel';
import GalleryModel from '../../models/GalleryModel';
import { getAllGalleryImagesByProductId } from '../../api/GalleryAPI';
import cartAPI from "../../api/CartAPI";
import { useCart } from '../../contexts/CartContext';
import { getIdUserByToken, isToken, isAuthenticated } from '../../utils/JwtService';

interface Props {
  product: ProductModel;
}

const ProductProps: React.FC<Props> = ({ product }) => {
  const [gallery, setGallery] = useState<GalleryModel[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  const { refreshCartCount } = useCart();

  useEffect(() => {
    if (product.id) {
      getAllGalleryImagesByProductId(product.id)
        .then(setGallery)
        .catch(console.error);
    }
  }, [product.id]);

  // Check if product is in wishlist when component mounts or product changes
  useEffect(() => {
    checkIfInWishlist();
  }, [product.id]);

  // Listen for wishlist updates from other components
  useEffect(() => {
    const handleWishlistUpdate = (event: any) => {
      const { productId, action } = event.detail;
      if (productId === product.id) {
        setIsInWishlist(action === 'add');
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.id]);

  const thumbnail = gallery.find(g => g.isThumbnail)?.image || gallery[0]?.image;

  const formatCurrency = (value?: number) =>
    value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '';

  // LOGIC GIÁ CHUẨN: Sử dụng buyingPrice, comparePrice, salePrice đúng ý nghĩa
  const buyingPrice = product.buyingPrice ?? 0;      // Giá nhập (không hiển thị cho khách)
  const comparePrice = product.comparePrice ?? 0;    // Giá niêm yết (gạch ngang)
  const salePrice = product.salePrice ?? 0;          // Giá bán thực tế

  // Kiểm tra có đang giảm giá không
  const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
  
  // Tính % giảm giá
  const discountPercent = isOnSale 
    ? Math.round(((comparePrice - salePrice) / comparePrice) * 100)
    : 0;

  // Giá hiển thị chính (ưu tiên salePrice, fallback về comparePrice hoặc buyingPrice)
  const displayPrice = salePrice > 0 ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);

  const handleClick = () => navigate(`/product-detail/${product.id}`);
  
  // Lấy customer ID từ token
  const getCustomerId = (): string | null => {
    try {
      const customerId = getIdUserByToken();
      return customerId || null;
    } catch {
      return null;
    }
  };

  // Kiểm tra sản phẩm có trong wishlist không
  const checkIfInWishlist = async () => {
    if (!isAuthenticated() || !product.id) return;
    
    const customerId = getCustomerId();
    if (!customerId) return;

    try {
      // Thay vì dùng /check endpoint (có thể chưa implement), 
      // ta sẽ lấy toàn bộ wishlist và check locally
      const response = await axios.get(`http://localhost:8080/api/wishlist/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Wishlist check response:', response.data);
      
      if (response.data) {
        let wishlistItems = [];
        
        // Xử lý response dựa trên cấu trúc API
        if (Array.isArray(response.data)) {
          wishlistItems = response.data;
        } else if (response.data.items) {
          wishlistItems = response.data.items;
        } else if (response.data.data) {
          wishlistItems = Array.isArray(response.data.data) ? response.data.data : response.data.data.items || [];
        }
        
        console.log('Processing wishlist items:', wishlistItems);
        console.log('Looking for product ID:', product.id);
        
        // Check xem product có trong wishlist không - so sánh cả string và number
        const isInList = wishlistItems.some((item: any) => {
          const itemProductId = item.productId || item.product?.id;
          // So sánh cả string và number vì có thể có type mismatch
          return itemProductId === product.id || 
                 itemProductId === String(product.id) || 
                 String(itemProductId) === String(product.id);
        });
        
        console.log('Product in wishlist:', isInList);
        setIsInWishlist(isInList);
      }
    } catch (error: any) {
      console.error('Error checking wishlist status:', error);
      
      // Nếu lỗi 404 thì có thể wishlist rỗng
      if (error.response?.status === 404) {
        setIsInWishlist(false);
      }
      // Các lỗi khác thì im lặng, không làm phiền user
    }
  };

  // API call để thêm vào giỏ hàng thực tế (giống Detail component)
  const handleAddToCartAPI = async (customerId: string, productId: string, quantity: number = 1) => {
    try {
      const payload = {
        idCustomer: customerId,
        products: [{ productId, quantity }]
      };

      await axios.post('http://localhost:8080/api/cards/add-product', payload);
      return true;
    } catch (err) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', err);
      throw err;
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    
    // Kiểm tra sản phẩm có còn hàng không
    if ((product.quantity ?? 0) === 0) {
      alert('❌ Sản phẩm đã hết hàng!');
      return;
    }

    // Set animation state
    setIsAddingToCart(true);
    
    try {
      // Lấy customer ID
      const customerId = getCustomerId();
      
      if (!customerId || !isAuthenticated()) {
        // Nếu chưa đăng nhập, thông báo yêu cầu đăng nhập
        alert("🔐 Vui lòng đăng nhập để thêm vào giỏ hàng.");
        return;
      }

      // Gọi API với logic giống Detail component
      await handleAddToCartAPI(customerId, product.id!, 1);
      alert(`✅ Đã thêm "${product.productName}" vào giỏ hàng!`);
      await refreshCartCount();  
      
      // Dispatch event để update cart counter
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { 
          action: 'add',
          product: {
            id: product.id,
            name: product.productName,
            quantity: 1
          }
        } 
      }));

      console.log('Product added to cart via API');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Không thể thêm sản phẩm vào giỏ hàng.');
    } finally {
      // Reset animation state after delay
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 600);
    }
  };
  
  // API call để thêm/xóa wishlist
  const handleWishlistAPI = async (action: 'add' | 'remove') => {
    const customerId = getCustomerId();
    if (!customerId) {
      throw new Error('Customer ID not found');
    }

    console.log('Wishlist API call:', {
      action,
      customerId,
      productId: product.id,
      customerIdType: typeof customerId,
      productIdType: typeof product.id
    });

    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    };

    if (action === 'add') {
      const payload = {
        customerId: customerId,
        productId: String(product.id), // Ensure string
        note: `Added from product list`,
        priority: 3,
        notificationEnabled: true
      };

      console.log('POST payload:', payload);

      const response = await axios.post(`http://localhost:8080/api/wishlist`, payload, config);
      return response.data;
    } else {
      // Encode product ID để tránh lỗi với special characters
      const encodedProductId = encodeURIComponent(String(product.id));
      const response = await axios.delete(`http://localhost:8080/api/wishlist/${customerId}/${encodedProductId}`, config);
      return response.data;
    }
  };
  
  const handleWishlist = async (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    
    // Kiểm tra đăng nhập
    if (!isAuthenticated()) {
      alert("🔐 Vui lòng đăng nhập để sử dụng danh sách yêu thích.");
      return;
    }

    const customerId = getCustomerId();
    if (!customerId) {
      alert("❌ Không thể xác định thông tin khách hàng. Vui lòng đăng nhập lại.");
      return;
    }
    
    // Set animation state
    setIsAddingToWishlist(true);
    
    try {
      if (isInWishlist) {
        // Xóa khỏi wishlist
        await handleWishlistAPI('remove');
        setIsInWishlist(false);
        alert(`💔 Đã xóa "${product.productName}" khỏi danh sách yêu thích!`);
      } else {
        // Thêm vào wishlist - có thể gặp conflict nếu đã có
        try {
          await handleWishlistAPI('add');
          setIsInWishlist(true);
          alert(`❤️ Đã thêm "${product.productName}" vào danh sách yêu thích!`);
        } catch (addError: any) {
          if (addError.response?.status === 409) {
            // Conflict - sản phẩm đã có, cập nhật UI state
            setIsInWishlist(true);
            alert(`❤️ Sản phẩm "${product.productName}" đã có trong danh sách yêu thích!`);
          } else {
            // Lỗi khác thì throw để xử lý ở catch block ngoài
            throw addError;
          }
        }
      }

      // Dispatch event để update wishlist counter nếu có
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { 
          action: isInWishlist ? 'remove' : 'add',
          productId: product.id,
          productName: product.productName
        } 
      }));

      console.log(`Product ${isInWishlist ? 'removed from' : 'added to'} wishlist via API`);
      
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật danh sách yêu thích.';
      
      if (error.response?.status === 409) {
        errorMessage = 'Sản phẩm đã có trong danh sách yêu thích.';
        // Nếu conflict khi thêm, có thể sản phẩm đã có rồi
        if (!isInWishlist) {
          setIsInWishlist(true);
          // Refresh để sync lại
          setTimeout(() => checkIfInWishlist(), 500);
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy sản phẩm trong danh sách yêu thích.';
        // Nếu 404 khi xóa, có thể sản phẩm không có trong wishlist
        if (isInWishlist) {
          setIsInWishlist(false);
          // Refresh để sync lại
          setTimeout(() => checkIfInWishlist(), 500);
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Chỉ hiển thị alert cho các lỗi nghiêm trọng
      if (error.response?.status !== 409) {
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      // Reset animation state after delay
      setTimeout(() => {
        setIsAddingToWishlist(false);
      }, 600);
    }
  };

  return (
    <>
      <style>{`
        .product-card {
          position: relative;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          height: 420px; /* CỐ ĐỊNH CHIỀU CAO */
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          border-color: rgba(0, 123, 255, 0.3);
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 180px; /* CỐ ĐỊNH CHIỀU CAO ẢNH */
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          flex-shrink: 0; /* Không cho phép co lại */
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #fff;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .placeholder-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          color: #6c757d;
          background-color: #f8f9fa;
          height: 100%;
        }

        .badge-discount {
          position: absolute;
          top: 8px;
          left: 8px;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.7rem;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
        }

        .badge-sale {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #28a745, #218838);
          color: white;
          padding: 3px 6px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.65rem;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }

        .card-body-custom {
          padding: 12px;
          display: flex;
          flex-direction: column;
          height: 240px; /* CỐ ĐỊNH CHIỀU CAO BODY */
          flex: 1;
          background: white;
        }

        .card-title {
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 6px;
          color: #212529;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
          height: 34px; /* CỐ ĐỊNH CHIỀU CAO TITLE */
          flex-shrink: 0;
        }

        .card-text {
          color: #6c757d;
          text-align: center;
          font-size: 0.75rem;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
          height: 32px; /* CỐ ĐỊNH CHIỀU CAO MÔ TẢ */
          flex-shrink: 0;
        }

        .stock-status {
          font-size: 0.65rem;
          padding: 3px 6px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 6px;
          font-weight: 600;
          height: 24px; /* CỐ ĐỊNH CHIỀU CAO */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .in-stock {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .out-of-stock {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .price-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin: 8px 0;
          flex-wrap: wrap;
          background: #f8f9fa;
          padding: 6px;
          border-radius: 8px;
          min-height: 60px; /* CỐ ĐỊNH CHIỀU CAO TỐI THIỂU */
          flex-shrink: 0;
        }

        .price-sale {
          font-size: 0.9rem;
          font-weight: 700;
          color: #dc3545;
        }

        .price-compare {
          font-size: 0.8rem;
          color: #6c757d;
          text-decoration: line-through;
        }

        .price-regular {
          font-size: 0.9rem;
          font-weight: 700;
          color: #212529;
        }

        .savings-text {
          font-size: 0.65rem;
          color: #28a745;
          font-weight: 600;
          text-align: center;
          margin-top: 3px;
          background: #d4edda;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .button-container {
          margin-top: auto; /* Đẩy xuống dưới cùng */
          height: 40px; /* CỐ ĐỊNH CHIỀU CAO BUTTON */
          flex-shrink: 0;
        }

        .btn {
          padding: 6px;
          font-size: 0.8rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-weight: 600;
          border: none;
          height: 100%;
        }

        .btn-outline-secondary {
          border: 1px solid #6c757d;
          color: #6c757d;
          background: white;
        }

        .btn-outline-secondary:hover {
          background: #6c757d;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .btn-outline-secondary.in-wishlist {
          border: 1px solid #dc3545;
          color: #dc3545;
          background: #fff5f5;
        }

        .btn-outline-secondary.in-wishlist:hover {
          background: #dc3545;
          color: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .heart-icon {
          transition: all 0.3s ease;
        }

        .heart-icon.filled {
          color: #dc3545;
        }

        .heart-icon.empty {
          color: inherit;
        }

        /* Responsive styles - Giữ tỷ lệ cố định */
        @media (max-width: 576px) {
          .product-card {
            height: 380px; /* Giảm chiều cao trên mobile */
          }
          
          .image-wrapper {
            height: 160px; /* Giảm chiều cao ảnh */
          }
          
          .card-body-custom {
            height: 220px; /* Điều chỉnh body tương ứng */
          }
          
          .card-title {
            font-size: 0.8rem;
            height: 32px;
          }
          
          .card-text {
            height: 28px;
          }
          
          .price-container {
            min-height: 55px;
            flex-direction: column;
            gap: 4px;
          }

          .btn {
            padding: 5px;
            font-size: 0.75rem;
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .product-card {
            height: 400px;
          }
          
          .image-wrapper {
            height: 170px;
          }
          
          .card-body-custom {
            height: 230px;
          }
        }

        @media (min-width: 769px) and (max-width: 992px) {
          .product-card {
            height: 410px;
          }
          
          .image-wrapper {
            height: 175px;
          }
          
          .card-body-custom {
            height: 235px;
          }
        }

        /* Đảm bảo grid luôn đều */
        .product-grid-item {
          display: flex;
          height: 100%;
        }
      `}</style>

      {/* Compact responsive layout */}
      <div className="col-lg-3 col-md-4 col-sm-6 mb-3 product-grid-item">
        <div 
          className="product-card w-100" 
          onClick={handleClick}
        >
          {/* Discount badge */}
          {isOnSale && (
            <div className="badge-discount">
              -{discountPercent}%
            </div>
          )}

          <div className="image-wrapper">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={product.productName || 'Product'}
                className="product-image"
                onError={(e) => { 
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = '/images/no-image.png'; 
                }}
              />
            ) : (
              <div className="placeholder-icon">
                <FaImage size={52} />
              </div>
            )}
          </div>

          <div className="card-body-custom">
            <h6 className="card-title" title={product.productName}>
              {product.productName || 'Tên sản phẩm'}
            </h6>
            
            <p className="card-text">
              {product.shortDescription || 'Chưa có mô tả sản phẩm'}
            </p>

            {/* Stock status */}
            <div className={`stock-status ${(product.quantity ?? 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {(product.quantity ?? 0) > 0 ? (
                <>Còn {product.quantity} cuốn</>
              ) : (
                <>Hết hàng</>
              )}
            </div>

            {/* Price display */}
            <div className="price-container">
              {isOnSale ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div>
                    <span className="price-sale">
                      {formatCurrency(salePrice)}
                    </span>
                    <span className="price-compare ms-2">
                      {formatCurrency(comparePrice)}
                    </span>
                  </div>
                  <div className="savings-text">
                    Tiết kiệm {formatCurrency(comparePrice - salePrice)}
                  </div>
                </div>
              ) : (
                <span className="price-regular">
                  {formatCurrency(displayPrice)}
                </span>
              )}
            </div>

            <div className="button-container">
              <div className="row g-2 h-100">
                <div className="col-6">
                  <button 
                    className={`btn btn-outline-secondary w-100 ${isInWishlist ? 'in-wishlist' : ''}`}
                    onClick={handleWishlist}
                    title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                    disabled={isAddingToWishlist}
                  >
                    <i className={`fas fa-heart heart-icon ${isInWishlist ? 'filled' : 'empty'}`}></i>
                  </button>
                </div>
                <div className="col-6">
                  <button 
                    className={`btn btn-primary w-100 ${isAddingToCart ? 'adding' : ''}`}
                    onClick={handleAddToCart}
                    disabled={(product.quantity ?? 0) === 0 || isAddingToCart}
                    title={(product.quantity ?? 0) === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  >
                    <i className="fas fa-shopping-cart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductProps;