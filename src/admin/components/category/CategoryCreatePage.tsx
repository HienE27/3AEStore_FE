import React, { useState } from "react";
import { getIdUserByToken } from "../../../utils/JwtService";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaTags, FaSave } from "react-icons/fa";

const CategoryCreatePage: React.FC = () => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "danger">("success");
  const navigate = useNavigate();
  const staffId = getIdUserByToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setMessage("Tên danh mục không được để trống");
      setMessageType("danger");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:8080/api/categories?staffId=${staffId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: categoryName }),
      });

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      setMessage("Thêm danh mục thành công!");
      setMessageType("success");
      setCategoryName("");
      
      setTimeout(() => {
        navigate("/management/category");
      }, 1500);

    } catch (error: any) {
      setMessage(`Thêm danh mục thất bại: ${error.message}`);
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/management/category");
  };

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
                <FaTags className="me-2" />
                Thêm danh mục mới
              </h3>
              <p className="text-muted">Tạo danh mục sản phẩm cho cửa hàng</p>
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

                {/* Message */}
                {message && (
                  <Alert variant={messageType} className="mb-4">
                    {message}
                  </Alert>
                )}

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Tên danh mục <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên danh mục..."
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      disabled={loading}
                      size="lg"
                    />
                  </Form.Group>

                  {/* Buttons */}
                  <div className="d-flex gap-3">
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-fill"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || !categoryName.trim()}
                      className="flex-fill"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Lưu danh mục
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CategoryCreatePage;