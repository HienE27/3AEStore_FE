import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNews } from '../api/NewsAPI';
import { NewsModel } from '../models/NewsModel';

const ITEMS_PER_PAGE = 12;

const NewsAllPage: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newsData = await getAllNews();
      setNewsList(newsData);
      
    } catch (err: any) {
      console.error("Error loading news:", err);
      setError("Không thể tải tin tức. Vui lòng thử lại sau.");
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort news
  const processedNews = React.useMemo(() => {
    let filtered = newsList.filter(news =>
      news.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (news.author && news.author.toLowerCase().includes(searchKeyword.toLowerCase()))
    );

    // Sort based on selected option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return (Number(b.id) || 0) - (Number(a.id) || 0);
        case 'oldest':
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return (Number(a.id) || 0) - (Number(b.id) || 0);
        case 'title':
          return a.title.localeCompare(b.title, 'vi');
        case 'author':
          return (a.author || '').localeCompare(b.author || '', 'vi');
        default:
          return 0;
      }
    });

    return filtered;
  }, [newsList, searchKeyword, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedNews.length / ITEMS_PER_PAGE);
  const paginatedNews = processedNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsClick = (newsId: string | number) => {
    navigate(`/news/${newsId}`);
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="news-all-page">
        <style>{newsAllStyles}</style>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h3 className="loading-title">Đang tải tin tức...</h3>
            <p className="loading-text">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="news-all-page">
        <style>{newsAllStyles}</style>
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="error-title">Không thể tải tin tức</h3>
            <p className="error-text">{error}</p>
            <div className="error-actions">
              <button className="error-btn retry" onClick={fetchNews}>
                <i className="fas fa-refresh"></i>
                <span>Thử lại</span>
              </button>
              <button className="error-btn home" onClick={() => navigate('/')}>
                <i className="fas fa-home"></i>
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-all-page">
      <style>{newsAllStyles}</style>
      
      {/* Hero Header */}
      <div className="hero-header">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="breadcrumb">
              <button onClick={() => navigate('/')} className="breadcrumb-item">
                <i className="fas fa-home"></i>
                <span>Trang chủ</span>
              </button>
              <i className="fas fa-chevron-right breadcrumb-separator"></i>
              <span className="breadcrumb-current">Tin tức</span>
            </div>
            
            <h1 className="hero-title">Tin Tức & Bài Viết</h1>
            <p className="hero-subtitle">
              Khám phá những thông tin, kiến thức và câu chuyện thú vị từ chúng tôi
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{newsList.length}</span>
                <span className="stat-label">Tổng bài viết</span>
              </div>
              <div className="stat-separator"></div>
              <div className="stat-item">
                <span className="stat-number">{processedNews.length}</span>
                <span className="stat-label">Kết quả hiển thị</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-header">
              <h3 className="filters-title">
                <i className="fas fa-filter"></i>
                Lọc & Tìm kiếm
              </h3>
              {(searchKeyword || sortBy !== 'newest') && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <i className="fas fa-times"></i>
                  <span>Xóa bộ lọc</span>
                </button>
              )}
            </div>
            
            <div className="filters-content">
              <div className="search-section">
                <div className="search-box">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc tác giả..."
                    value={searchKeyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                  />
                  {searchKeyword && (
                    <button 
                      className="clear-search"
                      onClick={() => handleSearch('')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="sort-section">
                <label className="sort-label">
                  <i className="fas fa-sort"></i>
                  Sắp xếp theo:
                </label>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="title">Tiêu đề A-Z</option>
                  <option value="author">Tác giả A-Z</option>
                </select>
              </div>
            </div>
            
            {searchKeyword && (
              <div className="search-results-info">
                <i className="fas fa-info-circle"></i>
                <span>
                  Tìm thấy <strong>{processedNews.length}</strong> kết quả cho từ khóa 
                  "<strong>{searchKeyword}</strong>"
                </span>
              </div>
            )}
          </div>

          {/* Results Section */}
          {paginatedNews.length > 0 ? (
            <>
              <div className="results-header">
                <h2 className="results-title">
                  <i className="fas fa-newspaper"></i>
                  {searchKeyword ? 'Kết quả tìm kiếm' : 'Tất cả bài viết'}
                </h2>
                <div className="results-meta">
                  Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, processedNews.length)} 
                  trong tổng số {processedNews.length} bài viết
                </div>
              </div>

              <div className="news-grid">
                {paginatedNews.map((news, index) => (
                  <article 
                    key={news.id}
                    className="news-card"
                    onClick={() => handleNewsClick(news.id!)}
                  >
                    <div className="card-image">
                      <img
                        src={news.image || "/images/default-news.jpg"}
                        alt={news.title}
                        className="news-image"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiNEREREREQiLz4KPHN2Zz4K";
                        }}
                      />
                      <div className="card-overlay">
                        <span className="news-category">
                          <i className="fas fa-newspaper"></i>
                          Tin tức
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="card-meta">
                        <span className="meta-date">
                          <i className="fas fa-calendar-alt"></i>
                          {news.createdAt 
                            ? new Date(news.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric'
                              })
                            : 'N/A'
                          }
                        </span>
                        <span className="meta-author">
                          <i className="fas fa-user"></i>
                          {news.author || 'Admin'}
                        </span>
                      </div>
                      
                      <h3 className="card-title">{news.title}</h3>
                      <p className="card-summary">{news.summary}</p>
                      
                      <div className="card-footer">
                        <span className="read-more">
                          Đọc tiếp
                          <i className="fas fa-arrow-right"></i>
                        </span>
                        <span className="read-time">
                          <i className="fas fa-clock"></i>
                          5 phút
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-section">
                  <div className="pagination-info">
                    <span>
                      Trang {currentPage} / {totalPages} 
                      ({processedNews.length} bài viết)
                    </span>
                  </div>
                  
                  <div className="pagination">
                    <button 
                      className="page-btn nav-btn"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      title="Trang đầu"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    
                    <button 
                      className="page-btn nav-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    
                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              className={`page-btn page-number ${page === currentPage ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        }
                        
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return <span key={page} className="page-dots">...</span>;
                        }
                        
                        return null;
                      })}
                    </div>
                    
                    <button 
                      className="page-btn nav-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    
                    <button 
                      className="page-btn nav-btn"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Trang cuối"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-section">
              <div className="empty-content">
                <div className="empty-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="empty-title">
                  {searchKeyword ? 'Không tìm thấy kết quả' : 'Chưa có bài viết nào'}
                </h3>
                <p className="empty-text">
                  {searchKeyword 
                    ? `Không tìm thấy bài viết nào phù hợp với từ khóa "${searchKeyword}". Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.`
                    : 'Hiện tại chưa có bài viết nào được đăng tải. Hãy quay lại sau nhé!'
                  }
                </p>
                <div className="empty-actions">
                  {searchKeyword && (
                    <button className="empty-btn primary" onClick={clearFilters}>
                      <i className="fas fa-refresh"></i>
                      <span>Xóa bộ lọc</span>
                    </button>
                  )}
                  <button className="empty-btn secondary" onClick={() => navigate('/')}>
                    <i className="fas fa-home"></i>
                    <span>Về trang chủ</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top */}
      <button 
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ opacity: currentPage > 1 || window.scrollY > 500 ? 1 : 0 }}
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
};

const newsAllStyles = `
  .news-all-page {
    min-height: 100vh;
    background: #f8fafc;
  }
  
  .news-all-page .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* Hero Header */
  .hero-header {
    position: relative;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    padding: 60px 0 80px;
    overflow: hidden;
  }
  
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .hero-pattern {
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
  }
  
  .breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;
    font-size: 0.9rem;
  }
  
  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .breadcrumb-item:hover {
    color: white;
  }
  
  .breadcrumb-separator {
    color: rgba(255,255,255,0.6);
    font-size: 0.8rem;
  }
  
  .breadcrumb-current {
    color: white;
    font-weight: 600;
  }
  
  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0 0 16px 0;
    text-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  .hero-subtitle {
    font-size: 1.3rem;
    margin: 0 0 40px 0;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
  }
  
  .hero-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: 500;
  }
  
  .stat-separator {
    width: 1px;
    height: 40px;
    background: rgba(255,255,255,0.3);
  }
  
  /* Main Content */
  .main-content {
    padding: 40px 0 80px;
    margin-top: -40px;
    position: relative;
    z-index: 3;
  }
  
  /* Filters Section */
  .filters-section {
    background: white;
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 40px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .filters-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .filters-title i {
    color: #3b82f6;
  }
  
  .clear-filters-btn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .clear-filters-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }
  
  .filters-content {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    align-items: end;
  }
  
  .search-section {
    flex: 1;
  }
  
  .search-box {
    position: relative;
  }
  
  .search-input {
    width: 100%;
    padding: 16px 20px 16px 50px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 1rem;
    background: #fafbfc;
    transition: all 0.3s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 1.1rem;
  }
  
  .clear-search {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: #e5e7eb;
    border: none;
    color: #6b7280;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .clear-search:hover {
    background: #d1d5db;
  }
  
  .sort-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .sort-label {
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  
  .sort-label i {
    color: #3b82f6;
  }
  
  .sort-select {
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
  }
  
  .sort-select:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  .search-results-info {
    margin-top: 16px;
    padding: 12px 16px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    color: #1e40af;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  /* Results Section */
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 0 8px;
  }
  
  .results-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .results-title i {
    color: #3b82f6;
  }
  
  .results-meta {
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 500;
  }
  
  /* News Grid */
  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 24px;
    margin-bottom: 60px;
  }
  
  /* News Card - Đảm bảo background trắng và không bị override */
  .news-card {
    background: white !important;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .news-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
  
  .card-image {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: white;
  }
  
  .news-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  .news-card:hover .news-image {
    transform: scale(1.05);
  }
  
  .card-overlay {
    position: absolute;
    top: 16px;
    left: 16px;
  }
  
  /* Sửa selector này - đổi từ card-category thành news-category */
  .news-category {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(59, 130, 246, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }
  
  .card-content {
    padding: 24px;
    background: white;
  }
  
  .card-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    font-size: 0.85rem;
    color: #6b7280;
  }
  
  .meta-date, .meta-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }
  
  .meta-date i, .meta-author i {
    color: #3b82f6;
    font-size: 0.75rem;
  }
  
  .card-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-summary {
    color: #4b5563;
    line-height: 1.6;
    margin: 0 0 20px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
  }
  
  .read-more {
    color: #3b82f6;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .news-card:hover .read-more {
    color: #1d4ed8;
    gap: 12px;
  }
  
  .read-more i {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
  }
  
  .news-card:hover .read-more i {
    transform: translateX(4px);
  }
  
  .read-time {
    color: #9ca3af;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Pagination */
  .pagination-section {
    text-align: center;
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  
  .pagination-info {
    margin-bottom: 24px;
    color: #6b7280;
    font-weight: 500;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .page-btn {
    background: white;
    border: 2px solid #e5e7eb;
    color: #374151;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    border-radius: 8px;
  }
  
  .page-btn:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f8fafc;
  }
  
  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .nav-btn {
    width: 44px;
    height: 44px;
  }
  
  .page-number {
    width: 44px;
    height: 44px;
    font-size: 0.9rem;
  }
  
  .page-number.active {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  
  .page-numbers {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0 12px;
  }
  
  .page-dots {
    color: #9ca3af;
    padding: 0 8px;
    font-weight: 600;
  }
  
  /* Empty State */
  .empty-section {
    text-align: center;
    padding: 80px 20px;
  }
  
  .empty-content {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .empty-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #e5e7eb, #d1d5db);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 32px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .empty-icon i {
    font-size: 40px;
    color: #9ca3af;
  }
  
  .empty-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 16px 0;
  }
  
  .empty-text {
    color: #6b7280;
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 0 32px 0;
  }
  
  .empty-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .empty-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    font-size: 0.95rem;
  }
  
  .empty-btn.primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  
  .empty-btn.secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .empty-btn:hover {
    transform: translateY(-3px);
  }
  
  .empty-btn.primary:hover {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  .empty-btn.secondary:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  /* Loading State */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  }
  
  .loading-content {
    text-align: center;
    background: white;
    padding: 60px 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 5px solid #f1f5f9;
    border-top: 5px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 24px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
  }
  
  .loading-text {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
  }
  
  /* Error State */
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
  }
  
  .error-content {
    text-align: center;
    background: white;
    padding: 60px 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    max-width: 500px;
  }
  
  .error-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .error-icon i {
    font-size: 40px;
    color: white;
  }
  
  .error-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
  }
  
  .error-text {
    color: #6b7280;
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 0 32px 0;
  }
  
  .error-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .error-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    font-size: 0.95rem;
  }
  
  .error-btn.retry {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }
  
  .error-btn.home {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .error-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  /* Scroll to Top */
  .scroll-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;
    z-index: 100;
  }
  
  .scroll-top:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }
    
    .hero-header {
      padding: 40px 0 60px;
    }
    
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1.1rem;
    }
    
    .hero-stats {
      flex-direction: column;
      gap: 20px;
      padding: 20px;
    }
    
    .stat-separator {
      width: 40px;
      height: 1px;
    }
    
    .main-content {
      padding: 20px 0 60px;
      margin-top: -20px;
    }
    
    .filters-section {
      padding: 24px;
      margin-bottom: 24px;
    }
    
    .filters-content {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    .sort-section {
      justify-content: flex-start;
    }
    
    .sort-select {
      min-width: unset;
      flex: 1;
    }
    
    .results-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    .results-title {
      font-size: 1.5rem;
    }
    
    .news-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .pagination-section {
      padding: 24px;
    }
    
    .pagination {
      gap: 4px;
    }
    
    .nav-btn {
      width: 40px;
      height: 40px;
    }
    
    .page-number {
      width: 40px;
      height: 40px;
      font-size: 0.85rem;
    }
    
    .page-numbers {
      margin: 0 8px;
    }
    
    .scroll-top {
      width: 48px;
      height: 48px;
      bottom: 20px;
      right: 20px;
      font-size: 1rem;
    }
    
    .loading-content,
    .error-content {
      padding: 40px 24px;
      margin: 20px;
    }
  }
  
  @media (max-width: 480px) {
    .hero-title {
      font-size: 2rem;
    }
    
    .breadcrumb {
      font-size: 0.8rem;
    }
    
    .filters-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    
    .search-input {
      padding: 14px 16px 14px 44px;
      font-size: 0.9rem;
    }
    
    .search-icon {
      left: 16px;
      font-size: 1rem;
    }
    
    .sort-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      width: 100%;
    }
    
    .sort-select {
      width: 100%;
    }
    
    .card-content {
      padding: 20px;
    }
    
    .card-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .empty-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .empty-btn,
    .error-btn {
      width: 200px;
      justify-content: center;
    }
    
    .pagination {
      justify-content: center;
    }
    
    .page-numbers {
      flex-wrap: wrap;
      margin: 0 4px;
    }
  }
`;

export default NewsAllPage;