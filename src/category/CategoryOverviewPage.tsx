import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../api/ProductAPI';
import ProductModel from '../models/ProductModel';
import ProductProps from '../product/components/ProductProps';
import CategoryListSidebar from './CategoryListSidebar';

const CategoryOverviewPage: React.FC = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<string>('latest');
  const productsPerPage = 8;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const sortedProducts = [...products];

  switch (sort) {
    case 'latest':
      sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'cheap':
      sortedProducts.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
      break;
    case 'expensive':
      sortedProducts.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
      break;
    default:
      break;
  }

  const currentSortedProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  useEffect(() => {
    getAllProducts()
      .then(result => setProducts(result.products))
      .catch(console.error);
  }, []);

  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <CategoryListSidebar />
        </div>

        {/* Main Content */}
        <main className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0">Tất cả sản phẩm</h4>
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
            {currentSortedProducts.length === 0 ? (
              <div className="text-muted">Không có sản phẩm nào.</div>
            ) : (
              currentSortedProducts.map((product) => (
                <ProductProps key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Pagination */}
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
        </main>
      </div>
    </div>
  );
};

export default CategoryOverviewPage;
