import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

type ProductForm = {
  slug: string;
  productName: string;
  sku: string;
  salePrice: number;
  comparePrice: number;
  buyingPrice: number;
  quantity: number;
  shortDescription: string;
  productDescription: string;
  productType: string;
  published: boolean;
  disableOutOfStock: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
  idCategories: string[];
  images: ProductImage[];
  imagePhus: ProductImage[];
};

const ProductEditPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductForm | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy danh sách danh mục
  useEffect(() => {
    axios.get('http://localhost:8080/categories')
      .then(res => {
        const data = res.data as { _embedded?: { categories?: Category[] } };
        const cats = data._embedded?.categories ?? [];
        setCategories(cats);
      })
      .catch(err => console.error('Lỗi khi lấy danh mục:', err));
  }, []);

  // Re-render khi categories được load
  useEffect(() => {
    if (categories.length > 0 && form && form.idCategories && form.idCategories.length > 0) {
      // Force re-render để cập nhật tên danh mục
      setForm(prev => prev ? { ...prev } : prev);
    }
  }, [categories]);

  // Lấy dữ liệu sản phẩm, ảnh và danh mục
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        // 1. Lấy thông tin sản phẩm
        const res = await axios.get<ProductForm>(`http://localhost:8080/api/products/${productId}`);
        const productData = res.data;

        // 2. Lấy gallery ảnh
        const galleryRes = await axios.get<{ _embedded: { galleries: { image: string; isThumbnail: boolean }[] } }>(
          `http://localhost:8080/gallerys/search/findByProduct`,
          { params: { product: `/api/products/${productId}` } }
        );

        const galleries = galleryRes.data._embedded?.galleries ?? [];
        const images: ProductImage[] = galleries
          .filter(g => g.isThumbnail)
          .map(g => ({ url: g.image, isThumbnail: true }));
        const imagePhus: ProductImage[] = galleries
          .filter(g => !g.isThumbnail)
          .map(g => ({ url: g.image, isThumbnail: false }));

        // 3. Lấy danh mục của sản phẩm từ backend response
        const productCategories = productData.idCategories || [];

        // 4. Cập nhật form với dữ liệu đầy đủ
        const formData = {
          ...productData,
          images,
          imagePhus,
          idCategories: productCategories,
          // Đảm bảo các trường số có giá trị hợp lệ
          salePrice: productData.salePrice || 0,
          comparePrice: productData.comparePrice || 0,
          buyingPrice: productData.buyingPrice || 0,
          quantity: productData.quantity || 0,
          // Đảm bảo các trường text không null
          shortDescription: productData.shortDescription || '',
          productDescription: productData.productDescription || '',
          note: productData.note || '',
          slug: productData.slug || '',
          sku: productData.sku || '',
          productName: productData.productName || '',
          productType: productData.productType || 'simple'
        };
        
        setForm(formData);
        
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu sản phẩm:', err);
        setError('Không thể tải dữ liệu sản phẩm.');
      }
    };

    fetchProduct();
  }, [productId]);

  // 🆕 Auto-generate slug from product name (Vietnamese support)
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

  // 🆕 Auto-generate SKU
  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PRD-${timestamp}-${random}`;
  };

  // 🆕 Handle product name change and auto-generate slug
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        productName: name,
        // Chỉ tự động tạo slug nếu slug hiện tại trống hoặc khớp với slug của tên cũ
        slug: prev.slug === '' || prev.slug === generateSlug(prev.productName) ? generateSlug(name) : prev.slug
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { id, value, type } = target;

    setForm(prev => {
      if (!prev) return prev;
      
      // Xử lý select multiple cho danh mục (nếu có)
      if (id === 'idCategories' && target instanceof HTMLSelectElement) {
        const selected = Array.from(target.selectedOptions).map(o => o.value);
        return { ...prev, idCategories: selected };
      }
      
      if (type === 'checkbox' && target instanceof HTMLInputElement) {
        return { ...prev, [id]: target.checked };
      }
      if (type === 'number') {
        // Đảm bảo giá trị số hợp lệ
        const numValue = parseFloat(value) || 0;
        return { ...prev, [id]: numValue };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleEditorChange = (fieldName: string) => (event: any, editor: any) => {
    const data = editor.getData();
    setForm(prev => prev ? { ...prev, [fieldName]: data || '' } : prev);
  };

  const calculateDiscountPercent = () => {
    if (!form || form.comparePrice <= 0 || form.salePrice <= 0) return 0;
    return Math.round(((form.comparePrice - form.salePrice) / form.comparePrice) * 100);
  };

  const validatePrices = () => {
    if (!form) return { isValid: true, errors: [] };
    const errors: string[] = [];
    
    // Kiểm tra giá trị âm
    if (form.buyingPrice < 0 || form.salePrice < 0 || form.comparePrice < 0) {
      errors.push('Giá không được âm');
    }
    
    // Kiểm tra giá bán >= giá nhập
    if (form.salePrice < form.buyingPrice) {
      errors.push('Giá bán phải lớn hơn hoặc bằng giá nhập');
    }
    
    // Kiểm tra giá bán <= giá niêm yết (nếu có giá niêm yết)
    if (form.comparePrice > 0 && form.salePrice > form.comparePrice) {
      errors.push('Giá bán không được vượt quá giá niêm yết');
    }
    
    // Kiểm tra số lượng
    if (form.quantity < 0) {
      errors.push('Số lượng không được âm');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const validateForm = () => {
    if (!form) return { isValid: false, errors: ['Form không hợp lệ'] };
    
    const errors: string[] = [];
    
    // Kiểm tra các trường bắt buộc
    if (!form.productName?.trim()) {
      errors.push('Tên sản phẩm không được để trống');
    }
    
    if (!form.slug?.trim()) {
      errors.push('Slug không được để trống');
    }
    
    if (!form.sku?.trim()) {
      errors.push('SKU không được để trống');
    }
    
    // Kiểm tra giá
    const priceValidation = validatePrices();
    if (!priceValidation.isValid) {
      errors.push(...priceValidation.errors);
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleCategoryChangeDropdown = (categoryId: string) => {
    setForm(prev => {
      if (!prev) return prev;
      const newCategories = prev.idCategories.includes(categoryId)
        ? prev.idCategories.filter(id => id !== categoryId)
        : [...prev.idCategories, categoryId];
      return { ...prev, idCategories: newCategories };
    });
  };

  const getSelectedCategoryNames = () => {
    if (!form?.idCategories || form.idCategories.length === 0) return '';
    
    const matchedNames = form.idCategories
      .map(id => {
        const category = categories.find(cat => cat.id === id);
        return category?.categoryName;
      })
      .filter(Boolean);
    
    return matchedNames.join(', ');
  };

  const handleAddImageUrl = (url: string, isThumbnail: boolean) => {
    if (!url || !form) return;
    if (isThumbnail) {
      setForm(prev => prev ? { ...prev, images: [{ url, isThumbnail: true }] } : prev);
    } else {
      setForm(prev => {
        if (!prev) return prev;
        if (prev.imagePhus.find(img => img.url === url)) return prev;
        return { ...prev, imagePhus: [...prev.imagePhus, { url, isThumbnail: false }] };
      });
    }
  };

  const handleRemoveImage = (url: string, isThumbnail: boolean) => {
    if (!form) return;
    if (isThumbnail) {
      setForm(prev => prev ? { ...prev, images: prev.images.filter(img => img.url !== url) } : prev);
    } else {
      setForm(prev => prev ? { ...prev, imagePhus: prev.imagePhus.filter(img => img.url !== url) } : prev);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isThumbnail: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        handleAddImageUrl(base64, isThumbnail);
      } catch (error) {
        console.error('Chuyển file thành base64 thất bại:', error);
        setError('Không thể xử lý file ảnh');
      }
    }
  };

  const handleMultipleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isThumbnail: boolean) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        try {
          const base64 = await fileToBase64(file);
          handleAddImageUrl(base64, isThumbnail);
        } catch (error) {
          console.error('Chuyển file thành base64 thất bại:', error);
          setError('Không thể xử lý một số file ảnh');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !productId) return;

    // Validate form
    const formValidation = validateForm();
    if (!formValidation.isValid) {
      setError(formValidation.errors.join('. '));
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const staffId = getIdUserByToken();
      
      // Tạo payload sạch, loại bỏ các trường có thể gây lỗi
      const payload = {
        slug: form.slug?.trim() || '',
        productName: form.productName?.trim() || '',
        sku: form.sku?.trim() || '',
        salePrice: Number(form.salePrice) || 0,
        comparePrice: Number(form.comparePrice) || 0,
        buyingPrice: Number(form.buyingPrice) || 0,
        quantity: Number(form.quantity) || 0,
        shortDescription: form.shortDescription || '',
        productDescription: form.productDescription || '',
        productType: form.productType || 'simple',
        published: Boolean(form.published),
        disableOutOfStock: Boolean(form.disableOutOfStock),
        note: form.note || '',
        // Đảm bảo idCategories là array hợp lệ
        idCategories: Array.isArray(form.idCategories) ? form.idCategories.filter(id => id) : [],
        // Đảm bảo images là array hợp lệ
        images: Array.isArray(form.images) ? form.images.map(img => img.url).filter(url => url) : [],
        imagePhus: Array.isArray(form.imagePhus) ? form.imagePhus.map(img => img.url).filter(url => url) : [],
      };

      console.log("Payload gửi lên:", JSON.stringify(payload, null, 2));
      
      // Sử dụng axios với headers rõ ràng
      const response = await axios.put(
        `http://localhost:8080/api/products/${productId}?staffId=${staffId}`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 giây timeout
        }
      );
      
      console.log("Response:", response.data);
      alert('Cập nhật sản phẩm thành công!');
      navigate('/management/product');
      
    } catch (err: any) {
      console.error('Lỗi cập nhật sản phẩm:', err);
      
      // Xử lý lỗi chi tiết hơn
      if (err.response) {
        // Lỗi từ server
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data || 'Lỗi từ server';
        
        switch (status) {
          case 400:
            setError(`Dữ liệu không hợp lệ: ${message}`);
            break;
          case 401:
            setError('Bạn không có quyền thực hiện thao tác này');
            break;
          case 403:
            setError('Truy cập bị từ chối');
            break;
          case 404:
            setError('Không tìm thấy sản phẩm');
            break;
          case 500:
            setError('Lỗi server nội bộ. Vui lòng thử lại sau');
            break;
          default:
            setError(`Lỗi ${status}: ${message}`);
        }
      } else if (err.request) {
        // Lỗi network
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        // Lỗi khác
        setError('Có lỗi xảy ra: ' + (err.message || 'Lỗi không xác định'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#667eea'
      }}>
        🔄 Đang tải dữ liệu sản phẩm...
      </div>
    );
  }

  return (
    <div 
      style={{ 
        marginLeft: 'var(--sidebar-width, 280px)',
        maxWidth: 'calc(100vw - var(--sidebar-width, 280px) - 40px)', 
        padding: '20px',
        background: '#f8f9fa',
        minHeight: '100vh'
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
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
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
              fontWeight: '500'
            }}
          >
            <i className="fas fa-arrow-left"></i>
            <span>Quay lại</span>
          </button>
          
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
            ✏️ Chỉnh sửa sản phẩm
          </h2>
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
                    value={form.productName || ''} 
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
                    value={form.slug || ''} 
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
                      onClick={() => setForm(prev => prev ? { ...prev, sku: generateSKU() } : prev)}
                      style={{
                        marginLeft: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#28a745',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline'
                      }}
                    >
                      Tạo mới
                    </button>
                  </label>
                  <input 
                    type="text" 
                    id="sku" 
                    value={form.sku || ''} 
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
                    value={form.quantity || 0} 
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
                    value={form.buyingPrice || 0} 
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
                    value={form.comparePrice || 0} 
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
                    value={form.salePrice || 0} 
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
                        color: form.idCategories && form.idCategories.length > 0 ? '#495057' : '#6c757d',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {form.idCategories && form.idCategories.length > 0 
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
                        border: '2px solid #28a745',
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
                              border: '2px solid #28a745',
                              borderRadius: '4px',
                              marginRight: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: form.idCategories && form.idCategories.includes(cat.id) ? '#28a745' : 'white'
                            }}>
                              {form.idCategories && form.idCategories.includes(cat.id) && (
                                <i className="fas fa-check" style={{ 
                                  color: 'white', 
                                  fontSize: '10px' 
                                }}></i>
                              )}
                            </div>
                            <span style={{ 
                              color: '#495057',
                              fontSize: '14px',
                              fontWeight: form.idCategories && form.idCategories.includes(cat.id) ? '600' : '400'
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
                            Không có danh mục nào
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 🆕 Selected categories display as tags (từ ProductEditPage) */}
                  {form.idCategories && form.idCategories.length > 0 && (
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
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
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
                    value={form.productType || 'simple'} 
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
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.shortDescription || ''}
                    onChange={handleEditorChange('shortDescription')}
                    config={{
                      toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList'],
                      placeholder: 'Nhập mô tả ngắn về sản phẩm...'
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
                    Mô tả chi tiết
                  </label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.productDescription || ''}
                    onChange={handleEditorChange('productDescription')}
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
                        'insertTable',
                        'undo',
                        'redo'
                      ],
                      placeholder: 'Nhập mô tả chi tiết về sản phẩm...'
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
                    Ghi chú
                  </label>
                  <textarea 
                    id="note" 
                    rows={3} 
                    value={form.note || ''} 
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
                      border: '2px dashed #28a745',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {form.images && form.images.length > 0 && (
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
                      border: '2px dashed #17a2b8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {form.imagePhus && form.imagePhus.length > 0 && (
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
                    checked={form.published || false} 
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
                    checked={form.disableOutOfStock || false} 
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

            {/* Submit button */}
            <div style={{ textAlign: 'center', paddingTop: '24px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  background: loading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  padding: '16px 48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                  }
                }}
              >
                {loading ? '🔄 Đang cập nhật...' : '✅ Cập nhật sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditPage;