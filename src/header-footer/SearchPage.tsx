import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchProducts } from "../api/ProductAPI";
import ProductModel from "../models/ProductModel";
import ProductProps from "../product/components/ProductProps";

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchProducts(query)
      .then((data) => setResults(data.products))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="container py-4">
      <h2 className="mb-4">
        Kết quả tìm kiếm cho: <span className="text-primary">"{query}"</span>
      </h2>
      {loading && <p>Đang tải...</p>}
      {!loading && results.length === 0 && (
        <div className="text-center text-muted py-5">
          <i className="fa fa-search fa-3x mb-3"></i>
          <div>Không tìm thấy sản phẩm nào.</div>
        </div>
      )}
      <div className="row">
        {results.map((product) => (
          <ProductProps key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;