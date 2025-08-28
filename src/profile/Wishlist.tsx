import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package, AlertCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { FaImage } from 'react-icons/fa';
import { getIdUserByToken, getUsernameByToken, isToken } from '../utils/JwtService';
import { config } from '../config/environment';
import { getAllGalleryImagesByProductId } from '../api/GalleryAPI';
import SidebarProfile from './SidebarProfile'; // Import component sidebar chung
import axios from 'axios';

// Interfaces
interface Product {
  id: string;
  productName: string;
  shortDescription?: string;
  buyingPrice?: number;
  comparePrice?: number;
  salePrice?: number;
  quantity?: number;
  category?: string;
  author?: string;
  publisher?: string;
  imageUrl?: string;
  inStock?: boolean;
}

interface GalleryModel {
  id: string;
  image: string;
  isThumbnail: boolean;
}

interface WishlistItem {
  id: string;
  customerId: string;
  productId: string;
  note?: string;
  priority?: number;
  createdAt: string;
  product?: Product;
  gallery?: GalleryModel[];
}

interface FilterOptions {
  search: string;
  category: string;
  showInStockOnly: boolean;
}

const Wishlist: React.FC = () => {
  // State management
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  const [productLoading, setProductLoading] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    showInStockOnly: false
  });
  
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // User info
  const customerId = getIdUserByToken() || '';

  // **TÁI SỬ DỤNG LOGIC TỪ PRODUCTPROPS**: Format currency
  const formatCurrency = (value?: number) =>
    value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '';

  // **TÁI SỬ DỤNG LOGIC TỪ PRODUCTPROPS**: Price calculations
  const getPriceInfo = useCallback((product: Product | undefined) => {
    if (!product) return { displayPrice: 0, isOnSale: false, discountPercent: 0, salePrice: 0, comparePrice: 0 };

    const buyingPrice = product.buyingPrice ?? 0;
    const comparePrice = product.comparePrice ?? 0;
    const salePrice = product.salePrice ?? 0;

    const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    const discountPercent = isOnSale 
      ? Math.round(((comparePrice - salePrice) / comparePrice) * 100)
      : 0;
    const displayPrice = salePrice > 0 ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);

    return { displayPrice, isOnSale, discountPercent, salePrice, comparePrice };
  }, []);

  // **TÁI SỬ DỤNG LOGIC TỪ PRODUCTPROPS**: Get product image
  const getProductImage = useCallback((item: WishlistItem) => {
    const thumbnail = item.gallery?.find(g => g.isThumbnail)?.image || 
                     item.gallery?.[0]?.image || 
                     item.product?.imageUrl;
    return thumbnail || '/images/no-image.png';
  }, []);

  // **TÁI SỬ DỤNG LOGIC TỪ PRODUCTPROPS**: Customer ID helper
  const getCustomerId = (): string | null => {
    try {
      const customerId = getIdUserByToken();
      return customerId || null;
    } catch {
      return null;
    }
  };

  // **TÁI SỬ DỤNG LOGIC TỪ PRODUCTPROPS**: API call để thêm vào giỏ hàng
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

  // Enhanced API call function
  const safeApiCall = useCallback(async (url: string, options: RequestInit = {}): Promise<{ data: any; status: number }> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      let responseData: any = {};
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textResponse = await response.text();
        try {
          responseData = JSON.parse(textResponse);
        } catch {
          responseData = { message: textResponse || 'Empty response' };
        }
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      return { data: responseData, status: response.status };
    } catch (error: any) {
      throw error;
    }
  }, []);

  // Fetch product details
  const fetchProductDetails = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      setProductLoading(prev => new Set(prev).add(productId));
      
      const possibleEndpoints = [
        `${config.API_BASE_URL}/api/products/${productId}`,
        `${config.API_BASE_URL}/api/product/${productId}`,
        `${config.API_BASE_URL}/products/${productId}`
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          const { data } = await safeApiCall(endpoint);
          
          let product: Product | null = null;
          
          if (data && typeof data === 'object') {
            if (data.success !== false) {
              product = data.data || data.product || data;
            }
          }

          if (product && product.id) {
            return {
              ...product,
              inStock: (product.quantity || 0) > 0,
              imageUrl: product.imageUrl || '/images/no-image.png'
            };
          }
        } catch (endpointError) {
          continue;
        }
      }

      return {
        id: productId,
        productName: `Product ${productId}`,
        shortDescription: 'Product description not available',
        salePrice: 0,
        comparePrice: 0,
        quantity: 0,
        inStock: false,
        imageUrl: '/images/no-image.png'
      };

    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    } finally {
      setProductLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [safeApiCall, config.API_BASE_URL]);

  // Fetch gallery images
  const fetchGalleryImages = useCallback(async (productId: string): Promise<GalleryModel[]> => {
    try {
      const gallery = await getAllGalleryImagesByProductId(productId);
      return gallery?.map(item => ({
        id: item.id,
        image: item.image,
        isThumbnail: item.isThumbnail ?? false
      })) || [];
    } catch (error) {
      return [];
    }
  }, []);

  // Load wishlist
  const loadWishlist = useCallback(async (): Promise<void> => {
    if (!customerId) {
      setError('Vui lòng đăng nhập để xem danh sách yêu thích');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${config.API_BASE_URL}/api/wishlist/${customerId}`;
      const { data } = await safeApiCall(apiUrl);
      
      let items: WishlistItem[] = [];
      
      if (data.success) {
        if (Array.isArray(data.data)) {
          items = data.data;
        } else if (data.data?.items) {
          items = data.data.items;
        }
      } else {
        throw new Error(data.message || 'Failed to load wishlist');
      }

      const validItems = items.filter(item => 
        item && item.id && item.productId && item.customerId
      );

      // Fetch product details và gallery
      const itemsWithProducts = await Promise.all(
        validItems.map(async (item) => {
          const [product, gallery] = await Promise.all([
            fetchProductDetails(item.productId),
            fetchGalleryImages(item.productId)
          ]);
          
          return {
            ...item,
            product: product || undefined,
            gallery: gallery || []
          };
        })
      );

      setWishlistItems(itemsWithProducts);
      
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      
      let errorMessage = 'Không thể tải danh sách yêu thích';
      
      if (error.message.includes('404')) {
        errorMessage = 'Danh sách yêu thích trống.';
        setWishlistItems([]);
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      setError(errorMessage);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, safeApiCall, fetchProductDetails, fetchGalleryImages]);

  // Filter logic
  const applyFilters = useCallback(() => {
    let filtered = [...wishlistItems];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.product?.productName?.toLowerCase().includes(searchTerm) ||
        item.product?.shortDescription?.toLowerCase().includes(searchTerm) ||
        item.product?.author?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(item =>
        item.product?.category === filters.category
      );
    }

    if (filters.showInStockOnly) {
      filtered = filtered.filter(item =>
        item.product?.inStock !== false
      );
    }

    setFilteredItems(filtered);
  }, [wishlistItems, filters]);

  useEffect(() => {
    applyFilters();
  }, [wishlistItems, filters, applyFilters]);

  // Action handlers
  const setItemLoading = useCallback((productId: string, loading: boolean) => {
    setActionLoading(prev => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  }, []);

  const removeFromWishlist = useCallback(async (productId: string): Promise<void> => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
      return;
    }

    setItemLoading(productId, true);
    try {
      const { data } = await safeApiCall(`${config.API_BASE_URL}/api/wishlist/${customerId}/${productId}`, {
        method: 'DELETE'
      });

      if (data.success) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { 
            action: 'remove',
            productId: productId
          } 
        }));
        
        alert('✅ Đã xóa sản phẩm khỏi danh sách yêu thích');
      } else {
        throw new Error(data.message || 'Không thể xóa sản phẩm');
      }
      
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      alert(`❌ Không thể xóa sản phẩm: ${error.message}`);
    } finally {
      setItemLoading(productId, false);
    }
  }, [customerId, safeApiCall, setItemLoading]);

  // **TÁI SỬ DỤNG HOÀN TOÀN LOGIC TỪ PRODUCTPROPS**: Add to cart function
  const handleAddToCart = async (e: React.MouseEvent, item: WishlistItem) => { 
    e.stopPropagation(); 
    
    const product = item.product;
    
    if ((product?.quantity ?? 0) === 0) {
      alert('❌ Sản phẩm đã hết hàng!');
      return;
    }

    setItemLoading(item.productId, true);
    
    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        alert("🔐 Vui lòng đăng nhập để thêm vào giỏ hàng.");
        return;
      }

      await handleAddToCartAPI(customerId, item.productId, 1);
      alert(`✅ Đã thêm "${product?.productName || 'sản phẩm'}" vào giỏ hàng!`);
      
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { 
          action: 'add',
          product: {
            id: item.productId,
            name: product?.productName,
            quantity: 1
          }
        } 
      }));

      console.log('Product added to cart via API');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Không thể thêm sản phẩm vào giỏ hàng.');
    } finally {
      setTimeout(() => {
        setItemLoading(item.productId, false);
      }, 600);
    }
  };

  // Get unique categories
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    wishlistItems.forEach(item => {
      if (item.product?.category) {
        categories.add(item.product.category);
      }
    });
    return Array.from(categories).sort();
  }, [wishlistItems]);

  // Load data on mount
  useEffect(() => {
    if (isToken() && customerId) {
      loadWishlist();
    } else {
      setError('Vui lòng đăng nhập để xem danh sách yêu thích');
      setLoading(false);
    }
  }, [isToken, customerId, loadWishlist]);

  // Statistics
  const stats = useMemo(() => {
    const totalValue = filteredItems.reduce((sum, item) => {
      const { displayPrice } = getPriceInfo(item.product);
      return sum + displayPrice;
    }, 0);
    const inStockCount = filteredItems.filter(item => item.product?.inStock !== false).length;
    
    return {
      totalValue,
      inStockCount,
      outOfStockCount: filteredItems.length - inStockCount
    };
  }, [filteredItems, getPriceInfo]);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Đang tải danh sách yêu thích...</h5>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="card shadow-lg border-0" style={{ maxWidth: '500px' }}>
            <div className="card-body p-4">
              <div className="text-danger mb-3">
                <AlertCircle size={48} />
              </div>
              <h4 className="card-title text-danger mb-3">Có lỗi xảy ra</h4>
              <p className="text-muted mb-4">{error}</p>
              
              <div className="d-grid gap-2">
                <button onClick={loadWishlist} className="btn btn-primary" disabled={loading}>
                  <RefreshCw size={16} className="me-2" />
                  Thử lại
                </button>
                
                {!isToken() && (
                  <Link to="/login" className="btn btn-outline-primary">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* **CSS ĐƠN GIẢN VÀ RÕ RÀNG** */}
      <style>{`
        .wishlist-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          border-color: #007bff;
        }

        .wishlist-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px 8px 0 0;
        }

        .wishlist-image-placeholder {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
          color: #6c757d;
        }

        .wishlist-body {
          padding: 15px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .wishlist-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #212529;
          text-decoration: none;
          line-height: 1.3;
          height: 2.6rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .wishlist-title:hover {
          color: #007bff;
          text-decoration: none;
        }

        .wishlist-description {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 10px;
          height: 2.5rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .wishlist-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #dc3545;
          margin-bottom: 10px;
        }

        .wishlist-price-compare {
          font-size: 0.9rem;
          color: #6c757d;
          text-decoration: line-through;
          margin-left: 8px;
        }

        .wishlist-stock {
          font-size: 0.8rem;
          margin-bottom: 10px;
          padding: 4px 8px;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
        }

        .wishlist-stock.in-stock {
          background: #d4edda;
          color: #155724;
        }

        .wishlist-stock.out-of-stock {
          background: #f8d7da;
          color: #721c24;
        }

        .wishlist-actions {
          margin-top: auto;
          display: flex;
          gap: 8px;
        }

        .wishlist-btn {
          flex: 1;
          padding: 10px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .wishlist-btn-cart {
          background: #007bff;
          color: white;
        }

        .wishlist-btn-cart:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }

        .wishlist-btn-remove {
          background: #dc3545;
          color: white;
          flex: 0 0 50px;
        }

        .wishlist-btn-remove:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }

        .wishlist-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .wishlist-loading {
          opacity: 0.7;
          pointer-events: none;
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #dc3545;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          z-index: 10;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .wishlist-actions {
            flex-direction: column;
          }
          
          .wishlist-btn-remove {
            flex: 1;
          }
        }
      `}</style>

      {/* Breadcrumb */}
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

      {/* Main Content */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            {/* Sidebar - Sử dụng component chung */}
            <div className="col-lg-3 col-md-4 mb-4">
              <SidebarProfile />
            </div>

            {/* Main Content */}
            <div className="col-lg-9 col-md-8">
              {/* Header Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 py-4">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <Heart size={28} className="text-danger me-3" />
                        <div>
                          <h4 className="mb-1 fw-bold">Danh sách yêu thích</h4>
                          <small className="text-muted">{filteredItems.length} của {wishlistItems.length} sản phẩm</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
                        <button
                          onClick={loadWishlist}
                          className="btn btn-outline-primary btn-sm"
                          disabled={loading}
                        >
                          <RefreshCw size={16} className="me-2" />
                          Tải lại
                        </button>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <Filter size={16} className="me-2" />
                          {showFilters ? 'Ẩn lọc' : 'Hiện lọc'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              {wishlistItems.length > 0 && (
                <div className="card border-0 shadow-sm mb-4" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <div className="card-body py-3">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="h5 mb-0">{stats.inStockCount}</div>
                        <small>Còn hàng</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Panel */}
              {showFilters && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body" style={{ background: '#f8f9fa', borderRadius: '12px' }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Tìm kiếm</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <Search size={16} />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm sản phẩm..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">Danh mục</label>
                        <select
                          className="form-select"
                          value={filters.category}
                          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="">Tất cả danh mục</option>
                          {availableCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="inStockOnly"
                            checked={filters.showInStockOnly}
                            onChange={(e) => setFilters(prev => ({ 
                              ...prev, 
                              showInStockOnly: e.target.checked 
                            }))}
                          />
                          <label className="form-check-label" htmlFor="inStockOnly">
                            Chỉ hiển thị sản phẩm còn hàng
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist Content */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {/* Empty state */}
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-5">
                      <Heart size={64} className="text-muted mb-3" />
                      <h4 className="text-dark mb-3">
                        {wishlistItems.length === 0 ? 'Danh sách yêu thích trống' : 'Không có sản phẩm phù hợp'}
                      </h4>
                      <p className="text-muted mb-4">
                        {wishlistItems.length === 0 
                          ? 'Khám phá và thêm những sản phẩm bạn yêu thích!'
                          : 'Thử điều chỉnh bộ lọc để xem thêm sản phẩm.'
                        }
                      </p>
                      {wishlistItems.length === 0 ? (
                        <Link to="/" className="btn btn-primary">
                          <ShoppingCart size={16} className="me-2" />
                          Khám phá sản phẩm
                        </Link>
                      ) : (
                        <button
                          onClick={() => setFilters({
                            search: '',
                            category: '',
                            showInStockOnly: false
                          })}
                          className="btn btn-outline-primary"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  ) : (
                    /* **WISHLIST ITEMS - LAYOUT ĐƠN GIẢN VÀ RÕ RÀNG** */
                    <div className="row">
                      {filteredItems.map(item => {
                        const product = item.product;
                        const { displayPrice, isOnSale, discountPercent, salePrice, comparePrice } = getPriceInfo(product);
                        const isProductLoading = productLoading.has(item.productId);
                        const isItemLoading = actionLoading.has(item.productId);
                        const productImage = getProductImage(item);

                        return (
                          <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                            <div className={`wishlist-card ${isProductLoading ? 'wishlist-loading' : ''}`}>
                              {/* Discount badge */}
                              {isOnSale && (
                                <div className="discount-badge">
                                  -{discountPercent}%
                                </div>
                              )}

                              {/* Product Image */}
                              <div style={{ position: 'relative' }}>
                                {productImage && productImage !== '/images/no-image.png' ? (
                                  <img
                                    src={productImage}
                                    alt={product?.productName || 'Product'}
                                    className="wishlist-image"
                                    onError={(e) => { 
                                      e.currentTarget.onerror = null; 
                                      e.currentTarget.src = '/images/no-image.png'; 
                                    }}
                                  />
                                ) : (
                                  <div className="wishlist-image-placeholder">
                                    {isProductLoading ? (
                                      <div className="spinner"></div>
                                    ) : (
                                      <FaImage size={48} />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="wishlist-body">
                                <Link 
                                  to={`/product-detail/${item.productId}`}
                                  className="wishlist-title"
                                  title={product?.productName}
                                >
                                  {product?.productName || `Sản phẩm ${item.productId}`}
                                </Link>
                                
                                <div className="wishlist-description">
                                  {product?.shortDescription || 'Chưa có mô tả sản phẩm'}
                                </div>

                                {/* Author */}
                                {product?.author && (
                                  <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '8px' }}>
                                    <i className="fas fa-user me-1"></i>
                                    {product.author}
                                  </div>
                                )}

                                {/* Price */}
                                <div className="wishlist-price">
                                  {isOnSale ? (
                                    <>
                                      {formatCurrency(salePrice)}
                                      <span className="wishlist-price-compare">
                                        {formatCurrency(comparePrice)}
                                      </span>
                                    </>
                                  ) : (
                                    formatCurrency(displayPrice)
                                  )}
                                </div>

                                {/* Stock Status */}
                                <div className={`wishlist-stock ${(product?.quantity ?? 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                  {(product?.quantity ?? 0) > 0 ? (
                                    `Còn ${product?.quantity} cuốn`
                                  ) : (
                                    'Hết hàng'
                                  )}
                                </div>

                                {/* Note */}
                                {item.note && (
                                  <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: '#6c757d', 
                                    background: '#f8f9fa', 
                                    padding: '6px 8px', 
                                    borderRadius: '4px',
                                    marginBottom: '10px',
                                    borderLeft: '3px solid #007bff'
                                  }}>
                                    <i className="fas fa-sticky-note me-1"></i>
                                    {item.note}
                                  </div>
                                )}

                                {/* Date Added */}
                                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '15px' }}>
                                  <i className="fas fa-calendar me-1"></i>
                                  Thêm vào: {formatDate(item.createdAt)}
                                </div>

                                {/* Action Buttons */}
                                <div className="wishlist-actions">
                                  <button 
                                    className="wishlist-btn wishlist-btn-cart"
                                    onClick={(e) => handleAddToCart(e, item)}
                                    disabled={(product?.quantity ?? 0) === 0 || isItemLoading}
                                    title={(product?.quantity ?? 0) === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                                  >
                                    {isItemLoading ? (
                                      <div className="spinner"></div>
                                    ) : (
                                      <>
                                        <i className="fas fa-shopping-cart"></i>
                                        {(product?.quantity ?? 0) === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                                      </>
                                    )}
                                  </button>
                                  
                                  <button 
                                    className="wishlist-btn wishlist-btn-remove"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromWishlist(item.productId);
                                    }}
                                    disabled={isItemLoading}
                                    title="Xóa khỏi danh sách yêu thích"
                                  >
                                    {isItemLoading ? (
                                      <div className="spinner"></div>
                                    ) : (
                                      <i className="fas fa-trash-alt"></i>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  {filteredItems.length > 0 && (
                    <div className="mt-4 pt-4 border-top">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <h6 className="mb-1">
                            Hiển thị {filteredItems.length} của {wishlistItems.length} sản phẩm
                          </h6>
                          <small className="text-muted">
                            Tổng giá trị ước tính: {formatCurrency(stats.totalValue)}
                          </small>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                          <Link to="/products" className="btn btn-outline-primary">
                            <i className="fas fa-plus me-2"></i>
                            Thêm sản phẩm khác
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Wishlist;