import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getIdUserByToken } from '../../../utils/JwtService';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

type ProductImage = {
  url: string;
  isThumbnail: boolean;
};

type Category = {
  id: string;
  categoryName: string;
};

// Configure axios defaults to handle CORS
// axios.defaults.withCredentials = false;
// axios.defaults.headers.common['Content-Type'] = 'application/json';
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    slug: '',
    productName: '',
    sku: '',
    salePrice: 0,
    comparePrice: 0,
    buyingPrice: 0,
    quantity: 0,
    shortDescription: '',
    productDescription: '',
    productType: 'simple',
    published: true,
    disableOutOfStock: false,
    note: '',
    idCategories: [] as string[],
    images: [] as ProductImage[],
    imagePhus: [] as ProductImage[],
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🆕 State để track CKEditor ready
  const [editorReady, setEditorReady] = useState(false);
  const shortDescRef = useRef<any>(null);
  const productDescRef = useRef<any>(null);

  // API Base URL - make it configurable
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // 🆕 useEffect để đảm bảo CKEditor load xong
  useEffect(() => {
    const timer = setTimeout(() => {
      setEditorReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let response;
        try {
          response = await axios.get(`${API_BASE_URL}/categories`, {
            timeout: 5000,
            headers: {
              'Accept': 'application/json',
            }
          });
        } catch (firstError) {
          console.warn('Primary categories endpoint failed, trying alternative...');
          response = await axios.get(`${API_BASE_URL}/api/categories`, {
            timeout: 5000,
            headers: {
              'Accept': 'application/json',
            }
          });
        }

        const data = response.data;
        let cats: Category[] = [];
        if (data._embedded?.categories) {
          cats = data._embedded.categories;
        } else if (Array.isArray(data)) {
          cats = data;
        } else if (data.data && Array.isArray(data.data)) {
          cats = data.data;
        } else {
          console.warn('Unexpected categories response format:', data);
          cats = [];
        }
        
        setCategories(cats);
      } catch (err: any) {
        console.error('Lỗi khi lấy danh mục:', err);
        setCategories([
          { id: '1', categoryName: 'Điện tử' },
          { id: '2', categoryName: 'Thời trang' },
          { id: '3', categoryName: 'Gia dụng' },
          { id: '4', categoryName: 'Sách' },
          { id: '5', categoryName: 'Thể thao' }
        ]);
        
        if (err.code !== 'ERR_NETWORK') {
          setError('Không thể tải danh mục. Sử dụng danh mục mặc định.');
        }
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  // Cập nhật giá trị form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { id, value, type } = target;

    setForm(prev => {
      if (id === 'idCategories' && target instanceof HTMLSelectElement) {
        const selected = Array.from(target.selectedOptions).map(o => o.value);
        return { ...prev, idCategories: selected };
      }
      
      if (type === 'checkbox' && target instanceof HTMLInputElement) {
        return { ...prev, [id]: target.checked };
      }
      if (type === 'number') {
        const numValue = parseFloat(value) || 0;
        return { ...prev, [id]: numValue };
      }
      return { ...prev, [id]: value };
    });
  };

  // Auto-generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle product name change and auto-generate slug
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      productName: name,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.productName) ? generateSlug(name) : prev.slug
    }));
  };

  // Auto-generate SKU
  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PRD-${timestamp}-${random}`;
  };

  // 🛠️ FIXED: Xử lý CKEditor content change an toàn hơn
  const handleEditorChange = (fieldName: string) => (event: any, editor: any) => {
    try {
      const data = editor.getData();
      setForm(prev => ({
        ...prev,
        [fieldName]: data || '',
      }));
    } catch (error) {
      console.warn('CKEditor error:', error);
    }
  };

  // 🛠️ FIXED: Safe CKEditor ready handler
  const handleEditorReady = (editor: any, fieldName: string) => {
    try {
      if (fieldName === 'shortDescription') {
        shortDescRef.current = editor;
      } else if (fieldName === 'productDescription') {
        productDescRef.current = editor;
      }
    } catch (error) {
      console.warn('CKEditor ready error:', error);
    }
  };

  // Tính toán % giảm giá
  const calculateDiscountPercent = () => {
    if (form.comparePrice <= 0 || form.salePrice <= 0) return 0;
    return Math.round(((form.comparePrice - form.salePrice) / form.comparePrice) * 100);
  };

  // Validation giá
  const validatePrices = () => {
    const errors: string[] = [];
    
    if (form.salePrice < form.buyingPrice) {
      errors.push('Giá bán phải lớn hơn hoặc bằng giá nhập để đảm bảo lợi nhuận');
    }
    
    if (form.comparePrice > 0 && form.salePrice > form.comparePrice) {
      errors.push('Giá bán không được vượt quá giá niêm yết');
    }
    
    if (form.buyingPrice < 0 || form.salePrice < 0 || form.comparePrice < 0) {
      errors.push('Giá không được âm');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  // Validation form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!form.productName.trim()) errors.push('Tên sản phẩm không được để trống');
    if (!form.slug.trim()) errors.push('Slug không được để trống');
    if (!form.sku.trim()) errors.push('SKU không được để trống');
    if (form.quantity < 0) errors.push('Số lượng không được âm');
    
    const priceValidation = validatePrices();
    if (!priceValidation.isValid) {
      errors.push(...priceValidation.errors);
    }
    
    return { isValid: errors.length === 0, errors };
  };

  // Custom dropdown handlers
  const handleCategoryChangeDropdown = (categoryId: string) => {
    setForm(prev => {
      const newCategories = prev.idCategories.includes(categoryId)
        ? prev.idCategories.filter(id => id !== categoryId)
        : [...prev.idCategories, categoryId];
      return { ...prev, idCategories: newCategories };
    });
  };

  const getSelectedCategoryNames = () => {
    return form.idCategories
      .map(id => categories.find(cat => cat.id === id)?.categoryName)
      .filter(Boolean)
      .join(', ');
  };

  const handleAddImageUrl = (url: string, isThumbnail = false) => {
    if (!url) return;

    if (isThumbnail) {
      if (form.images.find(img => img.url === url)) return;
      setForm(prev => ({
        ...prev,
        images: [...prev.images, { url, isThumbnail }],
      }));
    } else {
      if (form.imagePhus.find(img => img.url === url)) return;
      setForm(prev => ({
        ...prev,
        imagePhus: [...prev.imagePhus, { url, isThumbnail }],
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isThumbnail: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Chỉ được upload file hình ảnh');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        handleAddImageUrl(url, isThumbnail);
      };
      reader.onerror = () => {
        setError('Lỗi khi đọc file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isThumbnail: boolean) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} quá lớn (>5MB)`);
          return false;
        }
        if (!file.type.startsWith('image/')) {
          setError(`File ${file.name} không phải là hình ảnh`);
          return false;
        }
        return true;
      });

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          handleAddImageUrl(url, isThumbnail);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (url: string, isThumbnail: boolean) => {
    if (isThumbnail) {
      setForm(prev => ({ ...prev, images: prev.images.filter(img => img.url !== url) }));
    } else {
      setForm(prev => ({ ...prev, imagePhus: prev.imagePhus.filter(img => img.url !== url) }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    
    const formValidation = validateForm();
    if (!formValidation.isValid) {
      setError(formValidation.errors.join('. '));
      return;
    }

    setLoading(true);
    
    try {
      const staffId = getIdUserByToken();
      if (!staffId) {
        throw new Error('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      }

      const payload = {
        slug: form.slug.trim(),
        productName: form.productName.trim(), 
        sku: form.sku.trim(),
        salePrice: Number(form.salePrice),
        comparePrice: Number(form.comparePrice),
        buyingPrice: Number(form.buyingPrice),
        quantity: Number(form.quantity),
        shortDescription: form.shortDescription || "",
        productDescription: form.productDescription || "",
        productType: form.productType,
        published: Boolean(form.published),
        disableOutOfStock: Boolean(form.disableOutOfStock),
        note: form.note || "",
        idCategories: form.idCategories.map(id => id.toString()),
        images: form.images.map(img => img.url).filter(url => url && url.trim() !== ""),
        imagePhus: form.imagePhus.map(img => img.url).filter(url => url && url.trim() !== "")
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
      console.log('👤 Staff ID:', staffId);

      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/products`,
        params: { staffId: staffId },
        data: payload,
        timeout: 20000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response data:', response.data);

      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Product created successfully');
        alert('Thêm sản phẩm thành công!');
        navigate('/management/product');
      } else {
        const errorData = response.data;
        let errorMessage = 'Có lỗi xảy ra khi thêm sản phẩm.';
        
        if (typeof errorData === 'object' && errorData !== null) {
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (err: any) {
      console.error('💥 Submit error:', err);
      
      let errorMessage = 'Có lỗi xảy ra khi thêm sản phẩm.';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = '🌐 Lỗi kết nối mạng. Kiểm tra server có chạy không?';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = '⏱️ Kết nối timeout. Server xử lý chậm hoặc quá tải.';
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = `❌ Dữ liệu không hợp lệ: ${data?.error || data?.message || 'Kiểm tra các trường bắt buộc'}`;
            break;
          case 401:
            errorMessage = '🔒 Không có quyền truy cập. Vui lòng đăng nhập lại.';
            break;
          case 403:
            errorMessage = '🚫 Không có quyền thực hiện thao tác này.';
            break;
          case 404:
            errorMessage = '🔍 Không tìm thấy API endpoint.';
            break;
          case 409:
            errorMessage = `⚠️ Conflict: ${data?.error || data?.message || 'SKU hoặc slug đã tồn tại'}`;
            break;
          case 422:
            errorMessage = `📋 Validation error: ${data?.error || data?.message || 'Dữ liệu không hợp lệ'}`;
            break;
          case 500:
            errorMessage = `💥 Lỗi server: ${data?.error || data?.message || 'Lỗi nội bộ server'}`;
            break;
          default:
            errorMessage = `❓ Lỗi ${status}: ${data?.error || data?.message || err.message}`;
        }
      } else if (err.message) {
        errorMessage = `⚠️ ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        marginLeft: 'var(--sidebar-width, 280px)',
        maxWidth: 'calc(100vw - var(--sidebar-width, 280px) - 40px)', 
        padding: '20px',
        background: '#f8f9fa',
        minHeight: '100vh',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onClick={(e) => {
        if (!(e.target as Element).closest('.category-dropdown')) {
          setShowCategoryDropdown(false);
        }
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => navigate('/management/product')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-arrow-left" style={{ fontSize: '14px' }}></i>
              <span>Quay lại</span>
            </button>
            
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
              📦 Thêm sản phẩm mới
            </h2>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {/* Thông tin cơ bản */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '20px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '8px'
              }}>
                📝 Thông tin cơ bản
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Tên sản phẩm *
                  </label>
                  <input 
                    type="text" 
                    id="productName" 
                    value={form.productName} 
                    onChange={handleProductNameChange} 
                    required
                    placeholder="Nhập tên sản phẩm..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Slug *
                    <small style={{ color: '#6c757d', fontWeight: 'normal', marginLeft: '8px' }}>
                      (Tự động tạo từ tên sản phẩm)
                    </small>
                  </label>
                  <input 
                    type="text" 
                    id="slug" 
                    value={form.slug} 
                    onChange={handleChange} 
                    required
                    placeholder="san-pham-moi"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    SKU *
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, sku: generateSKU() }))}
                      style={{
                        marginLeft: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline'
                      }}
                    >
                      Tạo tự động
                    </button>
                  </label>
                  <input 
                    type="text" 
                    id="sku" 
                    value={form.sku} 
                    onChange={handleChange} 
                    required
                    placeholder="PRD-123456-ABC"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Số lượng *
                  </label>
                  <input 
                    type="number" 
                    id="quantity" 
                    value={form.quantity} 
                    onChange={handleChange} 
                    required
                    min="0"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Thông tin giá */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '20px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '8px'
              }}>
                💰 Thông tin giá
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Giá nhập * 🏪
                  </label>
                  <input 
                    type="number" 
                    id="buyingPrice" 
                    value={form.buyingPrice} 
                    onChange={handleChange} 
                    required
                    min="0"
                    step="1000"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Giá niêm yết 🏷️
                  </label>
                  <input 
                    type="number" 
                    id="comparePrice" 
                    value={form.comparePrice} 
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Giá bán * 💰
                  </label>
                  <input 
                    type="number" 
                    id="salePrice" 
                    value={form.salePrice} 
                    onChange={handleChange} 
                    required
                    min="0"
                    step="1000"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Thông tin tính toán */}
              {form.buyingPrice > 0 && form.salePrice > 0 && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <strong style={{ color: '#495057' }}>💹 Lợi nhuận:</strong>
                      <span style={{ 
                        marginLeft: '8px',
                        color: form.salePrice >= form.buyingPrice ? '#28a745' : '#dc3545',
                        fontWeight: '600'
                      }}>
                        {(form.salePrice - form.buyingPrice).toLocaleString('vi-VN')}đ
                        {form.buyingPrice > 0 && (
                          <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                            ({Math.round(((form.salePrice - form.buyingPrice) / form.buyingPrice) * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>

                    {form.comparePrice > 0 && (
                      <div>
                        <strong style={{ color: '#495057' }}>🔥 Giảm giá:</strong>
                        <span style={{ 
                          marginLeft: '8px',
                          color: '#dc3545',
                          fontWeight: '600'
                        }}>
                          {calculateDiscountPercent()}%
                          <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                            (-{(form.comparePrice - form.salePrice).toLocaleString('vi-VN')}đ)
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Validation warnings */}
                  {(() => {
                    const validation = validatePrices();
                    if (!validation.isValid) {
                      return (
                        <div style={{ 
                          marginTop: '12px',
                          padding: '8px 12px',
                          background: '#fff3cd',
                          border: '1px solid #ffeaa7',
                          borderRadius: '6px',
                          color: '#856404'
                        }}>
                          <small>
                            ⚠️ {validation.errors.join('. ')}
                          </small>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            {/* Danh mục và loại sản phẩm */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '20px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '8px'
              }}>
                🏷️ Phân loại
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Danh mục
                  </label>
                  
                  {/* Custom Dropdown */}
                  <div style={{ position: 'relative' }} className="category-dropdown">
                    <div
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '46px'
                      }}
                    >
                      <span style={{ 
                        color: form.idCategories.length > 0 ? '#495057' : '#6c757d',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {form.idCategories.length > 0 
                          ? getSelectedCategoryNames() 
                          : 'Chọn danh mục...'
                        }
                      </span>
                      <i 
                        className={`fas fa-chevron-${showCategoryDropdown ? 'up' : 'down'}`}
                        style={{ 
                          color: '#6c757d',
                          fontSize: '12px'
                        }}
                      ></i>
                    </div>

                    {/* Dropdown Menu */}
                    {showCategoryDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '2px solid #667eea',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {categories.length > 0 ? categories.map(cat => (
                          <div
                            key={cat.id}
                            onClick={() => handleCategoryChangeDropdown(cat.id)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              borderBottom: '1px solid #f8f9fa',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              border: '2px solid #667eea',
                              borderRadius: '4px',
                              marginRight: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: form.idCategories.includes(cat.id) ? '#667eea' : 'white'
                            }}>
                              {form.idCategories.includes(cat.id) && (
                                <i className="fas fa-check" style={{ 
                                  color: 'white', 
                                  fontSize: '10px' 
                                }}></i>
                              )}
                            </div>
                            <span style={{ 
                              color: '#495057',
                              fontSize: '14px',
                              fontWeight: form.idCategories.includes(cat.id) ? '600' : '400'
                            }}>
                              {cat.categoryName}
                            </span>
                          </div>
                        )) : (
                          <div style={{
                            padding: '12px 16px',
                            color: '#6c757d',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}>
                            {loading ? 'Đang tải danh mục...' : 'Không có danh mục nào'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected categories display as tags */}
                  {form.idCategories.length > 0 && (
                    <div style={{ 
                      marginTop: '8px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {form.idCategories.map(categoryId => {
                        const category = categories.find(cat => cat.id === categoryId);
                        return category ? (
                          <span
                            key={categoryId}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {category.categoryName}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryChangeDropdown(categoryId);
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.3)',
                                border: 'none',
                                borderRadius: '50%',
                                color: 'white',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Loại sản phẩm
                  </label>
                  <select 
                    id="productType" 
                    value={form.productType} 
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="simple">Simple</option>
                    <option value="variable">Variable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mô tả với CKEditor */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '20px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '8px'
              }}>
                📄 Mô tả sản phẩm
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Mô tả ngắn
                  </label>
                  {editorReady ? (
                    <CKEditor
                      editor={ClassicEditor}
                      data={form.shortDescription}
                      onChange={handleEditorChange('shortDescription')}
                      onReady={(editor) => handleEditorReady(editor, 'shortDescription')}
                      config={{
                        toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList'],
                        placeholder: 'Nhập mô tả ngắn về sản phẩm...',
                        removePlugins: ['Title'],
                        mediaEmbed: {
                          previewsInData: false
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      minHeight: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      🔄 Đang tải editor...
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Mô tả chi tiết
                  </label>
                  {editorReady ? (
                    <CKEditor
                      editor={ClassicEditor}
                      data={form.productDescription}
                      onChange={handleEditorChange('productDescription')}
                      onReady={(editor) => handleEditorReady(editor, 'productDescription')}
                      config={{
                        toolbar: [
                          'heading',
                          '|',
                          'bold',
                          'italic',
                          'link',
                          'bulletedList',
                          'numberedList',
                          '|',
                          'outdent',
                          'indent',
                          '|',
                          'blockQuote',
                          'undo',
                          'redo'
                        ],
                        placeholder: 'Nhập mô tả chi tiết về sản phẩm...',
                        removePlugins: ['Title'],
                        mediaEmbed: {
                          previewsInData: false
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      minHeight: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      🔄 Đang tải editor...
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Ghi chú
                  </label>
                  <textarea 
                    id="note" 
                    rows={3} 
                    value={form.note} 
                    onChange={handleChange}
                    placeholder="Ghi chú thêm về sản phẩm..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Upload ảnh */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '20px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '8px'
              }}>
                🖼️ Hình ảnh sản phẩm
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '24px' 
              }}>
                {/* Ảnh đại diện */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Ảnh đại diện (Thumbnail)
                    <small style={{ color: '#6c757d', fontWeight: 'normal', marginLeft: '8px' }}>
                      (Tối đa 5MB)
                    </small>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, true)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px dashed #667eea',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {form.images.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h6 style={{ marginBottom: '12px', color: '#495057' }}>Ảnh đại diện:</h6>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {form.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img 
                              src={img.url} 
                              alt="thumb" 
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #e9ecef'
                              }} 
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.url, true)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ảnh phụ */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Ảnh phụ (Gallery)
                    <small style={{ color: '#6c757d', fontWeight: 'normal', marginLeft: '8px' }}>
                      (Chọn nhiều file, tối đa 5MB/file)
                    </small>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={e => handleMultipleFileChange(e, false)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px dashed #28a745',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {form.imagePhus.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h6 style={{ marginBottom: '12px', color: '#495057' }}>
                        Ảnh phụ ({form.imagePhus.length}):
                      </h6>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {form.imagePhus.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img 
                              src={img.url} 
                              alt="img" 
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #e9ecef'
                              }} 
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.url, false)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox options */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '20px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '8px'
              }}>
                ⚙️ Tùy chọn
              </h4>
              
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <input 
                    type="checkbox" 
                    id="published" 
                    checked={form.published} 
                    onChange={handleChange}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ color: '#495057' }}>Công khai</span>
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <input 
                    type="checkbox" 
                    id="disableOutOfStock" 
                    checked={form.disableOutOfStock} 
                    onChange={handleChange}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ color: '#495057' }}>Ẩn khi hết hàng</span>
                </label>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #f5c6cb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#721c24' }}></i>
                {error}
              </div>
            )}

            {/* Network status warning */}
            {navigator.onLine === false && (
              <div style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #ffeaa7',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-wifi" style={{ color: '#856404' }}></i>
                Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.
              </div>
            )}

            {/* Submit button */}
            <div style={{ textAlign: 'center', paddingTop: '24px' }}>
              <button 
                type="submit" 
                disabled={loading || !navigator.onLine}
                style={{
                  background: loading || !navigator.onLine ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '16px 48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !navigator.onLine ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  opacity: loading || !navigator.onLine ? 0.7 : 1
                }}
              >
                {loading ? '🔄 Đang xử lý...' : !navigator.onLine ? '📡 Không có mạng' : '✅ Thêm sản phẩm'}
              </button>
              
              {/* Additional info */}
              <div style={{ 
                marginTop: '12px', 
                fontSize: '12px', 
                color: '#6c757d',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span>API: {API_BASE_URL}</span>
                <span>•</span>
                <span>Status: {navigator.onLine ? '🟢 Online' : '🔴 Offline'}</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreatePage;