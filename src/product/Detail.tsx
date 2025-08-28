import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllProducts } from '../api/ProductAPI';
import { getAllGalleryImagesByProductId } from '../api/GalleryAPI';
import { fetchProductsByCategoryId } from '../api/CategoryAPI';
import GalleryModel from '../models/GalleryModel';
// import { handleAddToCart } from '../cart/components/useAddToCart';
import { useAddToCart } from '../cart/components/useAddToCart';
import '../styles/Detail.css'; // Import your custom styles

const Detail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [gallery, setGallery] = useState<GalleryModel[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const customerId = localStorage.getItem('customerId');

  const handleAddToCart = useAddToCart(); // ở component Detail

  //const addToCart = useAddToCart();


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getAllProducts()
      .then((products) => {
        const found = (products.products || []).find((p: any) => p.id === id);
        if (found) {
          setProduct(found);
          getAllGalleryImagesByProductId(found.id ?? '')
            .then((images) => {
              setGallery(images);
              if (images.length > 0) setSelectedImage(images[0].image);
            })
            .catch(console.error);

          // Load related products
          loadRelatedProducts(found);
        } else {
          setProduct(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const loadRelatedProducts = async (currentProduct: any) => {
    setRelatedLoading(true);
    try {
      // Thử lấy sản phẩm cùng category
      let categoryId = null;
      if (currentProduct.category) {
        if (typeof currentProduct.category === 'string') {
          categoryId = currentProduct.category;
        } else if (currentProduct.category.id) {
          categoryId = currentProduct.category.id;
        }
      } else if (currentProduct.categoryId) {
        categoryId = currentProduct.categoryId;
      }

      let related = [];
      
      if (categoryId) {
        try {
          const categoryProducts = await fetchProductsByCategoryId(categoryId);
          let products = categoryProducts;
          if (categoryProducts && categoryProducts.products) {
            products = categoryProducts.products;
          } else if (categoryProducts && categoryProducts._embedded && categoryProducts._embedded.products) {
            products = categoryProducts._embedded.products;
          }
          
          related = (products || []).filter((p: any) => p.id !== currentProduct.id).slice(0, 8);
        } catch (error) {
          console.error('Error loading category products:', error);
        }
      }

      // Nếu không có sản phẩm cùng category, lấy random
      if (related.length === 0) {
        const allProductsResponse = await getAllProducts();
        const allProducts = allProductsResponse?.products || allProductsResponse || [];
        const otherProducts = allProducts.filter((p: any) => p.id !== currentProduct.id);
        const shuffled = otherProducts.sort(() => 0.5 - Math.random());
        related = shuffled.slice(0, 8);
      }

      // Load thumbnails cho từng sản phẩm
      const relatedWithImages = await Promise.all(
        related.map(async (prod: any) => {
          try {
            const images = await getAllGalleryImagesByProductId(prod.id ?? '');
            const thumbnail = images.find(img => img.isThumbnail)?.image || 
                            images[0]?.image || 
                            '/images/no-image.png';
            return { ...prod, thumbnail };
          } catch {
            return { ...prod, thumbnail: '/images/no-image.png' };
          }
        })
      );

      setRelatedProducts(relatedWithImages);
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Đang tải sản phẩm...</p>;
  if (!product) return <p className="text-center mt-5 text-danger">Không tìm thấy sản phẩm.</p>;

  // LOGIC GIÁ CHUẨN
  const buyingPrice = product.buyingPrice ?? 0;      // Giá nhập (không hiển thị)
  const comparePrice = product.comparePrice ?? 0;    // Giá niêm yết (gạch ngang)
  const salePrice = product.salePrice ?? 0;          // Giá bán thực tế

  // Kiểm tra có đang giảm giá không
  const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
  
  // Tính % giảm giá
  const discountPercent = isOnSale 
    ? Math.round(((comparePrice - salePrice) / comparePrice) * 100)
    : 0;

  // Giá hiển thị chính
  const displayPrice = salePrice > 0 ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);

  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <>
      <section className="py-3 bg-light">
        <div className="container">
          <ol className="breadcrumb bg-white rounded shadow-sm px-3 py-2 mb-4">
            <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
            <li className="breadcrumb-item active">Chi tiết sản phẩm</li>
          </ol>
        </div>
      </section>

      <section className="section-content bg-white py-4">
        <div className="container">
          <div className="row g-4">
            <aside className="col-md-6">
              <div className="position-relative">
                {/* Badge giảm giá */}
                {isOnSale && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      background: 'linear-gradient(135deg, #dc3545, #c82333)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '25px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      zIndex: 20,
                      boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    -{discountPercent}%
                  </span>
                )}

                {/* Badge SALE - removed */}

                <div className="card shadow border-0">
                  <article className="gallery-wrap p-3">
                    <div className="img-big-wrap text-center mb-3">
                      <img
                        src={selectedImage || 'https://via.placeholder.com/500x500?text=No+Image'}
                        alt={product.productName}
                        className="img-fluid rounded"
                        style={{ maxHeight: '420px', objectFit: 'contain', background: '#f8f9fa' }}
                      />
                    </div>
                    <div className="thumbs-wrap d-flex justify-content-center gap-2 flex-wrap">
                      {gallery.map((img, index) => (
                        <img
                          key={index}
                          src={img.image}
                          alt={`thumb-${index}`}
                          onClick={() => setSelectedImage(img.image)}
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'cover',
                            border: selectedImage === img.image ? '2px solid #007bff' : '1px solid #ccc',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            padding: '2px',
                            background: selectedImage === img.image ? '#e3f2fd' : '#fff'
                          }}
                        />
                      ))}
                    </div>
                  </article>
                </div>
                
                <div className="mt-4">
                  <h6 className="mb-3 fw-bold" style={{ color: "#495057" }}>
                    <i className="fas fa-info-circle me-2"></i>
                    Thông tin chi tiết
                  </h6>
                  <table className="table table-bordered table-striped align-middle">
                    <tbody>
                      <tr><th>Mã sản phẩm</th><td>{product.articleNumber || product.sku || 'N/A'}</td></tr>
                      <tr><th>Số lượng tồn kho</th><td>{product.quantity}</td></tr>
                      <tr><th>Ngày cập nhật</th><td>{new Date(product.updatedAt).toLocaleString()}</td></tr>
                      <tr><th>Bảo hành</th><td>{product.guarantee || '12 tháng'}</td></tr>
                      <tr><th>Thời gian giao hàng</th><td>{product.shippingInfo?.deliveryTime || '3-5 ngày'}</td></tr>
                      <tr><th>Tình trạng</th><td>
                        <span className={product.quantity > 0 ? "badge bg-success" : "badge bg-danger"}>
                          {product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </aside>

            <main className="col-md-6">
              <article className="product-info-aside">
                <h2 className="title mt-3 mb-3 fw-bold text-dark">{product.productName}</h2>
                
                {/* Hiển thị giá chuẩn */}
                <div className="mb-4">
                  {isOnSale ? (
                    <>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <span className="price h3 text-danger fw-bold mb-0">
                          {formatPrice(salePrice)}
                        </span>
                        <span className="text-muted fs-5 text-decoration-line-through">
                          {formatPrice(comparePrice)}
                        </span>
                        <span 
                          className="badge"
                          style={{
                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                            color: 'white',
                            fontSize: '0.8rem',
                            padding: '6px 12px'
                          }}
                        >
                          -{discountPercent}%
                        </span>
                      </div>
                      <div 
                        className="text-success fw-semibold"
                        style={{ fontSize: '0.95rem' }}
                      >
                        <i className="fas fa-tag me-1"></i>
                        Bạn tiết kiệm được {formatPrice(comparePrice - salePrice)}
                      </div>
                    </>
                  ) : (
                    <span className="price h3 text-dark fw-bold">
                      {formatPrice(displayPrice)}
                    </span>
                  )}
                </div>

                <p className="mb-4 fs-5 text-secondary">{product.shortDescription}</p>
                
                <div className="form-row mt-4 mb-4">
                  <div className="form-group col-md flex-grow-0">
                    <div className="input-group" style={{ width: "140px" }}>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        style={{ 
                          width: "40px",
                          height: "40px",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "20px 0 0 20px"
                        }}
                      >
                        <i className="fas fa-minus"></i>
                      </button>

                      <input
                        type="text"
                        className="form-control text-center"
                        value={quantity}
                        readOnly
                        style={{ 
                          border: "1px solid #dee2e6",
                          borderLeft: 0,
                          borderRight: 0,
                          backgroundColor: "#fff"
                        }}
                      />

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setQuantity(Math.min(99, quantity + 1))}
                        disabled={quantity >= 99}
                        style={{ 
                          width: "40px",
                          height: "40px",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0 20px 20px 0"
                        }}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="form-group col-md">
                    <button
                      className="btn btn-primary w-100 py-3 fs-5 fw-bold"
                      onClick={() => {
                        if (customerId) {
                          handleAddToCart(customerId, product.id, quantity);
                            //addToCart(customerId, product.id, quantity);  // Sử dụng addToCart thay vì handleAddToCart

                        } else {
                          alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
                        }
                      }}
                      disabled={product.quantity === 0}
                      style={{
                        background: product.quantity === 0 
                          ? "#6c757d" 
                          : "linear-gradient(135deg, #007bff, #0056b3)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        transition: "all 0.3s ease",
                        boxShadow: product.quantity === 0 
                          ? "none" 
                          : "0 4px 15px rgba(0, 123, 255, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        if (product.quantity > 0) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.4)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (product.quantity > 0) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 123, 255, 0.3)";
                        }
                      }}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      {product.quantity === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                    </button>
                  </div>
                </div>

                <hr className="my-4" style={{ opacity: 0.15 }} />
                <h6 className="mb-3 fw-bold" style={{ color: "#495057" }}>
                  <i className="fas fa-info-circle me-2"></i>
                  Mô tả chi tiết
                </h6>
                <div
                  className="bg-light rounded p-4"
                  style={{ 
                    minHeight: 120,
                    fontSize: 16,
                    color: "#495057",
                    lineHeight: 1.6,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef"
                  }}
                  dangerouslySetInnerHTML={{ __html: product.productDescription }}
                />
              </article>
            </main>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-dark mb-2">
              <i className="fas fa-layer-group me-2" style={{ color: '#495057' }}></i>
              Các sản phẩm liên quan
            </h3>
            <p className="text-muted mb-0">Khám phá thêm những sản phẩm tương tự</p>
          </div>

          {relatedLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải sản phẩm liên quan...</p>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="related-carousel-container">
              <div className="related-carousel-track">
                {/* Duplicate for infinite scroll */}
                {[...relatedProducts, ...relatedProducts].map((item, index) => {
                  // LOGIC GIÁ CHUẨN CHO RELATED PRODUCTS
                  const itemBuyingPrice = item.buyingPrice ?? 0;
                  const itemComparePrice = item.comparePrice ?? 0;
                  const itemSalePrice = item.salePrice ?? 0;
                  
                  const itemIsOnSale = itemComparePrice > 0 && itemSalePrice > 0 && itemSalePrice < itemComparePrice;
                  const itemDiscountPercent = itemIsOnSale 
                    ? Math.round(((itemComparePrice - itemSalePrice) / itemComparePrice) * 100)
                    : 0;
                  const itemDisplayPrice = itemSalePrice > 0 ? itemSalePrice : (itemComparePrice > 0 ? itemComparePrice : itemBuyingPrice);

                  return (
                    <div key={`${item.id}-${index}`} className="related-product-card">
                      <Link to={`/product-detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                          {/* Badge giảm giá cho related products */}
                          {itemIsOnSale && (
                            <span style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: 'linear-gradient(135deg, #dc3545, #c82333)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 700,
                              zIndex: 3,
                              textTransform: 'uppercase'
                            }}>
                              -{itemDiscountPercent}%
                            </span>
                          )}

                          {/* Badge SALE cho related products - removed */}

                          <img
                            src={item.thumbnail || '/images/no-image.png'}
                            alt={item.productName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.5s ease'
                            }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/no-image.png';
                            }}
                          />
                        </div>
                        <div style={{ padding: '20px' }}>
                          <h6 style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#212529',
                            marginBottom: '12px',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '40px'
                          }}>
                            {item.productName}
                          </h6>
                          
                          {/* Giá cho related products */}
                          <div style={{ marginBottom: '12px' }}>
                            {itemIsOnSale ? (
                              <div>
                                <span style={{
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#dc3545',
                                  marginRight: '8px'
                                }}>
                                  {formatPrice(itemSalePrice)}
                                </span>
                                <span style={{
                                  fontSize: '14px',
                                  color: '#6c757d',
                                  textDecoration: 'line-through'
                                }}>
                                  {formatPrice(itemComparePrice)}
                                </span>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#28a745',
                                  fontWeight: 600,
                                  marginTop: '2px'
                                }}>
                                  <i className="fas fa-tag me-1"></i>
                                  Tiết kiệm {formatPrice(itemComparePrice - itemSalePrice)}
                                </div>
                              </div>
                            ) : (
                              <span style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#212529'
                              }}>
                                {formatPrice(itemDisplayPrice)}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i 
                                  key={star} 
                                  className={`fas fa-star ${star <= 4 ? 'text-warning' : 'text-muted'}`}
                                  style={{ fontSize: '12px' }}
                                ></i>
                              ))}
                            </div>
                            <span style={{ fontSize: '12px', color: '#6c757d' }}>
                              ({Math.floor(Math.random() * 50 + 10)} đánh giá)
                            </span>
                          </div>

                          {/* Trạng thái tồn kho */}
                          <div style={{
                            marginTop: '8px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'center',
                            background: item.quantity > 0 ? '#d4edda' : '#f8d7da',
                            color: item.quantity > 0 ? '#155724' : '#721c24'
                          }}>
                            {item.quantity > 0 ? (
                              <>
                                <i className="fas fa-check-circle me-1"></i>
                                Còn {item.quantity} sản phẩm
                              </>
                            ) : (
                              <>
                                <i className="fas fa-times-circle me-1"></i>
                                Hết hàng
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-box-open text-muted" style={{ fontSize: '4rem' }}></i>
              <p className="mt-3 text-muted">Không có sản phẩm liên quan</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Detail;