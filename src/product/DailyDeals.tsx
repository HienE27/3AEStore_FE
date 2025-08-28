import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  productName: string;
  salePrice: number;
  comparePrice?: number;
  buyingPrice: number;
}

interface Gallery {
  id: string;
  image: string;
  isThumbnail: boolean;
}

type ProductWithImage = Product & { imageUrl: string };

const DailyDeals: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  useEffect(() => {
    const fetchProductsAndImages = async () => {
      try {
        const productResponse = await axios.get<{ _embedded: { products: Product[] } }>(
          "http://localhost:8080/products/search/salePriceGreaterThanZero?page=0&size=12"
        );

        const products = productResponse.data._embedded?.products ?? [];

        const galleryPromises = products.map((product) =>
          axios
            .get<{ _embedded: { galleries: Gallery[] } }>(
              `http://localhost:8080/gallerys/search/findByProduct`,
              { params: { product: `/api/products/${product.id}` } }
            )
            .then((res) => {
              const galleries = res.data._embedded?.galleries || [];
              const image =
                galleries.find((g) => g.isThumbnail)?.image ||
                galleries[0]?.image ||
                "images/items/default.jpg";
              return { productId: product.id, image };
            })
            .catch(() => ({ productId: product.id, image: "images/items/default.jpg" }))
        );

        const galleryResults = await Promise.all(galleryPromises);

        const productsWithImages: ProductWithImage[] = products.map((product) => {
          const matched = galleryResults.find((g) => g.productId === product.id);
          return {
            ...product,
            imageUrl: matched?.image || "images/items/default.jpg",
          };
        });

        setProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching daily deals:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndImages();
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - itemsPerPage));
  }, [itemsPerPage]);

  const handleNext = useCallback(() => {
    const maxIndex = Math.max(0, products.length - itemsPerPage);
    setCurrentIndex(prev => Math.min(maxIndex, prev + itemsPerPage));
  }, [products.length, itemsPerPage]);

  // Computed values
  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);
  const showNavigation = products.length > itemsPerPage;
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - itemsPerPage;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  // Logic giá chuẩn: giống ProductProps
  const getProductPricing = (product: ProductWithImage) => {
    const buyingPrice = product.buyingPrice ?? 0;      // Giá nhập (không hiển thị)
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

    // Số tiền tiết kiệm
    const saveAmount = isOnSale ? comparePrice - salePrice : 0;

    return {
      isOnSale,
      discountPercent,
      displayPrice,
      comparePrice,
      salePrice,
      saveAmount
    };
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="deals-wrapper">
          <div className="text-center py-5">
            <div className="loading-spinner"></div>
            <h4 className="mt-3">Đang tải sản phẩm giảm giá...</h4>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container my-5">
        <div className="deals-wrapper">
          <div className="text-center py-5">
            <h4>Không tìm thấy sản phẩm giảm giá nào</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .daily-deals-container {
          margin: 2rem 0;
          width: 100%;
        }
        
        .deals-wrapper {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .deals-header {
          text-align: center;
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .deals-title {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 50%, #bd2130 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.8rem;
          position: relative;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        
        .deals-title::before {
          content: '🔥';
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.4rem;
          animation: fire 1.5s ease-in-out infinite;
        }
        
        .deals-title::after {
          content: '🔥';
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.4rem;
          animation: fire 1.5s ease-in-out infinite 0.5s;
        }
        
        @keyframes fire {
          0%, 100% { 
            opacity: 0.7;
            transform: translateY(-50%) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateY(-50%) scale(1.1);
          }
        }
        
        .deals-subtitle {
          color: #dc3545;
          font-size: 1rem;
          margin-top: 0.5rem;
          font-weight: 600;
          font-style: italic;
        }
        
        .deals-carousel-container {
          position: relative;
          padding: 0 55px;
          overflow: hidden;
        }
        
        .deals-track {
          display: flex;
          gap: 1rem;
          min-height: 400px;
        }
        
        .deals-slide {
          flex: 0 0 auto;
          height: 400px;
        }
        
        /* Responsive widths */
        @media (min-width: 1200px) { .deals-slide { width: calc((100% - 4rem) / 5); } }
        @media (min-width: 992px) and (max-width: 1199px) { .deals-slide { width: calc((100% - 3rem) / 4); } }
        @media (min-width: 768px) and (max-width: 991px) { 
          .deals-slide { width: calc((100% - 2rem) / 3); }
          .deals-carousel-container { padding: 0 50px; }
        }
        @media (min-width: 480px) and (max-width: 767px) { 
          .deals-slide { width: calc((100% - 1rem) / 2); height: 380px; }
          .deals-carousel-container { padding: 0 45px; }
          .deals-track { min-height: 380px; }
        }
        @media (max-width: 479px) { 
          .deals-slide { width: 100%; height: 360px; }
          .deals-carousel-container { padding: 0 45px; }
          .deals-track { gap: 0; min-height: 360px; }
        }
        
        .deal-card {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          border: 2px solid #dc3545;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .deal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(220, 53, 69, 0.2);
        }
        
        .deal-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.8rem;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
        }
        
        .deal-image-container {
          position: relative;
          height: 160px;
          overflow: hidden;
          display: block;
          text-decoration: none;
        }
        
        .deal-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.3s ease;
        }
        
        .deal-card:hover .deal-image {
          transform: scale(1.05);
        }
        
        .deal-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(220, 53, 69, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .deal-card:hover .deal-hover-overlay {
          opacity: 1;
        }
        
        .deal-view-text {
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .deal-info {
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: space-between;
        }
        
        .deal-title {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          height: 2.4rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          color: #333;
          text-decoration: none;
        }
        
        .deal-title:hover {
          color: #dc3545;
          text-decoration: none;
        }
        
        .deal-prices {
          margin: 0.5rem 0;
          text-align: center;
        }
        
        .deal-current-price {
          font-size: 0.9rem;
          font-weight: 700;
          color: #dc3545;
          display: block;
          margin-bottom: 0.2rem;
        }
        
        .deal-original-price {
          font-size: 0.75rem;
          color: #6c757d;
          text-decoration: line-through;
          margin-left: 0.5rem;
          display: inline;
        }
        
        .deal-save-amount {
          font-size: 0.7rem;
          color: #28a745;
          font-weight: 600;
          margin-top: 0.2rem;
          display: block;
        }
        
        .deal-progress {
          margin-top: auto;
          padding-top: 0.5rem;
        }
        
        .deal-progress-bar {
          width: 100%;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.3rem;
        }
        
        .deal-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #dc3545, #c82333);
          border-radius: 3px;
        }
        
        .deal-sold-count {
          font-size: 0.7rem;
          color: #6c757d;
          text-align: center;
          display: block;
          font-weight: 500;
        }
        
        /* Navigation buttons - giống ProductNew */
        .deals-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: #dc3545;
          border: 2px solid #dc3545;
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
          z-index: 10;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
          transition: all 0.3s ease;
        }
        
        .deals-nav:hover:not(:disabled) {
          background: #c82333;
          border-color: #c82333;
          transform: translateY(-50%) scale(1.1);
        }
        
        .deals-nav:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          transform: translateY(-50%);
        }
        
        .deals-prev {
          left: 0;
        }
        
        .deals-next {
          right: 0;
        }
        
        .deals-footer {
          margin-top: 1.2rem;
          text-align: center;
        }
        
        .deals-notice {
          color: #dc3545;
          font-size: 0.8rem;
          font-weight: 500;
          margin: 0 0 0.8rem 0;
        }
        
        .deals-view-all-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.6rem 1.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .deals-view-all-btn:hover {
          background: #c82333;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #dc3545;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .deals-wrapper { padding: 1rem; }
          .deals-title { font-size: 1.8rem; }
          .deals-title::before,
          .deals-title::after { display: none; }
        }
        
        @media (max-width: 480px) {
          .deals-wrapper { padding: 0.8rem; }
          .deals-title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="daily-deals-container">
        <div className="container">
          <div className="deals-wrapper">
            {/* Header */}
            <div className="deals-header">
              <h2 className="deals-title">Sản Phẩm Giảm Giá</h2>
              <p className="deals-subtitle">Ưu đãi đặc biệt - Số lượng có hạn!</p>
            </div>

            {/* Carousel */}
            <div className="deals-carousel-container">
              {/* Navigation Buttons */}
              {showNavigation && (
                <>
                  <button
                    className="deals-nav deals-prev"
                    onClick={handlePrev}
                    disabled={!canScrollLeft}
                    aria-label="Sản phẩm trước"
                  >
                    ‹
                  </button>

                  <button
                    className="deals-nav deals-next"
                    onClick={handleNext}
                    disabled={!canScrollRight}
                    aria-label="Sản phẩm tiếp theo"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Products */}
              <div className="deals-track">
                {visibleProducts.map((item, index) => {
                  const pricing = getProductPricing(item);
                  
                  return (
                    <div key={`${item.id}-${index}`} className="deals-slide">
                      <div className="deal-card">
                        {pricing.isOnSale && (
                          <div className="deal-badge">
                            -{pricing.discountPercent}%
                          </div>
                        )}
                        
                        <Link to={`/product-detail/${item.id}`} className="deal-image-container">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="deal-image"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "images/items/default.jpg";
                            }}
                          />
                          <div className="deal-hover-overlay">
                            <span className="deal-view-text">Xem chi tiết</span>
                          </div>
                        </Link>
                        
                        <div className="deal-info">
                          <Link to={`/product-detail/${item.id}`} className="deal-title">
                            {item.productName}
                          </Link>
                          
                          <div className="deal-prices">
                            {pricing.isOnSale ? (
                              <div>
                                <span className="deal-current-price">
                                  {formatPrice(pricing.salePrice)}
                                </span>
                                <span className="deal-original-price">
                                  {formatPrice(pricing.comparePrice)}
                                </span>
                                <div className="deal-save-amount">
                                  Tiết kiệm {formatPrice(pricing.saveAmount)}
                                </div>
                              </div>
                            ) : (
                              <span className="deal-current-price">
                                {formatPrice(pricing.displayPrice)}
                              </span>
                            )}
                          </div>

                          <div className="deal-progress">
                            <div className="deal-progress-bar">
                              <div 
                                className="deal-progress-fill" 
                                style={{ width: `${Math.floor(Math.random() * 40 + 30)}%` }}
                              ></div>
                            </div>
                            <span className="deal-sold-count">
                              Đã bán {Math.floor(Math.random() * 100 + 10)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="deals-footer">
              <p className="deals-notice">
                ⚡ Giá và ưu đãi có thể thay đổi bất cứ lúc nào
              </p>
              
              <button className="deals-view-all-btn">Xem Thêm</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyDeals;