import React, { useEffect, useState } from 'react';
import ProductModel from '../models/ProductModel';
import ProductProps from './components/ProductProps';
import { getAllProducts } from '../api/ProductAPI';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterBy, setFilterBy] = useState<string>('all');
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, sortBy, filterBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllProducts();
      console.log("API Response:", result);
      
      let productData: any[] = [];
      if (result && result.products) {
        productData = result.products;
      } else if (Array.isArray(result)) {
        productData = result;
      } else {
        console.warn("Unexpected API response structure:", result);
        productData = [];
      }
      
      const productList: ProductModel[] = [];
      for (const item of productData) {
        try {
          productList.push(new ProductModel(item));
        } catch (err) {
          console.error("Error creating ProductModel:", err, item);
        }
      }
      
      setProducts(productList);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || 'Có lỗi xảy ra khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      const name = product.productName?.toLowerCase() || '';
      const description = product.shortDescription?.toLowerCase() || '';
      const sku = product.sku?.toLowerCase() || '';
      
      if (!name.includes(keyword) && !description.includes(keyword) && !sku.includes(keyword)) {
        return false;
      }
    }

    if (filterBy === 'sale') {
      const comparePrice = product.comparePrice ?? 0;
      const salePrice = product.salePrice ?? 0;
      return comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    } else if (filterBy === 'in-stock') {
      return (product.quantity ?? 0) > 0;
    } else if (filterBy === 'out-of-stock') {
      return (product.quantity ?? 0) === 0;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aComparePrice = a.comparePrice ?? 0;
    const aSalePrice = a.salePrice ?? 0;
    const aBuyingPrice = a.buyingPrice ?? 0;
    const aDisplayPrice = aSalePrice > 0 ? aSalePrice : (aComparePrice > 0 ? aComparePrice : aBuyingPrice);

    const bComparePrice = b.comparePrice ?? 0;
    const bSalePrice = b.salePrice ?? 0;
    const bBuyingPrice = b.buyingPrice ?? 0;
    const bDisplayPrice = bSalePrice > 0 ? bSalePrice : (bComparePrice > 0 ? bComparePrice : bBuyingPrice);

    switch (sortBy) {
      case 'price-low':
        return aDisplayPrice - bDisplayPrice;
      case 'price-high':
        return bDisplayPrice - aDisplayPrice;
      case 'name':
        return (a.productName || '').localeCompare(b.productName || '');
      case 'newest':
        return new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime();
      case 'discount':
        const aDiscount = aComparePrice > 0 && aSalePrice > 0 && aSalePrice < aComparePrice 
          ? Math.round(((aComparePrice - aSalePrice) / aComparePrice) * 100) : 0;
        const bDiscount = bComparePrice > 0 && bSalePrice > 0 && bSalePrice < bComparePrice 
          ? Math.round(((bComparePrice - bSalePrice) / bComparePrice) * 100) : 0;
        return bDiscount - aDiscount;
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Calculate statistics
  const stats = {
    total: products.length,
    onSale: products.filter(p => {
      const comparePrice = p.comparePrice ?? 0;
      const salePrice = p.salePrice ?? 0;
      return comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    }).length,
    inStock: products.filter(p => (p.quantity ?? 0) > 0).length,
    outOfStock: products.filter(p => (p.quantity ?? 0) === 0).length
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
      }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-4" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h4 className="fw-bold mb-2">
            <i className="fas fa-book-reader me-2"></i>
            Đang tải kho sách...
          </h4>
          <p className="opacity-75">
            <i className="fas fa-clock me-1"></i>
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      color: 'white',
                      fontSize: '2rem'
                    }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                  </div>
                  <h3 className="mb-3 fw-bold">
                    <i className="fas fa-bug me-2 text-danger"></i>
                    Oops! Có lỗi xảy ra
                  </h3>
                  <p className="text-muted mb-4">{error}</p>
                  <button 
                    className="btn btn-primary rounded-pill px-4 py-2"
                    onClick={fetchProducts}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <i className="fas fa-redo me-2"></i>
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .hero-section {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 0 0 24px 24px;
          padding: 2.5rem 0;
          margin-bottom: 2.5rem;
          color: white;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
          position: relative;
          overflow: hidden;
        }
        
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 200%;
          height: 100%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .hero-title {
          font-size: 2.2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 2;
        }
        
        .hero-subtitle {
          opacity: 0.9;
          margin-bottom: 2.5rem;
          font-size: 1.1rem;
          position: relative;
          z-index: 2;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.6s;
        }
        
        .stat-card:hover::before {
          left: 100%;
        }
        
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 40px;
          height: 40px;
          margin: 0 auto 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .controls-wrapper {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .search-box {
          position: relative;
        }
        
        .search-input {
          padding: 1rem 1rem 1rem 3.5rem;
          border-radius: 14px;
          border: 2px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          background: #fafbfc;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
          outline: none;
        }
        
        .search-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1.1rem;
        }
        
        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .clear-search:hover {
          background: #f1f5f9;
          color: #64748b;
        }
        
        .modern-select {
          border-radius: 14px;
          border: 2px solid #f1f5f9;
          background: #fafbfc;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .modern-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
          outline: none;
        }
        
        .products-header {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
        
        .products-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .products-meta {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .pagination-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.25rem;
          margin: 2rem 0;
        }
        
        .page-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          color: #495057;
          font-size: 0.875rem;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .page-btn:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .page-btn.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .page-btn:disabled {
          background: #f8f9fa;
          border-color: #dee2e6;
          color: #6c757d;
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .page-info {
          text-align: center;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          color: #64748b;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .back-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          backdrop-filter: blur(10px);
        }
        
        .back-to-top:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          margin: 2rem 0;
        }
        
        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 2rem;
        }
        
        .section-title {
          color: #64748b;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 1.5rem;
          }
          
          .controls-wrapper {
            padding: 1.5rem;
          }
          
          .products-header {
            padding: 1.5rem;
            text-align: center;
          }
          
          .products-title {
            font-size: 1.15rem;
            justify-content: center;
          }
          
          .pagination-wrapper {
            flex-wrap: wrap;
            gap: 0.125rem;
          }
          
          .page-btn {
            min-width: 32px;
            height: 32px;
            padding: 0.25rem;
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Hero Section - Optimized */}
        <section className="hero-section">
          <div className="container">
            <div className="text-center">
              <h1 className="hero-title">
                <i className="fas fa-book-open me-3"></i>
                Kho Sách Nổi Bật
              </h1>
              <p className="hero-subtitle">
                <i className="fas fa-sparkles me-2"></i>
                Khám phá tri thức qua từng trang sách tuyệt vời
              </p>
              
              <div className="row g-4 justify-content-center">
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Tổng số sách</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.3)' }}>
                      <i className="fas fa-fire" style={{ color: '#f59e0b' }}></i>
                    </div>
                    <div className="stat-number">{stats.onSale}</div>
                    <div className="stat-label">Khuyến mãi</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.3)' }}>
                      <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                    </div>
                    <div className="stat-number">{stats.inStock}</div>
                    <div className="stat-label">Còn hàng</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.3)' }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                    </div>
                    <div className="stat-number">{stats.outOfStock}</div>
                    <div className="stat-label">Hết hàng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          {/* Controls */}
          <div className="controls-wrapper">
            <div className="section-title">
              <i className="fas fa-sliders-h"></i>
              Tùy chọn tìm kiếm và lọc
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="search-box">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="🔍 Tìm kiếm cuốn sách yêu thích..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  {searchKeyword && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchKeyword('')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-sort-amount-down text-muted"></i>
                  <select 
                    className="form-select modern-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">📝 Tên A-Z</option>
                    <option value="price-low">💰 Giá thấp → cao</option>
                    <option value="price-high">💎 Giá cao → thấp</option>
                    <option value="discount">🔥 Giảm giá nhiều</option>
                    <option value="newest">⭐ Mới nhất</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-filter text-muted"></i>
                  <select 
                    className="form-select modern-select"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value="all">🌟 Tất cả ({stats.total})</option>
                    <option value="sale">🏷️ Khuyến mãi ({stats.onSale})</option>
                    <option value="in-stock">✅ Còn hàng ({stats.inStock})</option>
                    <option value="out-of-stock">❌ Hết hàng ({stats.outOfStock})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Header */}
          <div className="products-header d-flex justify-content-between align-items-center">
            <h2 className="mb-0 products-title">
              {searchKeyword ? (
                <>
                  <i className="fas fa-search"></i>
                  🔍 Kết quả: "{searchKeyword}"
                </>
              ) : (
                <>
                  <i className="fas fa-book"></i>
                  📚 Danh mục sách hay
                </>
              )}
            </h2>
            <div className="products-meta">
              <i className="fas fa-info-circle"></i>
              {sortedProducts.length} sản phẩm
              {totalPages > 1 && (
                <>
                  <span className="mx-2">•</span>
                  <i className="fas fa-file-alt"></i>
                  Trang {currentPage}/{totalPages}
                </>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {currentProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="mb-3">
                {products.length === 0 ? (
                  <>
                    <i className="fas fa-book me-2"></i>
                    📚 Chưa có sách nào
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>
                    🔍 Không tìm thấy kết quả
                  </>
                )}
              </h3>
              <p className="text-muted mb-4">
                {products.length === 0 
                  ? 'Hệ thống đang cập nhật thêm nhiều đầu sách mới.' 
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'
                }
              </p>
              {(searchKeyword || filterBy !== 'all') && (
                <button 
                  className="btn btn-primary rounded-pill px-4 py-2"
                  onClick={() => {
                    setSearchKeyword('');
                    setFilterBy('all');
                  }}
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <i className="fas fa-refresh me-2"></i>
                  Xem tất cả
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="row g-4 mb-4">
                {currentProducts.map((product, index) => (
                  <ProductProps key={product.id || `product-${index}`} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <button 
                    className="page-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Trang trước"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button 
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => paginate(pageNum)}
                          title={`Trang ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span key={pageNum} className="px-2 text-muted">
                          <i className="fas fa-ellipsis-h"></i>
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button 
                    className="page-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div className="page-info">
                <i className="fas fa-info-circle"></i>
                <span>
                  Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedProducts.length)} / {sortedProducts.length} sách
                </span>
              </div>
            </>
          )}
        </div>

        {/* Back to Top */}
        {products.length > 0 && (
          <button
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Về đầu trang"
          >
            <i className="fas fa-arrow-up"></i>
          </button>
        )}
      </div>
    </>
  );
};

export default ProductList;