import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNewsById, updateNews, uploadImage } from "../../../api/NewsAPI";
import { NewsModel } from "../../../models/NewsModel";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/**
 * Component chỉnh sửa tin tức
 */
const NewsEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<NewsModel | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      
      try {
        const data = await getNewsById(id);
        setForm(data);
        setPreviewImage(data.image);
      } catch (err) {
        console.error('Lỗi khi tải thông tin tin tức:', err);
        setError('Không thể tải thông tin tin tức. Vui lòng thử lại sau.');
      }
    };
    
    fetchNews();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    
    try {
      setPreviewImage(URL.createObjectURL(file));
      const url = await uploadImage(file);
      setForm({ ...form, image: url });
    } catch (err) {
      console.error('Lỗi khi upload ảnh:', err);
      setError('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updateNews(id, form);
      navigate("/management/news");
    } catch (err) {
      console.error('Lỗi khi cập nhật tin tức:', err);
      setError('Có lỗi xảy ra khi cập nhật tin tức. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading
  if (!form && !error) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2 text-muted">Đang tải thông tin tin tức...</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error && !form) {
    return (
      <div className="alert alert-danger m-4">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (!form) return null;

  return (
    <div style={{ marginLeft: '60px', padding: '24px' }}>
      <div className="card shadow border-0 rounded-4">
        <div className="card-header bg-primary text-white p-4">
          <h4 className="mb-0">
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa tin #{id}
          </h4>
        </div>
        
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="fas fa-heading me-2"></i>
                Tiêu đề
              </label>
              <input 
                name="title" 
                className="form-control" 
                value={form?.title} 
                onChange={handleChange} 
                placeholder="Nhập tiêu đề tin tức..."
                required 
                disabled={loading}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="fas fa-user me-2"></i>
                Tác giả
              </label>
              <input 
                name="author" 
                className="form-control" 
                value={form?.author} 
                onChange={handleChange} 
                placeholder="Nhập tên tác giả..."
                required 
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                <i className="fas fa-pen me-2"></i>
                Tóm tắt
              </label>
              <textarea 
                name="summary" 
                className="form-control" 
                rows={3} 
                value={form?.summary} 
                onChange={handleChange} 
                placeholder="Nhập tóm tắt nội dung..."
                required 
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                <i className="fas fa-file-alt me-2"></i>
                Nội dung
              </label>
              <div className="border rounded overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={form?.content || ''}
                  disabled={loading}
                  onReady={(editor: any) => {
                    const root = editor.editing.view.document.getRoot();
                    if (root) {
                      editor.editing.view.change((writer: any) => {
                        writer.setStyle(
                          'min-height',
                          '300px',
                          root
                        );
                      });
                    }
                  }}
                  onChange={(_event: any, editor: any) => {
                    if (!form) return;
                    const data = editor.getData();
                    setForm({ ...form, content: data });
                  }}
                  onError={(error: Error) => {
                    console.error('CKEditor error:', error);
                    setError('Có lỗi xảy ra với trình soạn thảo. Vui lòng tải lại trang.');
                  }}
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
                      'insertTable',
                      'undo',
                      'redo'
                    ],
                    language: 'vi',
                  }}
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                <i className="fas fa-image me-2"></i>
                Ảnh đại diện
              </label>
              <input 
                type="file" 
                accept="image/*" 
                className="form-control" 
                onChange={handleImageChange} 
                disabled={loading}
              />
              {previewImage && (
                <div className="mt-2 position-relative d-inline-block">
                  <img 
                    src={previewImage} 
                    alt="Preview"
                    className="rounded"
                    style={{ maxHeight: '200px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-2"
                    onClick={() => {
                      setPreviewImage("");
                      setForm(form ? { ...form, image: "" } : null);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/management/news")}
                disabled={loading}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Cập nhật
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsEdit;
