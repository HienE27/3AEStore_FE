import axios from 'axios';

// 🔥 CRITICAL FIX: Ensure correct baseURL
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Must be port 8080 for Spring Boot
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// ✅ CRITICAL DEBUG
console.log('🔧 ApiClient configuration:', {
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
  headers: apiClient.defaults.headers
});

// Verify the base URL is correct
if (!apiClient.defaults.baseURL || !apiClient.defaults.baseURL.includes('8080')) {
  console.error('❌ CRITICAL: ApiClient baseURL is wrong!', apiClient.defaults.baseURL);
  console.error('❌ Expected: http://localhost:8080');
  console.error('❌ Actual:', apiClient.defaults.baseURL);
}

apiClient.interceptors.request.use(
  (config) => {
    // ✅ ENHANCED DEBUG  
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('🔍 ApiClient REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullURL,
      expectedPort: fullURL.includes(':8080') ? '✅ Correct' : '❌ WRONG PORT!'
    });
    
    // Validate URL
    if (!fullURL.includes('localhost:8080')) {
      console.error('❌ CRITICAL ERROR: Request not going to Spring Boot server!');
      console.error('❌ Current URL:', fullURL);
      console.error('❌ Expected URL should contain: localhost:8080');
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ ApiClient REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ ApiClient RESPONSE SUCCESS:', {
      status: response.status,
      url: response.config.url,
      fullURL: `${response.config.baseURL}${response.config.url}`,
      dataSize: response.data ? Object.keys(response.data).length : 0
    });
    return response;
  },
  (error) => {
    const fullURL = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
    console.error('❌ ApiClient RESPONSE ERROR:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      fullURL: fullURL,
      serverRunning: error.response?.status ? 'Yes (got response)' : 'No (no response)',
      possibleCause: error.response?.status === 404 ? 'Endpoint not found' : 
                    error.code === 'ECONNREFUSED' ? 'Server not running' : 'Unknown'
    });
    
    // Don't redirect on 401 for debugging
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    
    return Promise.reject(error);
  }
);

// Export for debugging
(window as any).debugApiClient = () => {
  console.log('🔧 Debug ApiClient:', {
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
    headers: apiClient.defaults.headers
  });
};