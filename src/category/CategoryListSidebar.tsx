import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCategories } from '../api/CategoryAPI';
import CategoryModel from '../models/CategoryModel';

const CategoryListSidebar: React.FC = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="bg-white border">
      {/* Tiêu đề */}
      <div
  className="px-3 py-2 d-flex justify-content-center align-items-center"
  style={{
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '15px',
    borderBottom: '2px solid #f26522',
  }}
>
  Thể loại
</div>


      {/* Danh sách thể loại */}
      <ul className="list-unstyled m-0">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              to={`/category/${cat.id}`}
              className={`d-block px-3 py-2 text-decoration-none ${
                id === cat.id ? 'fw-bold text-primary' : 'text-dark'
              }`}
            >

              {cat.categoryName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryListSidebar;
