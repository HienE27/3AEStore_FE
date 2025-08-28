import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNews } from '../api/NewsAPI';
import { NewsModel } from '../models/NewsModel';

const NewsList: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const newsData = await getAllNews();
        
        // Sắp xếp tin mới nhất trước
        const sortedNews = newsData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          const idA = Number(a.id) || 0;
          const idB = Number(b.id) || 0;
          return idB - idA;
        });
        
        setNewsList(sortedNews);
        
      } catch (err: any) {
        console.error("Error loading news:", err);
        setError("Không thể tải tin tức. Vui lòng thử lại sau.");
        setNewsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="news-section">
        <style>{newsStyles}</style>
        <div className="news-section-title">
          <i className="fas fa-newspaper" style={{ color: "#f26522", marginRight: 12 }}></i>
          Tin tức mới nhất
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải tin tức...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="news-section">
        <style>{newsStyles}</style>
        <div className="news-section-title">
          <i className="fas fa-newspaper" style={{ color: "#f26522", marginRight: 12 }}></i>
          Tin tức mới nhất
        </div>
        <div className="error-container">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h4>Không thể tải tin tức</h4>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (newsList.length === 0) {
    return (
      <section className="news-section">
        <style>{newsStyles}</style>
        <div className="news-section-title">
          <i className="fas fa-newspaper" style={{ color: "#f26522", marginRight: 12 }}></i>
          Tin tức mới nhất
        </div>
        <div className="empty-container">
          <i className="fas fa-newspaper empty-icon"></i>
          <h4>Chưa có tin tức nào</h4>
          <p>Hiện tại chưa có tin tức nào được đăng tải.</p>
        </div>
      </section>
    );
  }

  // Main content - giữ nguyên cấu trúc cũ
  return (
    <>
      <style>{newsStyles}</style>
      <section className="news-section">
        <div className="news-section-title">
          <i className="fas fa-newspaper" style={{ color: "#f26522", marginRight: 12 }}></i>
          Tin tức mới nhất
        </div>
        
        <div className="news-row">
          {newsList.slice(0, 4).map((news) => (
            <div
              key={news.id}
              className="news-card"
              onClick={() => navigate(`/news/${news.id}`)}
            >
              <img
                src={
                  news.image?.startsWith("http")
                    ? news.image
                    : news.image && news.image.trim() !== ""
                      ? news.image
                      : "/images/default-image.jpg"
                }
                alt={news.title}
                className="news-img"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDM1MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgODBMMTYwIDY1SDE5MEwxNzUgODBaIiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjE0MCIgeT0iOTAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI0IiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjE1NSIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iNCIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K";
                }}
              />
              <div className="news-title">{news.title}</div>
              <div className="news-meta">
                {news.createdAt ? new Date(news.createdAt).toLocaleDateString('vi-VN') : 'N/A'} | {news.author || 'Ẩn danh'}
              </div>
              <div className="news-summary">{news.summary}</div>
            </div>
          ))}
        </div>
        
        {newsList.length > 4 && (
          <button className="btn-more-news" onClick={() => navigate("/news")}>
            Xem tất cả tin tức
          </button>
        )}
      </section>
    </>
  );
};

// CSS styles - giữ nguyên cấu trúc cũ nhưng cải thiện một chút
const newsStyles = `
  .news-section {
    max-width: 1380px;
    margin: -5px auto 0 auto;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 2px 12px #0001;
    padding: 32px 32px 42px 32px;
    position: relative;
  }
  
  .news-section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 32px;
    letter-spacing: -1px;
  }
  
  .news-row {
    display: flex;
    gap: 28px;
    justify-content: center;
  }
  
  .news-card {
    flex: 1 1 310px;
    max-width: 350px;
    min-width: 270px;
    background: #fafbfc;
    border-radius: 12px;
    box-shadow: 0 1px 4px #0001;
    padding: 18px;
    display: flex;
    flex-direction: column;
    transition: box-shadow .2s, transform .2s;
    cursor: pointer;
  }
  
  .news-card:hover {
    box-shadow: 0 4px 18px #0002;
    transform: translateY(-2px) scale(1.02);
  }
  
  .news-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 10px;
    background: #f0f0f0;
    transition: transform 0.3s ease;
  }
  
  .news-card:hover .news-img {
    transform: scale(1.05);
  }
  
  .news-title {
    font-size: 1.15rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }
  
  .news-meta {
    color: #718096;
    font-size: 0.96rem;
    margin-bottom: 7px;
  }
  
  .news-summary {
    color: #444;
    margin-bottom: 8px;
    min-height: 40px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }
  
  .btn-more-news {
    display: block;
    margin: 36px auto 0 auto;
    padding: 12px 38px;
    background: linear-gradient(135deg, #3182ce, #1e4d8b);
    color: #fff;
    border: none;
    border-radius: 25px;
    font-weight: 700;
    font-size: 1.12rem;
    box-shadow: 0 4px 15px rgba(49, 130, 206, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .btn-more-news:hover {
    background: linear-gradient(135deg, #1e4d8b, #1a365d);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
  }
  
  /* Loading state */
  .loading-container {
    text-align: center;
    padding: 60px 20px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f1f1f1;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Error state */
  .error-container {
    text-align: center;
    padding: 60px 20px;
  }
  
  .error-icon {
    font-size: 3rem;
    color: #f56565;
    margin-bottom: 20px;
  }
  
  .error-container h4 {
    color: #2d3748;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }
  
  .error-container p {
    color: #718096;
    margin-bottom: 20px;
  }
  
  .retry-btn {
    background: #3182ce;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .retry-btn:hover {
    background: #1e4d8b;
  }
  
  .retry-btn i {
    margin-right: 8px;
  }
  
  /* Empty state */
  .empty-container {
    text-align: center;
    padding: 60px 20px;
  }
  
  .empty-icon {
    font-size: 3rem;
    color: #cbd5e0;
    margin-bottom: 20px;
  }
  
  .empty-container h4 {
    color: #2d3748;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }
  
  .empty-container p {
    color: #718096;
  }
  
  /* Responsive */
  @media (max-width:900px) {
    .news-section { 
      padding: 18px 3vw 32px 3vw;
    }
    .news-row {
      flex-direction: column; 
      gap: 18px;
    }
    .news-section-title {
      font-size: 1.6rem;
    }
  }
  
  @media (max-width:600px) {
    .news-section { 
      padding: 6px 2vw 16px 2vw;
    }
    .news-img {
      height: 140px;
    }
    .news-title {
      font-size: 1.1rem;
    }
  }
`;

export default NewsList;