import { NewsModel } from "../models/NewsModel";
import { apiClient } from "../shared/api/apiClient";
import { uploadImage } from "../shared/api/uploadImage";

/**
 * Lấy danh sách tin tức
 */
export const getAllNews = async (): Promise<NewsModel[]> => {
  try {
    console.log('🔍 getAllNews: Making request to /api/news');
    const response = await apiClient.get('/api/news');
    console.log('🔍 getAllNews: Response status:', response.status);
    console.log('🔍 getAllNews: Response data:', response.data);
    
    // Validate response data
    if (!Array.isArray(response.data)) {
      console.error('❌ getAllNews: Response is not array:', response.data);
      throw new Error('Invalid response format: expected array');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ getAllNews: Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

/**
 * Lấy chi tiết tin tức theo ID
 */
export const getNewsById = async (id: string | number): Promise<NewsModel> => {
  try {
    console.log('🔍 getNewsById: Making request to /api/news/' + id);
    console.log('🔍 getNewsById: ID type:', typeof id, 'Value:', id);
    
    const response = await apiClient.get(`/api/news/${id}`);
    
    console.log('🔍 getNewsById: Response status:', response.status);
    console.log('🔍 getNewsById: Response data:', response.data);
    
    if (!response.data) {
      throw new Error(`No data received for news ID ${id}`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ getNewsById: Error details:', {
      id: id,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    // Re-throw with more specific error message
    if (error.response?.status === 404) {
      throw new Error(`Tin tức với ID ${id} không tồn tại (404)`);
    } else if (error.response?.status === 500) {
      throw new Error(`Lỗi server khi lấy tin tức ID ${id} (500)`);
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định');
    }
  }
};

/**
 * Tạo mới tin tức
 */
export const createNews = async (news: Omit<NewsModel, 'id' | 'createdAt'>): Promise<NewsModel> => {
  try {
    console.log('🔍 createNews: Making request with data:', news);
    const response = await apiClient.post('/api/news', news);
    console.log('🔍 createNews: Response status:', response.status);
    console.log('🔍 createNews: Response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ createNews: Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

/**
 * Cập nhật tin tức
 */
export const updateNews = async (id: string | number, news: Omit<NewsModel, 'createdAt'>): Promise<NewsModel> => {
  try {
    console.log('🔍 updateNews: Making request to /api/news/' + id);
    console.log('🔍 updateNews: Data:', news);
    const response = await apiClient.put(`/api/news/${id}`, news);
    console.log('🔍 updateNews: Response status:', response.status);
    console.log('🔍 updateNews: Response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ updateNews: Error details:', {
      id: id,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

/**
 * Xóa tin tức
 */
export const deleteNews = async (id: string | number): Promise<void> => {
  try {
    console.log('🔍 deleteNews: Making request to /api/news/' + id);
    const response = await apiClient.delete(`/api/news/${id}`);
    console.log('🔍 deleteNews: Response status:', response.status);
  } catch (error: any) {
    console.error('❌ deleteNews: Error details:', {
      id: id,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

// Debug helper functions
export const debugApiClient = () => {
  console.log('🔧 Debug apiClient configuration:', {
    defaults: (apiClient as any).defaults,
    baseURL: (apiClient as any).defaults?.baseURL,
    timeout: (apiClient as any).defaults?.timeout,
    headers: (apiClient as any).defaults?.headers
  });
};

export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    
    // Test 1: Direct fetch to check server
    try {
      const directResponse = await fetch('http://localhost:8080/api/news');
      console.log('🧪 Direct fetch status:', directResponse.status);
      const directData = await directResponse.json();
      console.log('🧪 Direct fetch data:', directData);
      console.log('🧪 Direct fetch IDs:', directData.map((item: any) => item.id));
    } catch (directError) {
      console.error('🧪 Direct fetch failed:', directError);
    }
    
    // Test 2: Using apiClient
    try {
      const apiResponse = await apiClient.get('/api/news');
      console.log('🧪 ApiClient status:', apiResponse.status);
      console.log('🧪 ApiClient data:', apiResponse.data);
      console.log('🧪 ApiClient IDs:', apiResponse.data.map((item: any) => item.id));
    } catch (apiError) {
      console.error('🧪 ApiClient failed:', apiError);
    }
    
  } catch (error) {
    console.error('🧪 Test connection failed:', error);
  }
};

// Export uploadImage từ shared/api
export { uploadImage };