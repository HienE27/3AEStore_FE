
// import axios from "axios";
// import CategoryModel from '../models/CategoryModel';
// import { my_request } from "./Request";

// const API_BASE_URL = 'http://localhost:8080/api'; // Add this line or import from your config

// // Lấy tất cả danh mục (categories)
// export async function fetchCategories(): Promise<CategoryModel[]> {
//   const url = 'http://localhost:8080/categories';
//   const data = await my_request(url);
//   const raw = data._embedded?.categories ?? [];
//   return raw.map((item: any) => new CategoryModel(item));
// }



// // Lấy danh mục theo ID
// export async function fetchCategoryById(id: string): Promise<CategoryModel | null> {
//   try {
//     const data = await my_request(`http://localhost:8080/api/categories/${id}`);
//     return new CategoryModel(data);
//   } catch (error) {
//     console.error("Không tìm thấy danh mục:", error);
//     return null;
//   }
// }

// // Xóa danh mục theo ID
// export async function deleteCategoryById(id: string): Promise<void> {
//   try {
//     await fetch(`http://localhost:8080/api/categories/${id}`, {
//       method: 'DELETE',
//     });
//   } catch (error) {
//     console.error("Lỗi xóa danh mục:", error);
//     throw error;
//   }
// }

// // Lấy tất cả sản phẩm theo danh mục ID
// export const fetchProductsByCategoryId = async (categoryId: string) => {
//   const url = 'http://localhost:8080/products'; 
//   const allProducts = await my_request(url);

//   // Lọc sản phẩm theo categoryId
//   const filtered = allProducts.filter((p: any) => p.categoryId === categoryId);
//   return filtered;
// };

import axios from "axios";
import CategoryModel from '../models/CategoryModel';
import { my_request } from "./Request";

const API_BASE_URL = 'http://localhost:8080/api'; // Add this line or import from your config

// Lấy tất cả danh mục (categories)
export async function fetchCategories(): Promise<CategoryModel[]> {
  const url = 'http://localhost:8080/categories';
  const data = await my_request(url);
  const raw = data._embedded?.categories ?? [];
  return raw.map((item: any) => new CategoryModel(item));
}



// Lấy danh mục theo ID
export async function fetchCategoryById(id: string): Promise<CategoryModel | null> {
  try {
    const data = await my_request(`http://localhost:8080/api/categories/${id}`);
    return new CategoryModel(data);
  } catch (error) {
    console.error("Không tìm thấy danh mục:", error);
    return null;
  }
}

// Xóa danh mục theo ID
export async function deleteCategoryById(id: string): Promise<void> {
  try {
    await fetch(`http://localhost:8080/api/categories/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    throw error;
  }
}

// Lấy tất cả sản phẩm theo danh mục ID
export const fetchProductsByCategoryId = async (categoryId: string) => {
  const url = `http://localhost:8080/api/products/by-category/${categoryId}`;
  const products = await my_request(url);
  return products;
};

