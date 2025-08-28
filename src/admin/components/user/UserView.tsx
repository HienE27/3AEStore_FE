import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomerById, Customer } from "../../../api/UserAPI";
import { Container, Card, Button, Alert, Row, Col, Spinner, Badge } from "react-bootstrap";
import { FaArrowLeft, FaUser, FaEdit } from "react-icons/fa";

const UserView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCustomerById(id)
      .then(data => setCustomer(data))
      .catch(() => setError("Không tải được dữ liệu người dùng"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = () => {
    navigate(`/management/user/edit/${id}`);
  };

  const handleBack = () => {
    navigate("/management/user");
  };

  const mapGenderDisplay = (gender: string | undefined): string => {
    if (!gender) return "Không xác định";
    switch (gender.toUpperCase()) {
      case "M": return "Nam";
      case "F": return "Nữ";
      default: return "Khác";
    }
  };

  if (loading) {
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

  if (error) {
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
              <Alert variant="danger">{error}</Alert>
              <Button variant="outline-secondary" onClick={handleBack}>
                <FaArrowLeft className="me-1" />
                Quay lại
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!customer) {
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
              <Alert variant="warning">Không tìm thấy người dùng.</Alert>
              <Button variant="outline-secondary" onClick={handleBack}>
                <FaArrowLeft className="me-1" />
                Quay lại
              </Button>
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
          <Col md={8} lg={6}>
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="fw-bold text-primary mb-2">
                <FaUser className="me-2" />
                Chi tiết khách hàng
              </h3>
              <p className="text-muted">Thông tin người dùng #{id}</p>
            </div>

            {/* User Info Card */}
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                {/* User Info */}
                <div className="mb-4">
                  <Row className="mb-3">
                    <Col sm={4}><strong>Họ và tên:</strong></Col>
                    <Col sm={8}>{customer.first_name} {customer.last_name}</Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}><strong>Email:</strong></Col>
                    <Col sm={8}>{customer.email}</Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}><strong>Tên đăng nhập:</strong></Col>
                    <Col sm={8}>{customer.user_name}</Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}><strong>Giới tính:</strong></Col>
                    <Col sm={8}>{mapGenderDisplay(customer.gender)}</Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}><strong>Vai trò:</strong></Col>
                    <Col sm={8}>
                      <Badge bg={customer.role === "Admin" ? "warning" : "info"}>
                        {customer.role === "Admin" ? "Quản trị viên" : "Người dùng"}
                      </Badge>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}><strong>Trạng thái:</strong></Col>
                    <Col sm={8}>
                      <Badge bg={customer.active ? "success" : "danger"}>
                        {customer.active ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </Col>
                  </Row>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3">
                  <Button
                    variant="outline-secondary"
                    onClick={handleBack}
                    className="flex-fill"
                  >
                    <FaArrowLeft className="me-1" />
                    Quay lại
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleEdit}
                    className="flex-fill"
                  >
                    <FaEdit className="me-2" />
                    Chỉnh sửa
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserView;