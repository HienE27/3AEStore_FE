import React, { useEffect, useState, useCallback } from 'react';
import ProductModel from '../models/ProductModel';
import ProductProps from './components/ProductProps';
import { getAllProducts } from '../api/ProductAPI';
import { Spinner } from 'react-bootstrap';

const ProductNew: React.FC = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Wrapper component để override Bootstrap grid classes và làm khung cố định
  const CarouselProductWrapper: React.FC<{ product: ProductModel }> = ({ product }) => (
    <div className="carousel-product-wrapper">
      <ProductProps product={product} />
    </div>
  );

  // Responsive itemsPerPage calculation
  const updateItemsPerPage = useCallback(() => {
    const width = window.innerWidth;
    
    if (width < 480) setItemsPerPage(1);
    else if (width < 768) setItemsPerPage(2);
    else if (width < 992) setItemsPerPage(3);
    else if (width < 1200) setItemsPerPage(4);
    else setItemsPerPage(5);
    
    setCurrentIndex(0);
  }, []);

  // Handle window resize
  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, [updateItemsPerPage]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await getAllProducts();
        const sortedProducts = result.products.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setProducts(sortedProducts);
        setCurrentIndex(0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - itemsPerPage));
  }, [itemsPerPage]);

  const handleNext = useCallback(() => {
    const maxIndex = Math.max(0, products.length - itemsPerPage);
    setCurrentIndex(prev => Math.min(maxIndex, prev + itemsPerPage));
  }, [products.length, itemsPerPage]);

  const goToPage = useCallback((pageIndex: number) => {
    setCurrentIndex(pageIndex * itemsPerPage);
  }, [itemsPerPage]);

  // Computed values
  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);
  const maxIndex = Math.max(0, products.length - itemsPerPage);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;
  const showNavigation = products.length > itemsPerPage;

  // Loading state
  if (loading) {
    return (
      <div className="product-new-container">
        <div className="container">
          <div className="carousel-wrapper">
            <div className="loading-state">
              <Spinner animation="border" variant="primary" />
              <h4>Đang tải sản phẩm mới...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-new-container">
        <div className="container">
          <div className="carousel-wrapper">
            <div className="error-state">
              <h4 className="text-danger">Không thể tải sản phẩm mới</h4>
              <p>Lỗi: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .product-new-container {
          margin: 2rem 0;
          width: 100%;
        }
        
        .carousel-wrapper {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .carousel-header {
          text-align: center;
          margin-bottom: 2.5rem;
          position: relative;
        }
        
        .carousel-title {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 50%, #004085 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.8rem;
          position: relative;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        
        .carousel-title::before {
          content: '✨';
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .carousel-title::after {
          content: '✨';
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          animation: sparkle 2s ease-in-out infinite 1s;
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.6;
            transform: translateY(-50%) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateY(-50%) scale(1.2);
          }
        }
        
        .carousel-subtitle {
          color: #6c757d;
          font-size: 1.1rem;
          margin-top: 1rem;
          font-weight: 500;
          font-style: italic;
          position: relative;
        }
        
        .carousel-subtitle::before {
          content: '';
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #007bff, transparent);
        }
        
        .carousel-container {
          position: relative;
          padding: 0 55px;
          overflow: hidden;
        }
        
        .carousel-track {
          display: flex;
          gap: 1rem;
          min-height: 440px; /* Tăng chiều cao để phù hợp với khung cố định */
        }
        
        .product-slide {
          flex: 0 0 auto;
          height: 440px; /* Tăng chiều cao để phù hợp với khung cố định */
        }
        
        /* Responsive widths - Phù hợp với khung cố định */
        @media (min-width: 1200px) { 
          .product-slide { width: calc((100% - 4rem) / 5); } 
          .carousel-track { min-height: 440px; }
        }
        @media (min-width: 992px) and (max-width: 1199px) { 
          .product-slide { width: calc((100% - 3rem) / 4); height: 430px; } 
          .carousel-container { padding: 0 50px; }
          .carousel-track { min-height: 430px; }
        }
        @media (min-width: 768px) and (max-width: 991px) { 
          .product-slide { width: calc((100% - 2rem) / 3); height: 420px; }
          .carousel-container { padding: 0 50px; }
          .carousel-track { min-height: 420px; }
        }
        @media (min-width: 480px) and (max-width: 767px) { 
          .product-slide { width: calc((100% - 1rem) / 2); height: 400px; }
          .carousel-container { padding: 0 45px; }
          .carousel-track { min-height: 400px; }
        }
        @media (max-width: 479px) { 
          .product-slide { width: 100%; height: 380px; }
          .carousel-container { padding: 0 45px; }
          .carousel-track { gap: 0; min-height: 380px; }
        }
        
        /* QUAN TRỌNG: Override toàn bộ Bootstrap grid và khung ProductProps */
        .carousel-product-wrapper {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Override tất cả Bootstrap grid classes */
        .carousel-product-wrapper .col-lg-3,
        .carousel-product-wrapper .col-md-4,
        .carousel-product-wrapper .col-sm-6,
        .carousel-product-wrapper .col-12,
        .carousel-product-wrapper .product-grid-item {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          margin-bottom: 0 !important;
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        /* Override product card styles để phù hợp với carousel */
        .carousel-product-wrapper .product-card {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          border-radius: 12px !important;
          border: 2px solid #e3f2fd !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 2px 12px rgba(0, 123, 255, 0.1) !important;
        }
        
        .carousel-product-wrapper .product-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2) !important;
          border-color: #007bff !important;
        }
        
        /* Đảm bảo image wrapper có kích thước phù hợp */
        .carousel-product-wrapper .image-wrapper {
          border-radius: 12px 12px 0 0 !important;
        }
        
        /* Override các badge về màu đỏ cũ */
        .carousel-product-wrapper .badge-discount {
          background: linear-gradient(135deg, #dc3545, #c82333) !important;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
          color: white !important;
        }
        
        /* Override button colors về màu xanh cũ (Bootstrap blue) */
        .carousel-product-wrapper .btn-primary {
          background: linear-gradient(135deg, #007bff, #0056b3) !important;
          border: none !important;
          color: white !important;
        }
        
        .carousel-product-wrapper .btn-primary:hover {
          background: linear-gradient(135deg, #0056b3, #004085) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4) !important;
          color: white !important;
        }
        
        /* Giữ nguyên btn-outline-secondary */
        .carousel-product-wrapper .btn-outline-secondary {
          border: 1px solid #6c757d !important;
          color: #6c757d !important;
          background: white !important;
        }
        
        .carousel-product-wrapper .btn-outline-secondary:hover {
          background: #6c757d !important;
          color: white !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3) !important;
        }
        
        /* Responsive adjustments cho khung cố định */
        @media (max-width: 576px) {
          .carousel-product-wrapper .product-card {
            height: 100% !important;
          }
          
          .carousel-nav {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          
          .carousel-container {
            padding: 0 50px;
          }
        }
        
        @media (max-width: 480px) {
          .carousel-container {
            padding: 0 55px;
          }
        }
        
        /* Fix z-index cho navigation buttons */
        .carousel-nav {
          z-index: 20 !important;
        }
        
        /* Fix overflow cho product cards */
        .carousel-product-wrapper .product-card {
          overflow: hidden !important;
        }
        
        /* Fix hover effects */
        .carousel-product-wrapper .product-card:hover .product-image {
          transform: scale(1.05) !important;
        }
        
        /* Navigation buttons - màu xanh Bootstrap cũ */
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: #007bff;
          border: 2px solid #007bff;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 18px;
          font-weight: bold;
          z-index: 20;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
          transition: all 0.3s ease;
          outline: none;
          user-select: none;
        }
        
        .carousel-nav:hover:not(:disabled) {
          background: #0056b3;
          border-color: #0056b3;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }
        
        .carousel-nav:active:not(:disabled) {
          transform: translateY(-50%) scale(1.05);
        }
        
        .carousel-nav:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          transform: translateY(-50%);
          opacity: 0.6;
        }
        
        .carousel-prev {
          left: 0;
        }
        
        .carousel-next {
          right: 0;
        }
        
        .carousel-footer {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .view-all-btn {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.7rem 2rem;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .view-all-btn:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
          color: white;
          text-decoration: none;
        }
        
        .view-all-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }
        
        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .loading-state h4,
        .error-state h4,
        .empty-state h4 {
          margin-top: 1rem;
          color: #007bff;
        }
        
        .loading-state .spinner-border {
          width: 3rem;
          height: 3rem;
          color: #007bff;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .carousel-wrapper { padding: 1.2rem 0.8rem; }
          .carousel-title { 
            font-size: 1.8rem; 
          }
          .carousel-title::before,
          .carousel-title::after {
            display: none;
          }
          .carousel-header { margin-bottom: 2rem; }
        }
        
        @media (max-width: 480px) {
          .carousel-wrapper { padding: 1rem 0.5rem; }
          .carousel-title { font-size: 1.6rem; }
          .carousel-header { margin-bottom: 1.8rem; }
          .carousel-footer { margin-top: 1.2rem; }
          .view-all-btn {
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="product-new-container">
        <div className="container">
          <div className="carousel-wrapper">
            {/* Header */}
            <div className="carousel-header">
              <h2 className="carousel-title">Sản Phẩm Mới Nhất</h2>
              <p className="carousel-subtitle">Khám phá những sản phẩm mới nhất và hot nhất</p>
            </div>

            {/* Carousel */}
            <div className="carousel-container">
              {products.length > 0 ? (
                <>
                  {/* Navigation Buttons */}
                  {showNavigation && (
                    <>
                      <button
                        className="carousel-nav carousel-prev"
                        onClick={handlePrev}
                        disabled={!canScrollLeft}
                        aria-label="Sản phẩm trước"
                      >
                        ‹
                      </button>

                      <button
                        className="carousel-nav carousel-next"
                        onClick={handleNext}
                        disabled={!canScrollRight}
                        aria-label="Sản phẩm tiếp theo"
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Products */}
                  <div className="carousel-track">
                    {visibleProducts.map((product, index) => (
                      <div key={product.id || `product-${currentIndex}-${index}`} className="product-slide">
                        <CarouselProductWrapper product={product} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: '#007bff',
                    fontSize: '2rem'
                  }}>
                    <i className="fas fa-box-open"></i>
                  </div>
                  <h4>Chưa có sản phẩm mới</h4>
                  <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>
                    Hệ thống đang cập nhật những sản phẩm mới nhất
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {products.length > 0 && (
              <div className="carousel-footer">
                <button className="view-all-btn">
                  <i className="fas fa-th-large me-2"></i>
                  Xem Tất Cả Sản Phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductNew;