// import axios from 'axios';

// export const handleAddToCart = async (customerId: string, productId: string, quantity: number = 1) => {
//   try {
//     const payload = {
//       idCustomer: customerId,
//       products: [{ productId, quantity }]
//     };

//     await axios.post('http://localhost:8080/api/cards/add-product', payload);
//     alert('✅ Đã thêm sản phẩm vào giỏ!');
//   } catch (err) {
//     console.error('❌ Lỗi khi thêm vào giỏ hàng:', err);
//     alert('❌ Không thể thêm sản phẩm vào giỏ.');
//   }
// };

import { useCart } from "../../contexts/CartContext";
import axios from "axios";

// Custom hook trả về 1 hàm để gọi khi thêm vào giỏ
export const useAddToCart = () => {
  const { refreshCartCount } = useCart();

  // Hàm xử lý thực tế, trả về để component sử dụng
  const handleAddToCart = async (
    customerId: string,
    productId: string,
    quantity: number = 1
  ) => {
    try {
      const payload = {
        idCustomer: customerId,
        products: [{ productId, quantity }],
      };
      await axios.post("http://localhost:8080/api/cards/add-product", payload);

      await refreshCartCount(); // cập nhật lại số lượng giỏ hàng

      alert("✅ Đã thêm sản phẩm vào giỏ!");
    } catch (err) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
      alert("❌ Không thể thêm sản phẩm vào giỏ.");
    }
  };

  return handleAddToCart;
};

