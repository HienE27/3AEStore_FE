import { isTokenExpired } from "../utils/JwtService";

export async function my_request(endpoint: string) {
   const response = await fetch(endpoint);

   if (!response.ok) {
      throw new Error(`Không thể truy cập ${endpoint}`);
   }

   return response.json();
}

export async function requestAdmin(endpoint: string) {
   const token = localStorage.getItem("token");

   if (!token) {
      // Không có token -> không thực hiện gọi API có bảo vệ
      throw new Error('Chưa đăng nhập');
   }

   if (isTokenExpired(token)) {
      // Token đã hết hạn -> không gọi API, có thể xử lý logout ở chỗ gọi hàm này
      throw new Error('Token đã hết hạn');
   }

   const response = await fetch(endpoint, {
      method: "GET",
      headers: {
         Authorization: `Bearer ${token}`,
      },
   });

   if (!response.ok) {
      throw new Error(`Không thể truy cập ${endpoint}`);
   }

   return response.json();
}
