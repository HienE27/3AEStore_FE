import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllNews, deleteNews } from "../../../api/NewsAPI";
import { NewsModel } from "../../../models/NewsModel";

const NewsList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newsList, setNewsList] = useState<NewsModel[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsModel[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 7;

  // Fetch data khi component mount hoặc location thay đổi
  useEffect(() => {
    loadNews();
  }, [location.pathname]);

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAllNews();
      
      // Đảm bảo response là array
      if (!Array.isArray(response)) {
        setNewsList([]);
        setFilteredNews([]);
        return;
      }
      
      // Sắp xếp theo ID giảm dần (mới nhất trước)
      const sortedNews = response.sort((a: NewsModel, b: NewsModel) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idB - idA;
      });
      
      setNewsList(sortedNews);
      setFilteredNews(sortedNews);
      
      // Reset search và pagination khi reload data
      setSearchKeyword("");
      setCurrentPage(1);
      
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách tin tức. Vui lòng thử lại sau.");
      setNewsList([]);
      setFilteredNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin này?")) return;
    
    try {
      await deleteNews(id);
      
      // Cập nhật state
      const updatedList = newsList.filter(item => item.id !== id);
      setNewsList(updatedList);
      
      // Lọc lại theo keyword hiện tại
      const filtered = updatedList.filter(item =>
        item.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredNews(filtered);
      
      alert("✅ Xóa tin tức thành công!");
    } catch (err) {
      alert("❌ Có lỗi xảy ra khi xóa tin tức!");
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    
    const filtered = newsList.filter(item =>
      item.title.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredNews(filtered);
  };

  // Manual refresh function
  const handleRefresh = () => {
    loadNews();
  };

  // Tính toán pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  if (error) {
    return (
      <div className="main-content" style={{ 
        marginLeft: '250px',
        marginTop: '80px', 
        padding: "24px"
      }}>
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <div className="mt-3">
            <button 
              className="btn btn-outline-danger btn-sm me-2"
              onClick={loadNews}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      marginLeft: 'calc(var(--sidebar-width, 250px) + 10px)',
      padding: "28px", 
      minHeight: "100vh",
      transition: 'margin-left 0.3s ease'
    }}>
      <div className="container-fluid">
        <div className="card shadow rounded-4 border-0 mb-4" style={{ background: "#fff" }}>
          {/* Header */}
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center rounded-top-4 p-4">
            <h4 className="mb-0 fw-bold text-primary">
              <i className="fas fa-newspaper me-2"></i>
              Quản lý tin tức
            </h4>
            <div className="d-flex gap-3 align-items-center">
              <div className="input-group" style={{ width: "350px" }}>
                <span className="input-group-text bg-light border-0">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchKeyword}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <button
                className="btn btn-outline-primary me-2"
                onClick={handleRefresh}
                title="Làm mới dữ liệu"
                disabled={isLoading}
              >
                <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => navigate("/management/news/create")}
                title="Thêm tin tức mới"
              >
                <i className="fas fa-plus"></i>
                Thêm mới
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4" style={{ width: "5%" }}>#</th>
                      <th style={{ width: "35%" }}>Tiêu đề</th>
                      <th style={{ width: "15%" }}>Tác giả</th>
                      <th style={{ width: "15%" }}>Ngày đăng</th>
                      <th style={{ width: "15%" }}>Ảnh</th>
                      <th style={{ width: "15%" }} className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNews.length > 0 ? (
                      paginatedNews.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 text-muted">{startIndex + index + 1}</td>
                          <td>
                            <div className="text-truncate fw-medium" style={{maxWidth: "300px"}} title={item.title}>
                              {item.title}
                            </div>
                            <small className="text-muted">ID: {item.id}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">{item.author}</span>
                          </td>
                          <td className="text-muted">
                            {item.createdAt 
                              ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                              : "N/A"
                            }
                          </td>
                          <td>
                            {item.image && item.image.trim() !== "" ? (
                              <img
                                src={item.image}
                                alt="Ảnh tin tức"
                                className="rounded-3 border"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover"
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjFGMUYxIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHN2Zz4K";
                                }}
                              />
                            ) : (
                              <div 
                                className="rounded-3 border d-flex align-items-center justify-content-center"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  backgroundColor: "#f1f1f1",
                                  color: "#999"
                                }}
                              >
                                <i className="fas fa-image"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Chỉnh sửa"
                                onClick={() => navigate(`/management/news/edit/${item.id}`)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success"
                                title="Xem chi tiết"
                                onClick={() => navigate(`/management/news/show/${item.id}`)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Xóa"
                                onClick={() => handleDelete(item.id!)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div className="text-muted">
                            <i className="fas fa-newspaper fs-1 mb-3 d-block text-secondary"></i>
                            <h5 className="text-secondary">
                              {searchKeyword ? 
                                `Không tìm thấy tin tức nào với từ khóa "${searchKeyword}"` : 
                                "Chưa có tin tức nào"
                              }
                            </h5>
                            <p className="mb-3">
                              {searchKeyword ? 
                                "Hãy thử tìm kiếm với từ khóa khác" : 
                                "Nhấn nút \"Thêm mới\" để tạo tin tức đầu tiên"
                              }
                            </p>
                            {!searchKeyword && (
                              <button
                                className="btn btn-primary"
                                onClick={() => navigate("/management/news/create")}
                              >
                                <i className="fas fa-plus me-2"></i>
                                Thêm tin tức
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="card-footer d-flex justify-content-center py-3 bg-light border-0">
              <nav aria-label="Phân trang">
                <ul className="pagination pagination-sm mb-0">
                  {/* Previous */}
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}

                  {/* Next */}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsList;