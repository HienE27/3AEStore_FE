import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Spinner,
  Row,
  Col,
  Alert,
  Pagination,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

interface Category {
  id: string;
  categoryName: string;
}

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Lấy danh sách category
  const fetchCategories = () => {
    setLoading(true);
    interface CategoriesResponse {
      _embedded?: {
        categories: Category[];
      };
    }
    axios
      .get<CategoriesResponse>("http://localhost:8080/categories")
      .then((res) => setCategories(res.data._embedded?.categories || []))
      .catch((err) => {
        console.error("Lỗi lấy danh sách:", err);
        setMessage("Failed to load categories.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Hàm xử lý xóa
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn xóa không?")) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMessage("Xóa danh mục thành công.");
    } catch (error: any) {
      console.error("Lỗi xóa:", error);
      setMessage("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  // Phân trang
  const totalPages = Math.ceil(categories.length / pageSize);
  const pagedCategories = categories.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div
      className="content-wrapper"
      style={{
        // marginLeft: 260,
        // padding: 24,
        // minHeight: "calc(100vh - 70px)",
        // background: "linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)",
        // overflowX: "auto",

      marginLeft: 'calc(var(--sidebar-width, 250px) + 10px)', // Tự động điều chỉnh
      padding: "24px", 
      minHeight: "100vh",
      transition: 'margin-left 0.3s ease' // Smooth transition
      }}
    >
      <br />
      <Card className="shadow rounded-4 border-0 mx-auto" style={{ maxWidth: 1300 }}>
        <Card.Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e9ecef",
            padding: "18px 24px",
          }}
        >
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <h4 className="mb-0 fw-bold" style={{ letterSpacing: 1 }}>
                Danh sách danh mục
              </h4>
            </Col>
            <Col
              xs={12}
              md={6}
              className="mt-3 mt-md-0 d-flex justify-content-end gap-2"
            >
              <Button
                variant="success"
                className="d-flex align-items-center gap-2"
                style={{ borderRadius: 20, fontWeight: 500 }}
                onClick={() => navigate("/management/add-category")}
              >
                <FaPlus /> Thêm mới
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          {message && (
            <Alert
              variant={message.includes("thành công") ? "success" : "info"}
              className="m-3"
              onClose={() => setMessage("")}
              dismissible
            >
              {message}
            </Alert>
          )}
          <div style={{ overflowX: "auto" }}>
            <Table
              striped
              hover
              responsive
              className="mb-0"
              style={{
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                fontSize: 15,
                minWidth: 900,
              }}
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: "35%" }}>ID</th>
                  <th style={{ width: "50%" }}>Tên danh mục</th>
                  <th style={{ width: "15%" }} className="text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-5">
                      <Spinner animation="border" role="status" />
                      <span className="ms-2">Đang tải...</span>
                    </td>
                  </tr>
                ) : pagedCategories.length > 0 ? (
                  pagedCategories.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontSize: 13, wordBreak: "break-all" }}>{c.id}</td>
                      <td className="fw-semibold">{c.categoryName}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => navigate(`/management/edit-category/${c.id}`)}
                            title="Sửa"
                            style={{ borderRadius: 12 }}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            title="Xóa"
                            style={{ borderRadius: 12 }}
                            disabled={loading}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      Không có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          <div className="d-flex justify-content-center py-3 bg-white border-0">
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
                  style={{ borderRadius: 8, minWidth: 36, textAlign: "center" }}
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default CategoryPage;