import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../api/CategoryAPI";
import CategoryModel from "../models/CategoryModel";
import { searchProducts } from "../api/ProductAPI";
import ProductModel from "../models/ProductModel";
import { getAllGalleryImagesByProductId } from "../api/GalleryAPI";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";



import "../styles/Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductModel[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [galleryMap, setGalleryMap] = useState<{ [key: string]: string }>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart(); // lấy số lượng giỏ hàng


  const inputRef = useRef<HTMLInputElement>(null);

  // Dùng context để lấy trạng thái đăng nhập
  const { token, role, userName, logout } = useAuth();




  // Tải danh mục
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();

    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm xử lý logout
  const handleLogout = () => {
    logout(); // chỉ cần gọi context
    navigate("/login");
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  // Gợi ý sản phẩm khi nhập (debounce)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchProducts(searchTerm, 0, 5)
        .then((data) => setSuggestions(data.products))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Khi suggestions thay đổi, lấy thumbnail cho từng sản phẩm
  useEffect(() => {
    if (suggestions.length === 0) {
      setGalleryMap({});
      return;
    }
    const fetchThumbnails = async () => {
      const map: { [key: string]: string } = {};
      await Promise.all(
        suggestions.map(async (product) => {
          const productKey = product.id;
          if (!productKey) return;
          try {
            const gallery = await getAllGalleryImagesByProductId(productKey);
            const thumbnail =
              gallery.find((g) => g.isThumbnail)?.image ||
              gallery[0]?.image ||
              "";
            map[productKey] = thumbnail;
          } catch {
            map[productKey] = "";
          }
        })
      );
      setGalleryMap(map);
    };
    fetchThumbnails();
  }, [suggestions]);

  // Ẩn gợi ý khi click ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Banner */}
      <div className="header-banner">
        <div className="container">
          <div className="banner-content">
            <span className="banner-text">
              🔥 Miễn phí vận chuyển cho đơn hàng trên 500.000₫
            </span>
            <div className="banner-links">
              <Link to="/help" className="banner-link">Trợ giúp</Link>
              <Link to="/contact" className="banner-link">Liên hệ</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo-section">
              <Link to="/" className="logo-link">
                <img
                  className="logo-img"
                  src="/images/logo-r.png"
                  alt="logo"
                />
                <span className="logo-text">3AE Store</span>
              </Link>
            </div>

            {/* Search */}
            <div className="search-section">
              <form className="search-form" onSubmit={handleSearch} autoComplete="off">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <i className="search-icon fa fa-search"></i>
                    <input
                      ref={inputRef}
                      type="text"
                      className="search-input"
                      placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="clear-search-btn"
                        onClick={() => {
                          setSearchTerm("");
                          setSuggestions([]);
                        }}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    )}
                  </div>
                  <button className="search-btn" type="submit">
                    <i className="fa fa-search"></i>
                    <span>Tìm kiếm</span>
                  </button>
                </div>
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="search-suggestions">
                    <div className="suggestions-header">
                      <span>Gợi ý sản phẩm</span>
                    </div>
                    <ul className="suggestions-list">
                      {suggestions.map((product) => {
                        const productKey = product.id;
                        if (!productKey) return null;
                        return (
                          <li
                            key={productKey}
                            className="suggestion-item"
                            onMouseDown={() => {
                              navigate(`/product-detail/${productKey}`);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="suggestion-image">
                              <img
                                src={
                                  galleryMap[productKey] ||
                                  product.image ||
                                  "/images/no-image.png"
                                }
                                alt={product.productName}
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                                }}
                              />
                            </div>
                            <div className="suggestion-content">
                              <div className="suggestion-name" title={product.productName}>
                                {product.productName}
                              </div>
                              {typeof product.comparePrice === "number" && (
                                <div className="suggestion-price">
                                  {product.comparePrice.toLocaleString("vi-VN")}₫
                                </div>
                              )}
                            </div>
                            <div className="suggestion-arrow">
                              <i className="fa fa-arrow-right"></i>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="actions-section">
              <div className="action-buttons">
                {/* <Link to="/cart" className="action-btn cart-btn">
                  <div className="btn-icon">
                    <i className="fa fa-shopping-cart"></i>
                    <span className="cart-badge">3</span>
                  </div>
                  <span className="btn-text">Giỏ hàng</span>
                </Link> */}


                <Link to="/cart" className="action-btn cart-btn">
  <div className="btn-icon">
    <i className="fa fa-shopping-cart"></i>
    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}

  </div>
  <span className="btn-text">Giỏ hàng</span>
</Link>


                <Link to="/profile/wishlist" className="action-btn">
                  <div className="btn-icon">
                    <i className="fa fa-heart"></i>
                  </div>
                  <span className="btn-text">Yêu thích</span>
                </Link>

                <Link to="/notifications" className="action-btn">
                  <div className="btn-icon">
                    <i className="fa fa-bell"></i>
                    <span className="notification-badge"></span>
                  </div>
                  <span className="btn-text">Thông báo</span>
                </Link>
              </div>

              {/* User Section */}
              <div className="user-section">
                {!token ? (
                  <div className="auth-buttons">
                    <Link to="/login" className="auth-btn login-btn">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="auth-btn register-btn">
                      Đăng ký
                    </Link>
                  </div>
                ) : (
                  <div className="user-menu">
                    <div className="user-avatar">
                      <img 
                        src="/images/default-avatar.png" 
                        alt="User Avatar"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userName}&background=2196F3&color=fff`;
                        }}
                      />
                    </div>
                    <div className="user-info">
                      <span className="user-greeting">Xin chào</span>
                      <span className="user-name">{userName}</span>
                    </div>
                    <div className="user-dropdown">
                      <Link to="/profile" className="dropdown-item">
                        <i className="fa fa-user"></i>
                        Tài khoản của tôi
                      </Link>
                      <Link to="/profile/orders" className="dropdown-item">
                        <i className="fa fa-box"></i>
                        Đơn hàng
                      </Link>
                      <Link to="/settings" className="dropdown-item">
                        <i className="fa fa-cog"></i>
                        Cài đặt
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-item"
                      >
                        <i className="fa fa-sign-out-alt"></i>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container">
          <div className="nav-content">
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link active">
                  <i className="fa fa-home"></i>
                  Trang chủ
                </Link>
              </li>

              <li 
                className={`nav-item dropdown ${dropdownOpen ? "show" : ""}`}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link to="/category" className="nav-link">
                  <i className="fa fa-th-large"></i>
                  Danh mục sản phẩm
                  <i className="fa fa-chevron-down dropdown-icon"></i>
                </Link>
                {dropdownOpen && (
                  <div className="mega-menu">
                    <div className="mega-menu-content">
                      <div className="category-grid">
                        {loading ? (
                          <div className="loading-categories">
                            <div className="loading-spinner"></div>
                            <span>Đang tải danh mục...</span>
                          </div>
                        ) : (
                          categories.slice(0, 8).map((category) => (
                            <Link 
                              key={category.id} 
                              to={`/category/${category.id}`}
                              className="category-item"
                            >
                              <div className="category-icon">
                                <i className="fa fa-tag"></i>
                              </div>
                              <span className="category-name">{category.categoryName}</span>
                            </Link>
                          ))
                        )}
                      </div>
                      <div className="menu-footer">
                        <Link to="/category" className="view-all-btn">
                          Xem tất cả danh mục
                          <i className="fa fa-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>
              <li className="nav-item">
                <Link to="/deals" className="nav-link">
                  <i className="fa fa-fire"></i>
                  Khuyến mãi
                  <span className="hot-badge">HOT</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/new-arrivals" className="nav-link">
                  <i className="fa fa-star"></i>
                  Hàng mới
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/brands" className="nav-link">
                  <i className="fa fa-crown"></i>
                  Thương hiệu
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/news" className="nav-link">
                  <i className="fa fa-newspaper"></i>
                  Tin tức
                </Link>
              </li>
            </ul>

            {/* Quick Links */}
            <div className="quick-links">
              <Link to="/flash-sale" className="quick-link flash-sale">
                <i className="fa fa-bolt"></i>
                Flash Sale
              </Link>
              <Link to="/free-shipping" className="quick-link">
                <i className="fa fa-truck"></i>
                Miễn phí ship
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
