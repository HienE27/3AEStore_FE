import { apiClient } from "./apiClient";


export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Tạo FormData object để gửi file
    const formData = new FormData();
    formData.append('file', file);

    // Gửi request upload
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Trả về URL của ảnh đã upload
    return response.data.url;
  } catch (error) {
    console.error('Lỗi khi upload ảnh:', error);
    throw error;
  }
};