import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/customers";

/**
 * Gửi mã kích hoạt đến email khách hàng
 * @param email Email khách hàng
 * @returns Promise<string> thông báo từ server
 */
export async function sendActivationCode(email: string): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-activation-code`, null, {
      params: { email },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || "Gửi mã kích hoạt thất bại");
  }
}

/**
 * Kích hoạt tài khoản khách hàng với email và mã kích hoạt
 * @param email Email khách hàng
 * @param code Mã kích hoạt
 * @returns Promise<string> thông báo từ server
 */
export async function activateAccount(email: string, code: string): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/activate`, {
      params: { email, code },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || "Kích hoạt tài khoản thất bại");
  }
}
