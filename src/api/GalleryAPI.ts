import GalleryModel from '../models/GalleryModel';
import { my_request } from './Request';


// Hàm lấy toàn bộ ảnh gallery của một sản phẩm theo productId (UUID string)
export async function getAllGalleryImagesByProductId(productId: string): Promise<GalleryModel[]> {
  // Xác định endpoint lấy gallery theo productId
  const url = `http://localhost:8080/gallerys/search/findAllByProductId?productId=${productId}`;

  // Gọi API qua hàm my_request
  const data = await my_request(url);

  // Lấy danh sách gallery từ _embedded.galleries
  const galleryList = data._embedded?.galleries;

  // Kiểm tra dữ liệu trả về có hợp lệ hay không
  if (!galleryList || !Array.isArray(galleryList)) {
    console.warn(`Không có gallery nào cho sản phẩm: ${productId}`);
    return [];
  }

  // Chuyển từng phần tử sang đối tượng GalleryModel
  return galleryList.map((item: any) => new GalleryModel(item));
}
