import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getNewsById } from '../api/NewsAPI';
import { NewsModel } from '../models/NewsModel';

const NewsDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [news, setNews] = useState<NewsModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        fetchNewsDetail();
    }, [id]);

    // Reading progress tracker
    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setReadingProgress(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchNewsDetail = async () => {
        if (!id) {
            setError("ID tin tức không hợp lệ");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const newsData = await getNewsById(id);
            
            if (newsData) {
                setNews(newsData);
                // Update page title
                document.title = `${newsData.title} | Tin tức`;
            } else {
                throw new Error("Dữ liệu tin tức không hợp lệ");
            }

        } catch (err: any) {
            console.error("Error loading news detail:", err);
            setError(err.message || "Có lỗi xảy ra khi tải chi tiết tin tức");
            setNews(null);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share && news) {
            try {
                await navigator.share({
                    title: news.title,
                    text: news.summary,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled sharing
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Đã copy link bài viết!');
            } catch (err) {
                console.error('Could not copy text: ', err);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Loading state
    if (loading) {
        return (
            <>
                <style>{newsDetailStyles}</style>
                <div className="blog-detail-wrapper">
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Đang tải bài viết...</p>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error || !news) {
        return (
            <>
                <style>{newsDetailStyles}</style>
                <div className="blog-detail-wrapper">
                    <Link to="/" className="blog-back-link">
                        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none">
                            <path d="M12 16l-4-4 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Quay lại danh sách
                    </Link>
                    <div className="error-section">
                        <div className="error-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="error-title">Không thể tải bài viết</h3>
                        <p className="error-message">{error || "Bài viết không tồn tại"}</p>
                        <div className="error-actions">
                            <button className="error-btn retry" onClick={fetchNewsDetail}>
                                <i className="fas fa-refresh"></i>
                                <span>Thử lại</span>
                            </button>
                            <button className="error-btn secondary" onClick={() => navigate('/news')}>
                                <i className="fas fa-list"></i>
                                <span>Danh sách tin</span>
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{newsDetailStyles}</style>
            
            {/* Reading Progress Bar */}
            <div className="reading-progress">
                <div 
                    className="reading-progress-bar" 
                    style={{ width: `${readingProgress}%` }}
                ></div>
            </div>

            <div className="blog-detail-wrapper">
                {/* Header with Navigation */}
                <div className="blog-header">
                    <div className="blog-nav">
                        <Link to="/" className="blog-back-link">
                            <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none">
                                <path d="M12 16l-4-4 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Quay lại danh sách
                        </Link>
                        
                        <div className="blog-actions">
                            <button className="action-btn" onClick={handleShare} title="Chia sẻ">
                                <i className="fas fa-share-alt"></i>
                            </button>
                            <button className="action-btn" onClick={handlePrint} title="In bài viết">
                                <i className="fas fa-print"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Image */}
                <div className="blog-img-container">
                    <img
                        src={
                            news.image?.startsWith("http")
                                ? news.image
                                : news.image && news.image.trim() !== ""
                                    ? news.image
                                    : "/images/default-image.jpg"
                        }
                        alt={news.title}
                        className="blog-img-main"
                        onError={e => {
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIwMCIgcj0iNjAiIGZpbGw9IiNEREREREQiLz4KPHN2Zz4K";
                        }}
                    />
                    <div className="blog-img-overlay">
                        <div className="news-category">
                            <i className="fas fa-newspaper"></i>
                            <span>Tin tức</span>
                        </div>
                    </div>
                </div>
                
                {/* Content Body */}
                <div className="blog-content-body">
                    {/* Article Meta */}
                    <div className="blog-meta-section">
                        <div className="blog-meta-info">
                            <div className="meta-item">
                                <i className="fas fa-calendar-alt"></i>
                                <span>
                                    {news.createdAt 
                                        ? new Date(news.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-user"></i>
                                <span>{news.author || 'Admin'}</span>
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-clock"></i>
                                <span>5 phút đọc</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="blog-title">{news.title}</h1>
                    
                    {/* Summary */}
                    {news.summary && (
                        <div className="blog-summary">{news.summary}</div>
                    )}
                    
                    {/* Content */}
                    <div className="blog-content-main">
                        <div 
                            dangerouslySetInnerHTML={{ 
                                __html: news.content || `<p>${news.summary}</p>` 
                            }} 
                        />
                    </div>

                    {/* Tags */}
                    <div className="blog-tags">
                        <span className="tag">
                            <i className="fas fa-tag"></i>
                            Tin tức
                        </span>
                        <span className="tag">
                            <i className="fas fa-tag"></i>
                            Cập nhật
                        </span>
                    </div>

                    {/* Social Share */}
                    <div className="social-share">
                        <h4 className="share-title">Chia sẻ bài viết này</h4>
                        <div className="share-buttons">
                            <button 
                                className="share-btn facebook"
                                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                            >
                                <i className="fab fa-facebook-f"></i>
                                <span>Facebook</span>
                            </button>
                            <button 
                                className="share-btn twitter"
                                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title)}`, '_blank')}
                            >
                                <i className="fab fa-twitter"></i>
                                <span>Twitter</span>
                            </button>
                            <button className="share-btn copy" onClick={handleShare}>
                                <i className="fas fa-link"></i>
                                <span>Copy Link</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="blog-footer">
                    <div className="footer-actions">
                        <button 
                            className="footer-btn secondary"
                            onClick={() => navigate('/news')}
                        >
                            <i className="fas fa-list"></i>
                            <span>Xem tất cả tin tức</span>
                        </button>
                        <button 
                            className="footer-btn primary"
                            onClick={() => navigate('/')}
                        >
                            <i className="fas fa-home"></i>
                            <span>Về trang chủ</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Scroll to Top */}
            <button 
                className="scroll-top-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ opacity: readingProgress > 20 ? 1 : 0 }}
            >
                <i className="fas fa-arrow-up"></i>
            </button>
        </>
    );
};

const newsDetailStyles = `
  /* Reading Progress Bar */
  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(0,0,0,0.1);
    z-index: 1000;
  }
  
  .reading-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    transition: width 0.3s ease;
  }

  .blog-detail-wrapper {
    max-width: 850px;
    margin: 20px auto 40px auto;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 36px #e4e6ef60, 0 1.5px 6px #a0aec020;
    overflow: hidden;
  }
  
  /* Header */
  .blog-header {
    padding: 20px 32px;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .blog-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .blog-back-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: color .18s;
  }
  
  .blog-back-link:hover { 
    color: #1d4ed8; 
    text-decoration: underline; 
  }
  
  .blog-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: #f8fafc;
    color: #64748b;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-btn:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
  }
  
  /* Image Container */
  .blog-img-container {
    position: relative;
    height: 400px;
    overflow: hidden;
  }
  
  .blog-img-main {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .blog-img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%);
    display: flex;
    align-items: flex-end;
    padding: 24px 32px;
  }
  
  .news-category {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(59, 130, 246, 0.9);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }
  
  /* Content Body */
  .blog-content-body {
    padding: 32px 44px 40px 44px;
  }
  
  .blog-meta-section {
    margin-bottom: 24px;
  }
  
  .blog-meta-info {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 0.95rem;
    color: #64748b;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  
  .meta-item i {
    color: #3b82f6;
    width: 16px;
    text-align: center;
  }
  
  .blog-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #11192f;
    margin: 0 0 20px 0;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  
  .blog-summary {
    background: linear-gradient(135deg, #f1f6fd, #e0f2fe);
    border-left: 5px solid #3b82f6;
    padding: 20px 25px;
    border-radius: 12px;
    font-size: 1.15rem;
    color: #1e40af;
    font-style: italic;
    margin-bottom: 32px;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .blog-summary::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  
  .blog-summary:hover::before {
    transform: translateX(100%);
  }
  
  .blog-content-main {
    color: #374151;
    font-size: 1.15rem;
    line-height: 1.8;
    letter-spacing: 0.3px;
    margin-bottom: 40px;
  }
  
  .blog-content-main h1, 
  .blog-content-main h2, 
  .blog-content-main h3 {
    color: #1f2937;
    margin: 2rem 0 1rem 0;
    font-weight: 700;
  }
  
  .blog-content-main h1 { font-size: 2rem; }
  .blog-content-main h2 { font-size: 1.5rem; }
  .blog-content-main h3 { font-size: 1.25rem; }
  
  .blog-content-main p {
    margin-bottom: 1.5rem;
  }
  
  .blog-content-main img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 2rem 0;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  .blog-content-main blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0 12px 12px 0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  }
  
  .blog-content-main ul, 
  .blog-content-main ol {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }
  
  .blog-content-main li {
    margin-bottom: 0.5rem;
  }
  
  /* Tags */
  .blog-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }
  
  .tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    color: #374151;
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .tag:hover {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .tag i {
    font-size: 0.75rem;
  }
  
  /* Social Share */
  .social-share {
    border-top: 1px solid #e5e7eb;
    padding-top: 32px;
    margin-bottom: 32px;
  }
  
  .share-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 20px 0;
  }
  
  .share-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .share-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    font-size: 0.95rem;
  }
  
  .share-btn.facebook {
    background: linear-gradient(135deg, #1877f2, #0d5dc7);
    color: white;
  }
  
  .share-btn.twitter {
    background: linear-gradient(135deg, #1da1f2, #0c85d0);
    color: white;
  }
  
  .share-btn.copy {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
  }
  
  .share-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  /* Footer */
  .blog-footer {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    padding: 32px 44px;
    border-top: 1px solid #e5e7eb;
  }
  
  .footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  
  .footer-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  
  .footer-btn.primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  
  .footer-btn.secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .footer-btn:hover {
    transform: translateY(-3px);
  }
  
  .footer-btn.primary:hover {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  .footer-btn.secondary:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  /* Floating Scroll to Top */
  .scroll-top-btn {
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
  
  .scroll-top-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
  }
  
  /* Loading State */
  .loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f1f5f9;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 24px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-text {
    color: #64748b;
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  /* Error State */
  .error-section {
    text-align: center;
    padding: 80px 20px;
  }
  
  .error-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .error-icon i {
    font-size: 32px;
    color: white;
  }
  
  .error-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
  }
  
  .error-message {
    color: #6b7280;
    font-size: 1.1rem;
    margin: 0 0 32px 0;
    line-height: 1.6;
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
  
  .error-btn.secondary {
    background: #f9fafb;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .error-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  /* Responsive Design */
  @media (max-width: 900px) {
    .blog-detail-wrapper {
      max-width: 99vw; 
      border-radius: 16px;
      margin: 10px auto 20px;
    }
    
    .blog-header {
      padding: 16px 20px;
    }
    
    .blog-content-body {
      padding: 24px 20px;
    }
    
    .blog-footer {
      padding: 24px 20px;
    }
    
    .blog-img-container {
      height: 250px;
    }
    
    .blog-title {
      font-size: 1.8rem;
    }
    
    .footer-actions {
      flex-direction: column;
      gap: 12px;
    }
    
    .footer-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  @media (max-width: 600px) {
    .blog-content-body {
      padding: 20px 16px;
    }
    
    .blog-footer {
      padding: 20px 16px;
    }
    
    .blog-header {
      padding: 12px 16px;
    }
    
    .blog-img-container {
      height: 200px;
    }
    
    .blog-title {
      font-size: 1.5rem;
    }
    
    .blog-content-main {
      font-size: 1.05rem;
    }
    
    .blog-meta-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .share-buttons {
      flex-direction: column;
      gap: 8px;
    }
    
    .share-btn {
      width: 100%;
      justify-content: center;
    }
    
    .scroll-top-btn {
      width: 48px;
      height: 48px;
      bottom: 20px;
      right: 20px;
      font-size: 1rem;
    }
    
    .action-btn {
      width: 36px;
      height: 36px;
    }
  }
  
  @media (max-width: 480px) {
    .blog-nav {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .blog-actions {
      align-self: flex-end;
    }
    
    .blog-summary {
      font-size: 1.05rem;
      padding: 16px 20px;
    }
    
    .error-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .error-btn {
      width: 200px;
      justify-content: center;
    }
  }
  
  /* Print Styles */
  @media print {
    .reading-progress,
    .blog-header,
    .blog-actions,
    .action-btn,
    .social-share,
    .blog-footer,
    .scroll-top-btn {
      display: none !important;
    }
    
    .blog-detail-wrapper {
      box-shadow: none;
      margin: 0;
      max-width: 100%;
    }
    
    .blog-content-body {
      padding: 20px;
    }
    
    .blog-title {
      color: #000;
      font-size: 2rem;
    }
    
    .blog-content-main {
      color: #000;
      font-size: 12pt;
      line-height: 1.6;
    }
  }
`;

export default NewsDetail;