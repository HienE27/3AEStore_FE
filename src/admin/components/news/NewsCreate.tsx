import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNews } from "../../../api/NewsAPI";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/**
 * Component tạo tin tức mới với CKEditor
 */
const NewsCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    author: "",
    image: ""
  });
  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  // CKEditor configuration
  const editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'bulletedList',
      'numberedList',
      'blockQuote',
      '|',
      'link',
      'insertTable',
      '|',
      'indent',
      'outdent',
      '|',
      'alignment',
      '|',
      'undo',
      'redo'
    ],
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
      ]
    },
    placeholder: "Nhập nội dung chi tiết của tin tức...",
    language: 'vi'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleEditorChange = (event: any, editor: any) => {
    const data = editor.getData();
    setForm(prev => ({ ...prev, content: data }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setError(null);
      
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh hợp lệ (jpg, png, gif, webp...)');
        return;
      }
      
      // Kiểm tra kích thước file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File ảnh quá lớn. Vui lòng chọn file dưới 5MB.');
        return;
      }
      
      // Preview ảnh
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Convert file to Base64
      const base64 = await convertToBase64(file);
      setForm(f => ({ ...f, image: base64 }));
      
      console.log('✅ Image converted to Base64, size:', Math.round(base64.length / 1024), 'KB');
      
    } catch (err) {
      console.error('Lỗi khi xử lý ảnh:', err);
      setError('Có lỗi xảy ra khi xử lý ảnh.');
      setPreviewImage("");
      setForm(f => ({ ...f, image: "" }));
    }
  };

  // Helper function để convert file sang Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề tin tức');
      return false;
    }
    if (form.title.trim().length < 10) {
      setError('Tiêu đề phải có ít nhất 10 ký tự');
      return false;
    }
    if (!form.author.trim()) {
      setError('Vui lòng nhập tên tác giả');
      return false;
    }
    if (!form.content.trim() || form.content.trim() === '<p></p>') {
      setError('Vui lòng nhập nội dung tin tức');
      return false;
    }
    if (form.content.trim().length < 50) {
      setError('Nội dung phải có ít nhất 50 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Attempting to create news with data:', {
        title: form.title.trim(),
        author: form.author.trim(),
        contentLength: form.content.length,
        hasImage: !!form.image,
        imageSize: form.image ? Math.round(form.image.length / 1024) + 'KB' : 'No image'
      });
      
      // Chuẩn bị data
      const newsData = {
        title: form.title.trim(),
        summary: form.summary.trim() || generateSummaryFromContent(form.content),
        content: form.content.trim(),
        author: form.author.trim(),
        image: form.image || ""
      };
      
      console.log('📤 Sending data to API...');
      
      // Use the createNews API function
      const result = await createNews(newsData);
      console.log('✅ Create news success:', result);
      
      // Success notification
      const successMessage = `✅ Tạo tin tức "${newsData.title}" thành công!`;
      alert(successMessage);
      
      // Navigate back to list
      navigate("/management/news", { replace: true });
      
    } catch (err: any) {
      console.error('❌ Error creating news:', err);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.');
      } else if (err.response?.status === 413) {
        setError('Dữ liệu quá lớn (có thể do ảnh quá lớn). Vui lòng giảm kích thước ảnh.');
      } else if (err.response?.status === 422) {
        setError('Dữ liệu không đúng định dạng. Vui lòng kiểm tra lại nội dung.');
      } else if (err.response?.status === 500) {
        setError('Lỗi server nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và server.');
      } else {
        setError(err.message || 'Có lỗi không xác định xảy ra khi tạo tin tức.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate summary from content if not provided
  const generateSummaryFromContent = (content: string) => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    // Take first 200 characters
    return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
  };

  const handleCancel = () => {
    const hasData = form.title || form.content || form.author || form.summary || form.image;
    if (hasData) {
      if (window.confirm("Bạn có chắc muốn hủy? Tất cả dữ liệu đã nhập sẽ bị mất.")) {
        navigate("/management/news");
      }
    } else {
      navigate("/management/news");
    }
  };

  const removeImage = () => {
    setPreviewImage("");
    setForm(f => ({ ...f, image: "" }));
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="main-content" style={{ 
      marginLeft: 'calc(var(--sidebar-width, 250px) + 10px)',
      padding: "28px", 
      minHeight: "100vh",
      transition: 'margin-left 0.3s ease'
    }}>
      <div className="container-fluid">
        <div className="card shadow rounded-4 border-0 mb-4" style={{ background: '#fff' }}>
          {/* Header */}
          <div className="card-header bg-gradient-primary text-white rounded-top-4 p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1 fw-bold">
                  <i className="fas fa-plus-circle me-2"></i>
                  Thêm tin tức mới
                </h4>
                <small className="opacity-75">Tạo và đăng tải tin tức mới cho website</small>
              </div>
              <button 
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={handleCancel}
                type="button"
                disabled={loading}
              >
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <div>{error}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="row g-4">
              {/* Title */}
              <div className="col-md-8">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-heading text-primary"></i>
                  Tiêu đề tin tức <span className="text-danger">*</span>
                </label>
                <input 
                  name="title" 
                  className="form-control form-control-lg" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Nhập tiêu đề hấp dẫn cho tin tức..."
                  required 
                  disabled={loading}
                  maxLength={200}
                />
                <div className="form-text d-flex justify-content-between">
                  <span>Tiêu đề nên có ít nhất 10 ký tự</span>
                  <span className={form.title.length > 180 ? 'text-warning' : 'text-muted'}>
                    {form.title.length}/200
                  </span>
                </div>
              </div>

              {/* Author */}
              <div className="col-md-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-user text-primary"></i>
                  Tác giả <span className="text-danger">*</span>
                </label>
                <input 
                  name="author" 
                  className="form-control form-control-lg" 
                  value={form.author} 
                  onChange={handleChange} 
                  placeholder="Tên tác giả..."
                  required 
                  disabled={loading}
                  maxLength={100}
                />
              </div>

              {/* Summary */}
              <div className="col-12">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-pen text-primary"></i>
                  Tóm tắt
                </label>
                <textarea 
                  name="summary" 
                  className="form-control" 
                  rows={3} 
                  value={form.summary} 
                  onChange={handleChange} 
                  placeholder="Nhập tóm tắt ngắn gọn về nội dung tin tức (không bắt buộc)..."
                  disabled={loading}
                  maxLength={500}
                />
                <div className="form-text d-flex justify-content-between">
                  <span>Nếu để trống, hệ thống sẽ tự động tạo tóm tắt từ nội dung</span>
                  <span className={form.summary.length > 450 ? 'text-warning' : 'text-muted'}>
                    {form.summary.length}/500
                  </span>
                </div>
              </div>

              {/* Content with CKEditor */}
              <div className="col-12">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-file-alt text-primary"></i>
                  Nội dung tin tức <span className="text-danger">*</span>
                </label>
                <div className="border rounded p-2" style={{ minHeight: '400px' }}>
                  <CKEditor
                    editor={ClassicEditor}
                    config={editorConfig}
                    data={form.content}
                    onChange={handleEditorChange}
                    onReady={(editor) => {
                      setEditorReady(true);
                      console.log('✅ CKEditor is ready!', editor);
                    }}
                    onError={(error, { willEditorRestart }) => {
                      console.error('❌ CKEditor error:', error);
                      if (willEditorRestart) {
                        console.log('🔄 CKEditor will restart...');
                      }
                    }}
                    disabled={loading}
                  />
                </div>
                <div className="form-text">
                  <i className="fas fa-info-circle me-1"></i>
                  Sử dụng trình soạn thảo để định dạng nội dung một cách chuyên nghiệp
                </div>
              </div>

              {/* Image Upload */}
              <div className="col-12">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-image text-primary"></i>
                  Ảnh đại diện
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-control" 
                  onChange={handleImageChange} 
                  disabled={loading}
                />
                <div className="form-text">
                  <i className="fas fa-info-circle me-1"></i>
                  Chọn ảnh có kích thước dưới 5MB. Khuyến nghị: JPG, PNG với tỷ lệ 16:9
                </div>

                {/* Image Preview */}
                {previewImage && (
                  <div className="mt-3">
                    <div className="position-relative d-inline-block">
                      <img 
                        src={previewImage} 
                        alt="preview" 
                        className="img-thumbnail shadow-sm" 
                        style={{ maxHeight: '250px', maxWidth: '400px' }} 
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger rounded-circle position-absolute shadow"
                        style={{ top: '5px', right: '5px' }}
                        onClick={removeImage}
                        title="Xóa ảnh"
                        disabled={loading}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    {form.image && form.image.startsWith('data:') && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-check-circle text-success"></i>
                          <small className="text-success">
                            Ảnh đã sẵn sàng ({Math.round(form.image.length / 1024)}KB)
                          </small>
                        </div>
                        {form.image.length > 1000000 && (
                          <div className="mt-1">
                            <small className="text-warning d-flex align-items-center gap-1">
                              <i className="fas fa-exclamation-triangle"></i>
                              Ảnh hơi lớn, có thể ảnh hưởng đến tốc độ tải trang
                            </small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="col-12">
                <hr className="my-4" />
                <div className="d-flex justify-content-end gap-3">
                  <button 
                    type="button"
                    className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center gap-2"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg px-4 fw-semibold d-flex align-items-center gap-2" 
                    disabled={loading || !editorReady}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Tạo tin tức
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom Styles for CKEditor */}
      <style>{`
        .ck-editor__editable {
          min-height: 300px !important;
        }
        .ck-editor__editable_inline {
          border: none !important;
        }
        .ck.ck-editor__main > .ck-editor__editable {
          background: #fafbfc;
          border-radius: 8px;
          padding: 20px;
        }
        .ck.ck-content blockquote {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px 20px;
          margin: 20px 0;
          font-style: italic;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
        }
        .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default NewsCreate;