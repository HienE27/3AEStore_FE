import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryModel from '../models/CategoryModel';
import { fetchCategories } from '../api/CategoryAPI';


const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar trống để giữ layout nhất quán */}
        <div className="col-md-3">
          <div className="bg-white border p-3">
            <h6 className="text-muted">Danh mục</h6>
          </div>
        </div>

        {/* Danh sách danh mục */}
        <div className="col-md-9">
          <h5 className="fw-bold mb-4">Tất cả danh mục</h5>
          <div className="row">
            {categories.map((cat) => (
              <div className="col-md-4 mb-3" key={cat.id}>
                <div className="card h-100">
                  <Link to={`/category/${cat.id}`} className="text-decoration-none text-dark">
                    <img
                      src={cat.image || '/images/default-category.jpg'}
                      className="card-img-top"
                      alt={cat.categoryName}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                    <div className="card-body text-center">
                      <h6 className="card-title">{cat.categoryName}</h6>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListPage;
