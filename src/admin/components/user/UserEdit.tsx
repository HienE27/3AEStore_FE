import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCustomerById, updateCustomer, createCustomer, Customer } from "../../../api/UserAPI";
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaUser, FaSave, FaUserPlus } from "react-icons/fa";

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Customer> & { password_hash?: string }>({
    first_name: "",
    last_name: "",
    email: "",
    user_name: "",
    active: true,
    gender: "M",
    role: "User",
    password_hash: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoadingData(true);
      fetchCustomerById(id)
        .then((data) => {
          setForm({
            ...data,
            gender: mapGenderToCode(data.gender),
            password_hash: "",
          });
        })
        .catch(() => setError("Không tải được thông tin khách hàng"))
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  const mapGenderToCode = (gender: string | undefined): string => {
    if (!gender) return "O";
    const g = gender.toLowerCase();
    if (g === "nam" || g === "m" || g === "f") return gender.charAt(0).toUpperCase();
    if (g === "nữ" || g === "nu") return "F";
    if (g === "khác" || g === "other") return "O";
    return "O";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" && e.target instanceof HTMLInputElement
          ? e.target.checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!id && (!form.password_hash || form.password_hash.trim() === "")) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    const payload = {
      ...form,
      gender: mapGenderToCode(form.gender),
    };

    setLoading(true);
    try {
      if (id) {
        await updateCustomer(id, payload);
        setSuccess("Cập nhật khách hàng thành công!");
      } else {
        await createCustomer(payload);
        setSuccess("Tạo khách hàng thành công!");
      }
      
      setTimeout(() => navigate("/management/user"), 1500);
    } catch (err: any) {
      console.error("Lỗi khi lưu khách hàng:", err.response?.data || err.message || err);
      setError("Lỗi khi lưu khách hàng: " + (err.response?.data?.message || err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/management/user");
  };

  if (loadingData) {
    return (
      <div
        style={{
          marginLeft: 'var(--sidebar-width, 0px)',
          padding: "40px 20px",
          minHeight: "100vh",
          background: "#f8f9fa",
          width: 'calc(100vw - var(--sidebar-width, 0px))'
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow-sm border-0">
                <Card.Body className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-3 text-muted">Đang tải dữ liệu...</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div
      style={{
        marginLeft: 'var(--sidebar-width, 0px)',
        padding: "40px 20px",
        minHeight: "100vh",
        background: "#f8f9fa",
        width: 'calc(100vw - var(--sidebar-width, 0px))'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="fw-bold text-primary mb-2">
                {id ? <FaUser className="me-2" /> : <FaUserPlus className="me-2" />}
                {id ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
              </h3>
              <p className="text-muted">
                {id ? `Cập nhật thông tin khách hàng #${id}` : "Tạo tài khoản khách hàng mới"}
              </p>
            </div>

            {/* Form Card */}
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                {/* Back Button */}
                <Button
                  variant="outline-secondary"
                  onClick={handleCancel}
                  className="mb-4"
                  size="sm"
                >
                  <FaArrowLeft className="me-1" />
                  Quay lại
                </Button>

                {/* Messages */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant="success" className="mb-4">
                    {success}
                  </Alert>
                )}

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Thông tin cá nhân */}
                    <Col md={6}>
                      <h5 className="text-primary mb-3 fw-bold">Thông tin cá nhân</h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Họ <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={form.first_name || ""}
                          onChange={handleChange}
                          placeholder="Nhập họ..."
                          disabled={loading}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Tên <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={form.last_name || ""}
                          onChange={handleChange}
                          placeholder="Nhập tên..."
                          disabled={loading}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email || ""}
                          onChange={handleChange}
                          placeholder="Nhập email..."
                          disabled={loading}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Giới tính <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="gender"
                          value={form.gender || "M"}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        >
                          <option value="M">Nam</option>
                          <option value="F">Nữ</option>
                          <option value="O">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Thông tin tài khoản */}
                    <Col md={6}>
                      <h5 className="text-primary mb-3 fw-bold">Thông tin tài khoản</h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Tên đăng nhập <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="user_name"
                          value={form.user_name || ""}
                          onChange={handleChange}
                          placeholder="Nhập tên đăng nhập..."
                          disabled={loading}
                          required
                        />
                      </Form.Group>

                      {!id && (
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Mật khẩu <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password_hash"
                            value={form.password_hash || ""}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu..."
                            disabled={loading}
                            required={!id}
                          />
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Vai trò <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="role"
                          value={form.role || "User"}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        >
                          <option value="User">Người dùng</option>
                          <option value="Admin">Quản trị viên</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Trạng thái tài khoản
                        </Form.Label>
                        <div className="d-flex align-items-center mt-2">
                          <Form.Check
                            type="switch"
                            id="active-switch"
                            name="active"
                            checked={form.active || false}
                            onChange={handleChange}
                            disabled={loading}
                            className="me-3"
                          />
                          <span className="fw-normal">
                            {form.active ? "Đã kích hoạt" : "Chưa kích hoạt"}
                          </span>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <hr className="my-4" />
                  <Row className="mt-4">
                    <Col md={6} className="mb-3">
                      <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-100 py-2"
                      >
                        Hủy bỏ
                      </Button>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                        className="w-100 py-2"
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            {id ? "Cập nhật" : "Tạo mới"}
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserEdit;