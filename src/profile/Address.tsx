import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config/environment';
import { getIdUserByToken } from '../utils/JwtService';
import SidebarProfile from './SidebarProfile';


// Thêm CSS custom vào luôn file này (hoặc tách ra file .css nếu muốn)
const customStyle = `
.address-box {
  min-height: 220px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 14px rgba(44,62,80,0.06);
  padding: 24px 20px 16px 20px;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  border: 1.5px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 20px;
}
.address-box:hover {
  box-shadow: 0 6px 22px rgba(44,62,80,0.15);
  border-color: #3b82f6;
  transform: translateY(-2px) scale(1.02);
}
.address-box h6 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #345;
}
.address-box .badge {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
}
.address-box strong {
  color: #20232a;
  font-weight: 600;
}
.address-box .mt-2 button {
  min-width: 38px;
}
@media (max-width: 767px) {
  .address-box {
    min-height: 160px;
    padding: 15px 10px 10px 10px;
  }
}
`;

// CẬP NHẬT: Interface khớp với form checkout
interface CustomerAddress {
  id?: string;
  recipient_name: string;
  address_line1: string; // Địa chỉ cụ thể (số nhà, đường)
  ward: string; // Phường/xã - THÊM MỚI
  district: string; // Quận/huyện - THÊM MỚI
  address_line2?: string; // Ghi chú
  phone_number: string;
  dial_code: string;
  country: string;
  postal_code: string;
  city: string; // Tỉnh/thành phố
  isDefault?: boolean;
  createdAt?: string;
}

const Address: React.FC = () => {
  const customerId = getIdUserByToken() || '';
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // CẬP NHẬT: Form state với cấu trúc mới
  const [form, setForm] = useState<CustomerAddress>({
    recipient_name: '',
    address_line1: '', // Chỉ địa chỉ cụ thể
    ward: '', // Phường/xã riêng biệt
    district: '', // Quận/huyện riêng biệt
    address_line2: '', // Ghi chú
    phone_number: '',
    dial_code: '+84',
    country: 'Vietnam',
    postal_code: '00000',
    city: '' // Tỉnh/thành phố
  });

  // Inject CSS custom vào head (chỉ 1 lần)
  useEffect(() => {
    const styleId = 'address-page-custom-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = customStyle;
      document.head.appendChild(style);
    }
  }, []);

  // Validation functions
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateField = (field: string, value: string) => {
    const errors = { ...formErrors };
    switch (field) {
      case 'recipient_name':
        if (!value.trim()) {
          errors.recipient_name = 'Vui lòng nhập họ tên';
        } else if (value.trim().length < 2) {
          errors.recipient_name = 'Họ tên phải có ít nhất 2 ký tự';
        } else {
          delete errors.recipient_name;
        }
        break;
      case 'phone_number':
        if (!value.trim()) {
          errors.phone_number = 'Vui lòng nhập số điện thoại';
        } else if (!isValidPhoneNumber(value)) {
          errors.phone_number = 'Số điện thoại không hợp lệ';
        } else {
          delete errors.phone_number;
        }
        break;
      case 'address_line1':
        if (!value.trim()) {
          errors.address_line1 = 'Vui lòng nhập địa chỉ cụ thể';
        } else if (value.trim().length < 5) {
          errors.address_line1 = 'Địa chỉ quá ngắn';
        } else {
          delete errors.address_line1;
        }
        break;
      case 'ward':
        if (!value.trim()) {
          errors.ward = 'Vui lòng nhập phường/xã';
        } else {
          delete errors.ward;
        }
        break;
      case 'district':
        if (!value.trim()) {
          errors.district = 'Vui lòng nhập quận/huyện';
        } else {
          delete errors.district;
        }
        break;
      case 'city':
        if (!value.trim()) {
          errors.city = 'Vui lòng chọn tỉnh/thành phố';
        } else {
          delete errors.city;
        }
        break;
    }
    setFormErrors(errors);
  };

  // Load addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${config.API_BASE_URL}/api/customer-addresses/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAddresses(res.data || []);
      } catch (e) {
        setAddresses([]);
      }
      setLoading(false);
    };
    if (customerId) fetchAddresses();
  }, [customerId]);

  // Form handlers
  const openAddForm = () => {
    setEditingAddress(null);
    setForm({
      recipient_name: '',
      address_line1: '',
      ward: '',
      district: '',
      address_line2: '',
      phone_number: '',
      dial_code: '+84',
      country: 'Vietnam',
      postal_code: '00000',
      city: ''
    });
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setForm(addr);
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingAddress(null);
    setShowForm(false);
    setFormErrors({});
    setForm({
      recipient_name: '',
      address_line1: '',
      ward: '',
      district: '',
      address_line2: '',
      phone_number: '',
      dial_code: '+84',
      country: 'Vietnam',
      postal_code: '00000',
      city: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const isFormValid = () => {
    const { recipient_name, phone_number, address_line1, ward, district, city } = form;
    return recipient_name.trim() && phone_number.trim() && address_line1.trim() &&
      ward.trim() && district.trim() && city.trim() &&
      Object.keys(formErrors).length === 0;
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    validateField('recipient_name', form.recipient_name);
    validateField('phone_number', form.phone_number);
    validateField('address_line1', form.address_line1);
    validateField('ward', form.ward);
    validateField('district', form.district);
    validateField('city', form.city);

    if (!isFormValid()) {
      alert('Vui lòng điền đầy đủ và chính xác thông tin');
      return;
    }

    try {
      const data = { ...form, customerId };
      if (editingAddress && editingAddress.id) {
        await axios.put(`${config.API_BASE_URL}/api/customer-addresses/${editingAddress.id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${config.API_BASE_URL}/api/customer-addresses/save`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      // Reload addresses
      const res = await axios.get(`${config.API_BASE_URL}/api/customer-addresses/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(res.data || []);
      closeForm();

      // Show success message
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
      successAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; width: 300px;';
      successAlert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${editingAddress ? 'Cập nhật' : 'Thêm'} địa chỉ thành công!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(successAlert);
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 3000);

    } catch (error) {
      console.error('Error saving address:', error);
      alert('Không thể lưu địa chỉ. Vui lòng kiểm tra lại.');
    }
  };

  const deleteAddress = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await axios.delete(`${config.API_BASE_URL}/api/customer-addresses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (error) {
      alert('Không thể xóa địa chỉ.');
    }
  };

  const setDefault = async (id?: string) => {
    if (!id) return;
    try {
      await axios.put(`${config.API_BASE_URL}/api/customer-addresses/${id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Reload addresses to reflect changes
      const res = await axios.get(`${config.API_BASE_URL}/api/customer-addresses/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(res.data || []);

    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Không thể đặt địa chỉ mặc định.');
    }
  };

  return (
    <>
      {/* ========================= SECTION PAGETOP ========================= */}
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">My account</h2>
        </div>
      </section>
      {/* ========================= SECTION PAGETOP END ========================= */}

      {/* ========================= SECTION CONTENT ========================= */}
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
  <aside className="col-md-3">
    <SidebarProfile />
  </aside>

            {/* Main content */}
            <main className="col-md-9">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                  <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                  Quản lý địa chỉ
                </h4>
                <button className="btn btn-primary" onClick={openAddForm}>
                  <i className="fa fa-plus me-2"></i> Thêm địa chỉ mới
                </button>
              </div>

              {/* CẬP NHẬT: Address Form với cấu trúc khớp checkout */}
              {showForm && (
                <div className="card mb-4 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-edit me-2"></i>
                      {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </h5>
                  </div>
                  <form className="card-body" onSubmit={saveAddress}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Họ tên người nhận <span className="text-danger">*</span>
                        </label>
                        <input
                          name="recipient_name"
                          className={`form-control ${formErrors.recipient_name ? 'is-invalid' : form.recipient_name.trim() ? 'is-valid' : ''}`}
                          value={form.recipient_name}
                          onChange={handleChange}
                          placeholder="Nhập họ và tên"
                          required
                        />
                        {formErrors.recipient_name && (
                          <div className="invalid-feedback">{formErrors.recipient_name}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Số điện thoại <span className="text-danger">*</span>
                        </label>
                        <input
                          name="phone_number"
                          className={`form-control ${formErrors.phone_number ? 'is-invalid' : form.phone_number.trim() && isValidPhoneNumber(form.phone_number) ? 'is-valid' : ''}`}
                          value={form.phone_number}
                          onChange={handleChange}
                          placeholder="0xxx xxx xxx"
                          required
                        />
                        {formErrors.phone_number && (
                          <div className="invalid-feedback">{formErrors.phone_number}</div>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          Tỉnh/Thành phố <span className="text-danger">*</span>
                        </label>
                        <select
                          name="city"
                          className={`form-select ${formErrors.city ? 'is-invalid' : form.city.trim() ? 'is-valid' : ''}`}
                          value={form.city}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                          <option value="Ha Noi">Hà Nội</option>
                          <option value="Da Nang">Đà Nẵng</option>
                          <option value="Can Tho">Cần Thơ</option>
                          <option value="Hai Phong">Hải Phòng</option>
                          <option value="An Giang">An Giang</option>
                          <option value="Bac Giang">Bắc Giang</option>
                          <option value="Bac Kan">Bắc Kạn</option>
                          <option value="Bac Lieu">Bạc Liêu</option>
                          <option value="Bac Ninh">Bắc Ninh</option>
                          <option value="Ba Ria Vung Tau">Bà Rịa - Vũng Tàu</option>
                          <option value="Ben Tre">Bến Tre</option>
                          <option value="Binh Dinh">Bình Định</option>
                          <option value="Binh Duong">Bình Dương</option>
                          <option value="Binh Phuoc">Bình Phước</option>
                          <option value="Binh Thuan">Bình Thuận</option>
                          <option value="Ca Mau">Cà Mau</option>
                          <option value="Cao Bang">Cao Bằng</option>
                          <option value="Dak Lak">Đắk Lắk</option>
                          <option value="Dak Nong">Đắk Nông</option>
                          <option value="Dien Bien">Điện Biên</option>
                          <option value="Dong Nai">Đồng Nai</option>
                          <option value="Dong Thap">Đồng Tháp</option>
                          <option value="Gia Lai">Gia Lai</option>
                          <option value="Ha Giang">Hà Giang</option>
                          <option value="Ha Nam">Hà Nam</option>
                          <option value="Ha Tinh">Hà Tĩnh</option>
                          <option value="Hau Giang">Hậu Giang</option>
                          <option value="Hoa Binh">Hòa Bình</option>
                          <option value="Hung Yen">Hưng Yên</option>
                          <option value="Khanh Hoa">Khánh Hòa</option>
                          <option value="Kien Giang">Kiên Giang</option>
                          <option value="Kon Tum">Kon Tum</option>
                          <option value="Lai Chau">Lai Châu</option>
                          <option value="Lam Dong">Lâm Đồng</option>
                          <option value="Lang Son">Lạng Sơn</option>
                          <option value="Lao Cai">Lào Cai</option>
                          <option value="Long An">Long An</option>
                          <option value="Nam Dinh">Nam Định</option>
                          <option value="Nghe An">Nghệ An</option>
                          <option value="Ninh Binh">Ninh Bình</option>
                          <option value="Ninh Thuan">Ninh Thuận</option>
                          <option value="Phu Tho">Phú Thọ</option>
                          <option value="Phu Yen">Phú Yên</option>
                          <option value="Quang Binh">Quảng Bình</option>
                          <option value="Quang Nam">Quảng Nam</option>
                          <option value="Quang Ngai">Quảng Ngãi</option>
                          <option value="Quang Ninh">Quảng Ninh</option>
                          <option value="Quang Tri">Quảng Trị</option>
                          <option value="Soc Trang">Sóc Trăng</option>
                          <option value="Son La">Sơn La</option>
                          <option value="Tay Ninh">Tây Ninh</option>
                          <option value="Thai Binh">Thái Bình</option>
                          <option value="Thai Nguyen">Thái Nguyên</option>
                          <option value="Thanh Hoa">Thanh Hóa</option>
                          <option value="Thua Thien Hue">Thừa Thiên Huế</option>
                          <option value="Tien Giang">Tiền Giang</option>
                          <option value="Tra Vinh">Trà Vinh</option>
                          <option value="Tuyen Quang">Tuyên Quang</option>
                          <option value="Vinh Long">Vĩnh Long</option>
                          <option value="Vinh Phuc">Vĩnh Phúc</option>
                          <option value="Yen Bai">Yên Bái</option>
                        </select>
                        {formErrors.city && (
                          <div className="invalid-feedback">{formErrors.city}</div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          Quận/Huyện <span className="text-danger">*</span>
                        </label>
                        <input
                          name="district"
                          className={`form-control ${formErrors.district ? 'is-invalid' : form.district.trim() ? 'is-valid' : ''}`}
                          value={form.district}
                          onChange={handleChange}
                          placeholder="Nhập quận/huyện"
                          required
                        />
                        {formErrors.district && (
                          <div className="invalid-feedback">{formErrors.district}</div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          Phường/Xã <span className="text-danger">*</span>
                        </label>
                        <input
                          name="ward"
                          className={`form-control ${formErrors.ward ? 'is-invalid' : form.ward.trim() ? 'is-valid' : ''}`}
                          value={form.ward}
                          onChange={handleChange}
                          placeholder="Nhập phường/xã"
                          required
                        />
                        {formErrors.ward && (
                          <div className="invalid-feedback">{formErrors.ward}</div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Địa chỉ cụ thể <span className="text-danger">*</span>
                      </label>
                      <input
                        name="address_line1"
                        className={`form-control ${formErrors.address_line1 ? 'is-invalid' : form.address_line1.trim() ? 'is-valid' : ''}`}
                        value={form.address_line1}
                        onChange={handleChange}
                        placeholder="Số nhà, tên đường..."
                        required
                      />
                      {formErrors.address_line1 && (
                        <div className="invalid-feedback">{formErrors.address_line1}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Ghi chú (tùy chọn)</label>
                      <textarea
                        name="address_line2"
                        className="form-control"
                        value={form.address_line2 || ''}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm, hướng dẫn giao hàng..."
                        rows={3}
                      />
                    </div>

                    {/* Progress indicator */}
                    {!isFormValid() && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">Hoàn thành thông tin:</small>
                          <small className="text-muted">
                            {(() => {
                              const requiredFields = ['recipient_name', 'phone_number', 'address_line1', 'ward', 'district', 'city'];
                              const filledFields = requiredFields.filter(field =>
                                form[field as keyof CustomerAddress]?.toString().trim()
                              ).length;
                              return `${filledFields}/${requiredFields.length}`;
                            })()}
                          </small>
                        </div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width: `${(() => {
                                const requiredFields = ['recipient_name', 'phone_number', 'address_line1', 'ward', 'district', 'city'];
                                const filledFields = requiredFields.filter(field =>
                                  form[field as keyof CustomerAddress]?.toString().trim()
                                ).length;
                                return (filledFields / requiredFields.length) * 100;
                              })()}%`,
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className={`btn ${isFormValid() ? 'btn-primary' : 'btn-outline-primary'}`}
                        type="submit"
                        disabled={!isFormValid()}
                        style={{
                          opacity: isFormValid() ? 1 : 0.7
                        }}
                      >
                        <i className="fas fa-save me-2"></i>
                        {isFormValid() ? 'Lưu địa chỉ' : 'Vui lòng điền đầy đủ thông tin'}
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={closeForm}>
                        <i className="fas fa-times me-2"></i>
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* CẬP NHẬT: Address List với hiển thị đúng cấu trúc */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải danh sách địa chỉ...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Chưa có địa chỉ nào</h5>
                  <p className="text-muted">Thêm địa chỉ để thuận tiện cho việc đặt hàng</p>
                  <button className="btn btn-primary" onClick={openAddForm}>
                    <i className="fa fa-plus me-2"></i> Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="row">
                  {addresses.map(addr => (
                    <div className="col-md-6 d-flex" key={addr.id}>
                      <article className="address-box h-100 w-100">
                        <h6>
                          <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                          {addr.city}
                          {addr.isDefault && (
                            <span className="badge bg-success ms-2">
                              <i className="fas fa-check me-1"></i>
                              Mặc định
                            </span>
                          )}
                        </h6>
                        <div>
                          <div className="mb-2">
                            <strong><i className="fas fa-user me-2"></i>{addr.recipient_name}</strong>
                          </div>
                          <div className="mb-1">
                            <i className="fas fa-phone me-2 text-muted"></i>
                            {addr.phone_number}
                          </div>
                          <div className="mb-1">
                            <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                            {/* CẬP NHẬT: Hiển thị địa chỉ đầy đủ từ các trường riêng biệt */}
                            {addr.address_line1}, {addr.ward}, {addr.district}, {addr.city}
                          </div>
                          {addr.address_line2 && (
                            <div className="mb-1">
                              <i className="fas fa-sticky-note me-2 text-muted"></i>
                              <small className="text-muted">{addr.address_line2}</small>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 d-flex gap-2 flex-wrap">
                          {addr.isDefault ? (
                            <button className="btn btn-outline-success btn-sm disabled">
                              <i className="fa fa-check me-1"></i> Địa chỉ mặc định
                            </button>
                          ) : (
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setDefault(addr.id)}>
                              <i className="fa fa-check me-1"></i> Đặt làm mặc định
                            </button>
                          )}
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => openEditForm(addr)}>
                            <i className="fa fa-pen me-1"></i> Sửa
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAddress(addr.id)}>
                            <i className="fa fa-trash me-1"></i> Xóa
                          </button>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              )}

              {/* Info box */}
              {addresses.length > 0 && (
                <div className="d-flex justify-content-center mt-4">
                  <div
                    className="alert alert-info d-flex align-items-center shadow-sm rounded-3 px-4 py-3 mb-0"
                    style={{
                      maxWidth: 520,
                      minWidth: 320,
                      margin: '0 auto',
                      background: "#fafdff"
                    }}
                  >
                    <i className="fas fa-info-circle me-3 fs-3 text-primary"></i>
                    <div>
                      <strong>Lưu ý:</strong>
                      <ul className="mb-0 mt-1 small text-muted ps-3" style={{ lineHeight: 1.65 }}>
                        <li><b>Địa chỉ mặc định sẽ được tự động chọn khi đặt hàng</b></li>
                        <li><b>Bạn có thể thêm nhiều địa chỉ để thuận tiện cho việc giao hàng</b></li>
                        <li><b>Thông tin địa chỉ được mã hóa và bảo mật an toàn</b></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Address;