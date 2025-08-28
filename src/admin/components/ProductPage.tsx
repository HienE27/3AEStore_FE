import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Button, Spinner, Card, Pagination, Row, Col, Alert, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaFilter, FaSort } from 'react-icons/fa';

interface Product {
  id: string;
  productName: string;
  quantity?: number;
  buyingPrice: number;
  comparePrice?: number;
  salePrice: number;
  sku?: string;
  published?: boolean;
}

interface Gallery {
  id: string;
  image: string;
  isThumbnail: boolean;
}

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<(Product & { galleryImage?: string })[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<(Product & { galleryImage?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const pageSize = 10;

  useEffect(() => {
    const fetchProductsAndImages = async () => {
      try {
        const res = await axios.get("http://localhost:8080/products");
        const productList: Product[] = (res.data as { _embedded: { products: Product[] } })._embedded.products;

        const filteredProductList = productList;

        // Lấy gallery cho từng product
        const galleryPromises = filteredProductList.map(product =>
          axios
            .get<{ _embedded: { galleries: Gallery[] } }>(
              `http://localhost:8080/gallerys/search/findByProduct`,
              { params: { product: `/api/products/${product.id}` } }
            )
            .then(res => {
              const galleries = res.data._embedded?.galleries || [];
              const image =
                galleries.find(g => g.isThumbnail)?.image ||
                galleries[0]?.image ||
                "images/default-image.jpg";
              return { productId: product.id, image };
            })
            .catch(() => ({ productId: product.id, image: "images/default-image.jpg" }))
        );

        const galleryResults = await Promise.all(galleryPromises);

        // Ghép ảnh vào product
        const productsWithImages = filteredProductList.map(product => {
          const matchedGallery = galleryResults.find(g => g.productId === product.id);
          return {
            ...product,
            galleryImage: matchedGallery?.image || "images/default-image.jpg",
          };
        });

        setProducts(productsWithImages);
        setFilteredProducts(productsWithImages);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndImages();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.productName.toLowerCase().includes(term) ||
        (product.sku && product.sku.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (filterBy === 'sale') {
      filtered = filtered.filter(product => {
        const comparePrice = product.comparePrice ?? 0;
        const salePrice = product.salePrice ?? 0;
        return comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
      });
    } else if (filterBy === 'in-stock') {
      filtered = filtered.filter(product => (product.quantity ?? 0) > 0);
    } else if (filterBy === 'out-of-stock') {
      filtered = filtered.filter(product => (product.quantity ?? 0) === 0);
    } else if (filterBy === 'published') {
      filtered = filtered.filter(product => product.published === true);
    } else if (filterBy === 'unpublished') {
      filtered = filtered.filter(product => product.published === false);
    }

    // Sort logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'price':
          const aDisplayPrice = a.salePrice > 0 ? a.salePrice : (a.comparePrice ?? a.buyingPrice);
          const bDisplayPrice = b.salePrice > 0 ? b.salePrice : (b.comparePrice ?? b.buyingPrice);
          return aDisplayPrice - bDisplayPrice;
        case 'quantity':
          return (b.quantity ?? 0) - (a.quantity ?? 0);
        case 'profit':
          const aProfit = (a.salePrice || a.comparePrice || 0) - a.buyingPrice;
          const bProfit = (b.salePrice || b.comparePrice || 0) - b.buyingPrice;
          return bProfit - aProfit;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setPage(1);
  }, [products, searchTerm, filterBy, sortBy]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`);
      setProducts(prev => prev.filter(product => product.id !== id));
      
      setMessage("Xóa sản phẩm thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      const msg = error.response?.data?.message || error.message || "Xóa sản phẩm thất bại. Vui lòng thử lại.";
      setMessage(`Xóa sản phẩm thất bại: ${msg}`);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Calculate display price and discount
  const getDisplayInfo = (product: Product) => {
    const buyingPrice = product.buyingPrice ?? 0;
    const comparePrice = product.comparePrice ?? 0;
    const salePrice = product.salePrice ?? 0;
    
    const isOnSale = comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    const displayPrice = salePrice > 0 ? salePrice : (comparePrice > 0 ? comparePrice : buyingPrice);
    const discountPercent = isOnSale ? Math.round(((comparePrice - salePrice) / comparePrice) * 100) : 0;
    const profit = displayPrice - buyingPrice;
    const profitPercent = buyingPrice > 0 ? Math.round((profit / buyingPrice) * 100) : 0;

    return { displayPrice, discountPercent, profit, profitPercent, isOnSale };
  };

  // Get filter stats
  const getFilterStats = () => {
    const total = products.length;
    const onSale = products.filter(p => {
      const comparePrice = p.comparePrice ?? 0;
      const salePrice = p.salePrice ?? 0;
      return comparePrice > 0 && salePrice > 0 && salePrice < comparePrice;
    }).length;
    const inStock = products.filter(p => (p.quantity ?? 0) > 0).length;
    const outOfStock = products.filter(p => (p.quantity ?? 0) === 0).length;
    const published = products.filter(p => p.published === true).length;

    return { total, onSale, inStock, outOfStock, published };
  };

  const stats = getFilterStats();

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div
      style={{
        marginLeft: 'var(--sidebar-width, 0px)',
        padding: "20px", 
        minHeight: "100vh",
        transition: 'margin-left 0.3s ease',
        background: "#f8f9fa",
        width: 'calc(100vw - var(--sidebar-width, 0px))',
        overflow: 'auto'
      }}
    >
      {/* Header - Đơn giản hóa */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header 
          className="bg-primary text-white"
          style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
        >
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-1 fw-bold">📊 Quản lý sản phẩm</h4>
              <p className="mb-0 opacity-75">Tổng cộng {stats.total} sản phẩm</p>
            </Col>
            <Col xs="auto">
              <Button
                variant="light"
                className="fw-semibold"
                onClick={() => navigate('/management/add-product')}
              >
                <FaPlus className="me-2" /> Thêm mới
              </Button>
            </Col>
          </Row>
        </Card.Header>
        
        {/* Stats - Đơn giản */}
        <Card.Body className="py-3">
          <Row className="text-center">
            <Col xs={6} md={2}>
              <div className="fw-bold h5 text-primary mb-0">{stats.total}</div>
              <small className="text-muted">Tổng số</small>
            </Col>
            <Col xs={6} md={2}>
              <div className="fw-bold h5 text-warning mb-0">{stats.onSale}</div>
              <small className="text-muted">Đang sale</small>
            </Col>
            <Col xs={6} md={2}>
              <div className="fw-bold h5 text-success mb-0">{stats.inStock}</div>
              <small className="text-muted">Còn hàng</small>
            </Col>
            <Col xs={6} md={2}>
              <div className="fw-bold h5 text-danger mb-0">{stats.outOfStock}</div>
              <small className="text-muted">Hết hàng</small>
            </Col>
            <Col xs={6} md={2}>
              <div className="fw-bold h5 text-info mb-0">{stats.published}</div>
              <small className="text-muted">Đã xuất bản</small>
            </Col>
            <Col xs={6} md={2}>
              <div className="fw-bold h5 text-secondary mb-0">{stats.total - stats.published}</div>
              <small className="text-muted">Nháp</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Controls - Đơn giản */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="all">Tất cả ({stats.total})</option>
                <option value="sale">Đang sale ({stats.onSale})</option>
                <option value="in-stock">Còn hàng ({stats.inStock})</option>
                <option value="out-of-stock">Hết hàng ({stats.outOfStock})</option>
                <option value="published">Đã xuất bản ({stats.published})</option>
                <option value="unpublished">Nháp ({stats.total - stats.published})</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sắp xếp theo tên</option>
                <option value="price">Sắp xếp theo giá</option>
                <option value="quantity">Sắp xếp theo số lượng</option>
                <option value="profit">Sắp xếp theo lợi nhuận</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <div className="text-muted small text-center pt-2">
                Hiển thị: {filteredProducts.length} sản phẩm
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {message && (
        <Alert
          variant={message.includes("thành công") ? "success" : "danger"}
          className="mb-4"
          onClose={() => setMessage("")}
          dismissible
        >
          {message}
        </Alert>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <div style={{ overflowX: 'auto' }}>
          <Table striped hover responsive className="mb-0" style={{ minWidth: '900px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '5%' }}>STT</th>
                <th style={{ width: '10%' }}>Ảnh</th>
                <th style={{ width: '25%' }}>Tên sản phẩm</th>
                <th style={{ width: '10%' }}>Số lượng</th>
                <th style={{ width: '12%' }}>Giá nhập</th>
                <th style={{ width: '12%' }}>Giá bán</th>
                <th style={{ width: '10%' }}>Lợi nhuận</th>
                <th style={{ width: '8%' }}>Sale</th>
                <th style={{ width: '10%' }}>Trạng thái</th>
                <th style={{ width: '8%' }} className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-5">
                    <Spinner animation="border" role="status" />
                    <span className="ms-2">Đang tải...</span>
                  </td>
                </tr>
              ) : pagedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    {filteredProducts.length === 0 && products.length > 0 
                      ? "Không tìm thấy sản phẩm phù hợp."
                      : "Không có sản phẩm nào."
                    }
                  </td>
                </tr>
              ) : (
                pagedProducts.map((product, index) => {
                  const { displayPrice, discountPercent, profit, profitPercent, isOnSale } = getDisplayInfo(product);
                  
                  return (
                    <tr key={product.id}>
                      <td className="fw-semibold text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td>
                        <img
                          src={product.galleryImage}
                          alt={product.productName}
                          style={{ 
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover', 
                            borderRadius: 8,
                            border: '1px solid #dee2e6'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "images/default-image.jpg";
                          }}
                        />
                      </td>
                      <td>
                        <div className="fw-semibold">{product.productName}</div>
                        {product.sku && <small className="text-muted">SKU: {product.sku}</small>}
                      </td>
                      <td>
                        <Badge bg={(product.quantity ?? 0) > 0 ? "success" : "danger"}>
                          {product.quantity ?? 0}
                        </Badge>
                      </td>
                      <td className="fw-semibold">
                        {product.buyingPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td>
                        <div className="fw-semibold text-primary">
                          {displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </div>
                        {isOnSale && product.comparePrice && (
                          <small className="text-muted text-decoration-line-through">
                            {product.comparePrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className={`fw-semibold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                          {profit >= 0 ? '+' : ''}{profit.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </div>
                        <small className={profit >= 0 ? 'text-success' : 'text-danger'}>
                          ({profitPercent}%)
                        </small>
                      </td>
                      <td>
                        {isOnSale ? (
                          <Badge bg="warning">
                            -{discountPercent}%
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={product.published ? "success" : "secondary"}>
                          {product.published ? "Đã xuất bản" : "Nháp"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/management/edit-product/${product.id}`)}
                            title="Sửa"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => navigate(`/product/show/${product.id}`)}
                            title="Xem"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Xóa"
                            onClick={() => handleDelete(product.id)}
                            disabled={loading}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
        
        {/* Pagination - Bình thường */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center py-3 border-top">
            <Pagination>
              <Pagination.Prev
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={page >= totalPages || loading}
                onClick={() => setPage(page + 1)}
              />
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductPage;