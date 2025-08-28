import ProductModel from "../models/ProductModel";
import { my_request } from "./Request";
import axios from 'axios';

const BASE_URL = "http://localhost:8080"; 

interface ProductApiResponse {
  _embedded: {
    products: any[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface ProductListResult {
  products: ProductModel[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

// Hàm lấy danh sách sản phẩm theo URL (có phân trang)
async function fetchProductList(url: string): Promise<ProductListResult> {
  const response: ProductApiResponse = await my_request(url);

  const rawProducts = response._embedded?.products ?? [];
  if (!Array.isArray(rawProducts)) {
    throw new Error("Dữ liệu trả về không phải là danh sách sản phẩm");
  }

  const products = rawProducts.map((item) => new ProductModel(item));

  return {
    products,
    totalPages: response.page?.totalPages || 0,
    totalElements: response.page?.totalElements || 0,
    currentPage: response.page?.number || 0,
  };
}

// Lấy tất cả sản phẩm (mặc định phân trang page 0, size 20)
export async function getAllProducts(
  page: number = 0,
  size: number = 20
): Promise<ProductListResult> {
  const url = `http://localhost:8080/products?page=${page}&size=${size}`;
  return fetchProductList(url);
}

// Lấy 3 sản phẩm mới nhất
// export async function get3LatestProducts(): Promise<ProductListResult> {
//   const url = `http://localhost:8080/products?sort=createdAt,desc&page=0&size=3`;
//   return fetchProductList(url);
// }


export async function fetchProductById(productId: string): Promise<ProductModel> {
  const url = `http://localhost:8080/products/${productId}`;
  const rawProduct = await my_request(url);
  return new ProductModel(rawProduct);
}


export const fetchProductsByCategory = async (categoryId: string): Promise<ProductModel[]> => {
  // Giả sử backend của bạn expose endpoint như này:
  // GET /categories/{id}/products
  const res = await axios.get<{ _embedded?: { products: ProductModel[] } }>(
    `${BASE_URL}/categories/${categoryId}/products`
  );
  return res.data._embedded?.products || [];
};


// Tìm kiếm sản phẩm theo tên (có thể tùy chỉnh phân trang)
export async function searchProducts(
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<ProductListResult> {
  const url = `http://localhost:8080/products/search/findByProductNameContaining?productName=${encodeURIComponent(
    keyword
  )}&page=${page}&size=${size}`;
  return fetchProductList(url);
}

// CategoryAPI.ts (hoặc ProductAPI.ts)

export const fetchProductsByCategoryId = (categoryId: string) => {
  return axios.get(`/api/products?categoryId=${categoryId}`).then(res => res.data);
}
