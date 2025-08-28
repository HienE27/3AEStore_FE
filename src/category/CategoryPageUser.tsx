import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductModel from '../models/ProductModel';
import { fetchProductsByCategoryId, fetchCategoryById } from '../api/CategoryAPI';
import ProductProps from '../product/components/ProductProps';
import CategoryListSidebar from './CategoryListSidebar';

const CategoryPageUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [sort, setSort] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const productsPerPage = 8;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  // Sắp xếp sản phẩm dựa vào filter
  const sortedProducts = [...products];
  switch (sort) {
    case 'latest':
      sortedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'cheap':
      sortedProducts.sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0));
      break;
    case 'expensive':
      sortedProducts.sort((a, b) => (b.salePrice ?? 0) - (a.salePrice ?? 0));
      break;
  }

  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  useEffect(() => {
    if (!id) return;

    // Lấy sản phẩm theo category id
    fetchProductsByCategoryId(id)
      .then(data => {
        const mapped = data.map((item: any) => new ProductModel(item));
        setProducts(mapped);
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(console.error);

    // Lấy tên danh mục
    fetchCategoryById(id)
      .then(cat => {
        if (cat) setCategoryName(cat.categoryName);
      })
      .catch(console.error);
  }, [id]);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar danh mục */}
        <div className="col-md-3">
          <CategoryListSidebar />
        </div>

        {/* Danh sách sản phẩm */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">{categoryName || 'Danh mục'}</h5>
            <select
              className="form-select w-auto"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="latest">Mới nhất</option>
              <option value="cheap">Giá thấp nhất</option>
              <option value="expensive">Giá cao nhất</option>
            </select>
          </div>

          <div className="row">
            {currentProducts.length === 0 ? (
              <div className="text-muted">Không có sản phẩm nào.</div>
            ) : (
              currentProducts.map((product) => (
                <ProductProps key={product.id} product={product} />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => changePage(currentPage - 1)}>«</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => changePage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => changePage(currentPage + 1)}>»</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPageUser;
