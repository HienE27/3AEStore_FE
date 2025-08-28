import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCustomers, deleteCustomer, Customer } from "../../api/UserAPI";
import {
  Table,
  Badge,
  Pagination,
  InputGroup,
  FormControl,
  Spinner,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";

import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";


//import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const UserPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers(page, pageSize, search);

      console.log("API Response:", data); // Debug log

      const customers = data.customers || [];
      setCustomers(customers);

      const totalElements = data.pageMetadata?.totalElements ?? 0;
      setTotalPages(Math.ceil(totalElements / pageSize));
    } catch (err) {
      setError("Không thể tải danh sách khách hàng");
      setCustomers([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, pageSize, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;

    try {
      setLoading(true);
      await deleteCustomer(id);
      alert("Xóa khách hàng thành công");
      await loadCustomers();
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 409) {
          alert("Xóa thất bại: User đang có liên kết hoặc không được phép xóa.");
        } else {
          alert("Xóa thất bại: " + (error.response.data.message || error.response.data));
        }
      } else {
        alert("Xóa thất bại do lỗi mạng hoặc server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    navigate(`/management/user/view/${id}`);
  };

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
    <Card className="shadow rounded-4 border-0">
      <Card.Header style={{ background: "#fff", borderBottom: "1px solid #e9ecef" }}>
        <Row className="align-items-center">
          <Col xs={12} md={6}>
            <h4 className="mb-0 fw-bold" style={{ letterSpacing: 1 }}>Danh sách người dùng</h4>
          </Col>
          <Col
            xs={12}
            md={6}
            className="mt-3 mt-md-0 d-flex justify-content-end gap-2"
          >
            <InputGroup style={{ maxWidth: 320 }}>
              <FormControl
                placeholder="Tìm kiếm người dùng..."
                value={search}
                onChange={handleSearchChange}
                disabled={loading}
                aria-label="Search users"
                style={{ borderRadius: 20, background: "#f5f6fa" }}
              />
            </InputGroup>
            <Button
              variant="success"
              className="d-flex align-items-center gap-2"
              style={{ borderRadius: 20, fontWeight: 500 }}
              onClick={() => navigate("/management/user/add")}
            >
              <FaPlus /> Thêm mới
            </Button>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body className="p-0">
        {error && <div className="alert alert-danger m-3">{error}</div>}

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
          }}
        >
          <thead className="table-light">
            <tr>
              <th style={{ width: "5%" }}>STT</th>
              <th style={{ width: "25%" }}>Họ tên</th>
              <th style={{ width: "25%" }}>Email</th>
              <th style={{ width: "15%" }}>Vai trò</th>
              <th style={{ width: "15%" }}>Trạng thái</th>
              <th style={{ width: "15%" }} className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <Spinner animation="border" role="status" />
                  <span className="ms-2">Đang tải...</span>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  Không có khách hàng.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={c.id} style={{ verticalAlign: "middle" }}>
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td className="fw-semibold">
                    {c.first_name} {c.last_name}
                  </td>
                  <td>{c.email}</td>
                  <td>
                    <Badge bg={c.role === "Admin" ? "primary" : "secondary"} pill>
                      {c.role || "User"}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={c.active ? "success" : "secondary"} pill>
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
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
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleView(c.id)}
                        title="Xem"
                        style={{ borderRadius: 12 }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => navigate(`/management/user/edit/${c.id}`)}
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
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>

      <Card.Footer className="d-flex justify-content-center py-3 bg-white border-0">
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
      </Card.Footer>
    </Card>
  </div>
);
}

export default UserPage;
