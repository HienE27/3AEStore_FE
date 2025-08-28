import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NewsModel } from "../../../models/NewsModel";

const NewsDetail2: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) {
        setError('ID không hợp lệ');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/api/news/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        } else {
          setError(`Lỗi ${response.status}: Không thể tải tin tức`);
        }
      } catch (err: any) {
        setError('Lỗi kết nối: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [id]);

  // Custom styles as CSS-in-JS objects
  const styles = {
    mainContent: {
      marginLeft: '250px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
      padding: '0'
    },
    loadingContainer: {
      marginLeft: '250px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0'
    },
    errorContainer: {
      marginLeft: '250px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      padding: '40px'
    },
    heroSection: {
      height: '60vh',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    },
    heroOverlay: {
      height: '200px',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      zIndex: 1
    },
    floatingCard: {
      borderRadius: '20px',
      marginTop: '-100px',
      position: 'relative' as const,
      zIndex: 10,
      transition: 'all 0.3s ease'
    },
    metaCard: {
      borderRadius: '16px',
      transition: 'all 0.3s ease'
    },
    roundedBtn: {
      borderRadius: '50px',
      transition: 'all 0.3s ease'
    },
    articleContent: {
      color: '#2d3748',
      lineHeight: '1.8',
      fontSize: '1.1rem'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-grow text-light mb-4" style={{ width: '4rem', height: '4rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h3 className="text-white mb-2">Đang tải tin tức...</h3>
            <p className="text-white-50">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="text-danger mb-3">Oops! Có lỗi xảy ra</h2>
                  <p className="text-muted mb-4 fs-5">{error}</p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      className="btn btn-danger btn-lg px-4 py-2"
                      onClick={() => navigate("/management/news")}
                      style={styles.roundedBtn}
                    >
                      <i className="fas fa-home me-2"></i>
                      Về trang chủ
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-lg px-4 py-2"
                      onClick={() => window.location.reload()}
                      style={styles.roundedBtn}
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
      </div>
    );
  }

  if (!news) return null;

  const heroStyle = {
    ...styles.heroSection,
    background: news.image ? 
      `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${news.image})` : 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  return (
    <div style={styles.mainContent}>
      {/* Header với Parallax Effect */}
      <div className="position-relative overflow-hidden" style={heroStyle}>
        {/* Navigation */}
        <nav className="navbar navbar-expand-lg navbar-dark position-absolute w-100" style={{ zIndex: 10 }}>
          <div className="container-fluid px-4">
            <button 
              className="btn btn-outline-light btn-sm px-3"
              onClick={() => navigate("/management/news")}
              style={styles.roundedBtn}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </button>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-light btn-sm px-3"
                onClick={() => navigate(`/management/news/edit/${id}`)}
                style={styles.roundedBtn}
              >
                <i className="fas fa-edit me-2"></i>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="position-absolute bottom-0 start-0 end-0 p-5" style={{ zIndex: 5 }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  {news.title}
                </h1>
                <div className="d-flex align-items-center text-white-50 mb-3">
                  <div className="d-flex align-items-center me-4">
                    <i className="fas fa-user-circle me-2 fs-5"></i>
                    <span className="fs-6">{news.author}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-calendar-alt me-2 fs-6"></i>
                    <span className="fs-6">
                      {news.createdAt ? 
                        new Date(news.createdAt).toLocaleDateString("vi-VN", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                {news.summary && (
                  <p className="fs-5 text-white-75 mb-0" style={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: '1.6'
                  }}>
                    {news.summary}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div 
          className="position-absolute bottom-0 start-0 end-0"
          style={styles.heroOverlay}
        ></div>
      </div>

      {/* Content Section */}
      <div className="position-relative bg-white">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Floating Content Card */}
              <div className="card border-0 shadow-lg mb-5" style={styles.floatingCard}>
                <div className="card-body p-5">
                  {/* Meta Info */}
                  <div className="row g-3 mb-5">
                    <div className="col-md-6">
                      <div 
                        className="p-4 h-100"
                        style={{
                          ...styles.metaCard,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        <div className="d-flex align-items-center text-white">
                          <div 
                            className="rounded-circle bg-white bg-opacity-20 p-3 me-3"
                            style={{ width: '60px', height: '60px' }}
                          >
                            <i className="fas fa-user fs-4 text-white d-flex align-items-center justify-content-center h-100"></i>
                          </div>
                          <div>
                            <small className="text-white-50 text-uppercase fw-bold">Tác giả</small>
                            <h5 className="text-white mb-0">{news.author}</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div 
                        className="p-4 h-100"
                        style={{
                          ...styles.metaCard,
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        }}
                      >
                        <div className="d-flex align-items-center text-white">
                          <div 
                            className="rounded-circle bg-white bg-opacity-20 p-3 me-3"
                            style={{ width: '60px', height: '60px' }}
                          >
                            <i className="fas fa-clock fs-4 text-white d-flex align-items-center justify-content-center h-100"></i>
                          </div>
                          <div>
                            <small className="text-white-50 text-uppercase fw-bold">Ngày đăng</small>
                            <h6 className="text-white mb-0">
                              {news.createdAt ? 
                                new Date(news.createdAt).toLocaleDateString("vi-VN", {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'
                              }
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="article-content">
                    <div 
                      className="fs-5 lh-lg"
                      style={styles.articleContent}
                      dangerouslySetInnerHTML={{ 
                        __html: news.content || '<p class="text-muted fst-italic text-center py-5">Không có nội dung</p>' 
                      }} 
                    />
                  </div>

                  {/* Article Footer */}
                  <div className="border-top pt-4 mt-5">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center text-muted">
                          <i className="fas fa-hashtag me-2"></i>
                          <small>ID: #{news.id}</small>
                        </div>
                      </div>
                      <div className="col-md-6 text-md-end">
                        <div className="d-flex justify-content-md-end gap-2">
                          <button 
                            className="btn btn-outline-primary px-4"
                            onClick={() => navigate("/management/news")}
                            style={styles.roundedBtn}
                          >
                            <i className="fas fa-list me-2"></i>
                            Danh sách
                          </button>
                          <button 
                            className="btn btn-primary px-4"
                            onClick={() => navigate(`/management/news/edit/${id}`)}
                            style={{
                              ...styles.roundedBtn,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none'
                            }}
                          >
                            <i className="fas fa-edit me-2"></i>
                            Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Actions */}
              <div className="text-center">
                <h4 className="text-white mb-4">Bạn muốn làm gì tiếp theo?</h4>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <button 
                    className="btn btn-light btn-lg px-4 py-3"
                    onClick={() => navigate("/management/news/create")}
                    style={styles.roundedBtn}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Tạo tin mới
                  </button>
                  <button 
                    className="btn btn-outline-light btn-lg px-4 py-3"
                    onClick={() => navigate("/management/news")}
                    style={styles.roundedBtn}
                  >
                    <i className="fas fa-newspaper me-2"></i>
                    Xem tất cả
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for additional styling */}
      <style>{`
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 20px 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .article-content p {
          margin-bottom: 1.5rem;
        }
        
        .article-content h1, .article-content h2, .article-content h3 {
          color: #2d3748;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NewsDetail2;