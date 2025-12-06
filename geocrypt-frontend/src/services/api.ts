import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.geocrypt.com/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error types
export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Request interceptor type
export type RequestInterceptor = (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>;

// Response interceptor type
export type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse;

// Error interceptor type
export type ErrorInterceptor = (error: AxiosError) => Promise<never>;

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return instance;
};

// Global API instance
let apiInstance: AxiosInstance = createApiInstance();

// Request interceptors
let requestInterceptors: RequestInterceptor[] = [];
let responseInterceptors: ResponseInterceptor[] = [];
let errorInterceptors: ErrorInterceptor[] = [];

// Setup interceptors on the instance
const setupInterceptors = () => {
  // Clear existing interceptors
  const requestInterceptorIds = Object.keys(apiInstance.interceptors.request);
  const responseInterceptorIds = Object.keys(apiInstance.interceptors.response);
  
  requestInterceptorIds.forEach(id => {
    apiInstance.interceptors.request.eject(parseInt(id));
  });
  
  responseInterceptorIds.forEach(id => {
    apiInstance.interceptors.response.eject(parseInt(id));
  });

  // Add request interceptors
  apiInstance.interceptors.request.use(
    async (config) => {
      let modifiedConfig: any = config;
      
      // Apply all request interceptors
      for (const interceptor of requestInterceptors) {
        modifiedConfig = await interceptor(modifiedConfig);
      }
      
      return modifiedConfig;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptors
  apiInstance.interceptors.response.use(
    (response) => {
      let modifiedResponse = response;
      
      // Apply all response interceptors
      for (const interceptor of responseInterceptors) {
        modifiedResponse = interceptor(modifiedResponse);
      }
      
      return modifiedResponse;
    },
    async (error: AxiosError) => {
      // Apply all error interceptors
      for (const interceptor of errorInterceptors) {
        try {
          await interceptor(error);
        } catch (err) {
          console.error('Error interceptor failed:', err);
        }
      }
      
      return handleApiError(error);
    }
  );
};

// Add request interceptor
export const addRequestInterceptor = (interceptor: RequestInterceptor): number => {
  requestInterceptors.push(interceptor);
  setupInterceptors();
  return requestInterceptors.length - 1;
};

// Add response interceptor
export const addResponseInterceptor = (interceptor: ResponseInterceptor): number => {
  responseInterceptors.push(interceptor);
  setupInterceptors();
  return responseInterceptors.length - 1;
};

// Add error interceptor
export const addErrorInterceptor = (interceptor: ErrorInterceptor): number => {
  errorInterceptors.push(interceptor);
  setupInterceptors();
  return errorInterceptors.length - 1;
};

// Remove interceptor
export const removeInterceptor = (type: 'request' | 'response' | 'error', index: number): void => {
  switch (type) {
    case 'request':
      requestInterceptors.splice(index, 1);
      break;
    case 'response':
      responseInterceptors.splice(index, 1);
      break;
    case 'error':
      errorInterceptors.splice(index, 1);
      break;
  }
  setupInterceptors();
};

// Handle API errors
const handleApiError = (error: AxiosError): Promise<never> => {
  let errorMessage = 'An unexpected error occurred';
  let statusCode: number | undefined;
  let errorCode: string | undefined;
  let errorDetails: any;

  if (error.response) {
    // Server responded with error
    statusCode = error.response.status;
    const responseData = error.response.data as any;
    
    errorMessage = responseData?.message || error.message;
    errorCode = responseData?.code;
    errorDetails = responseData?.details;

    // Handle specific status codes
    switch (statusCode) {
      case 400:
        errorMessage = responseData?.message || 'Bad request';
        break;
      case 401:
        errorMessage = 'Session expired. Please login again.';
        // Clear auth tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirect to login
        window.dispatchEvent(new CustomEvent('auth-expired'));
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action';
        break;
      case 404:
        errorMessage = 'Resource not found';
        break;
      case 422:
        errorMessage = 'Validation failed';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorMessage = 'Internal server error';
        break;
      case 503:
        errorMessage = 'Service temporarily unavailable';
        break;
    }
  } else if (error.request) {
    // Request made but no response
    errorMessage = 'Network error. Please check your connection.';
  }

  const apiError = new ApiError(errorMessage, statusCode, errorCode, errorDetails);
  
  // Show error toast for non-401 errors
  if (statusCode !== 401) {
    toast.error(errorMessage);
  }

  return Promise.reject(apiError);
};

// Set authentication token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiInstance.defaults.headers.common['Authorization'];
  }
};

// Clear authentication token
export const clearAuthToken = (): void => {
  delete apiInstance.defaults.headers.common['Authorization'];
};

// API methods
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiInstance.get<ApiResponse<T>>(url, config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiInstance.post<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiInstance.put<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiInstance.patch<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiInstance.delete<ApiResponse<T>>(url, config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    try {
      const response = await apiInstance.post<ApiResponse<T>>(url, formData, config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url: string, config?: AxiosRequestConfig): Promise<Blob> => {
    try {
      const response = await apiInstance.get(url, {
        ...config,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel token source
  createCancelTokenSource: () => {
    return axios.CancelToken.source();
  },
};

// Initialize API with auth token if exists
export const initializeApi = (): void => {
  const token = localStorage.getItem('access_token');
  if (token) {
    setAuthToken(token);
  }

  // Setup default error interceptor for 401
  addErrorInterceptor(async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Dispatch event for auth expiration
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    throw error;
  });

  // Setup request interceptor for adding auth token
  addRequestInterceptor(async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  });

  // Setup response interceptor for handling pagination
  addResponseInterceptor((response) => {
    if (response.data && typeof response.data === 'object') {
      // Check if response has pagination structure
      if (response.data.items !== undefined && response.data.total !== undefined) {
        response.data = {
          success: true,
          data: response.data,
          timestamp: new Date().toISOString(),
        };
      }
    }
    return response;
  });
};

// Re-initialize API (useful after login/logout)
export const reinitializeApi = (): void => {
  apiInstance = createApiInstance();
  requestInterceptors = [];
  responseInterceptors = [];
  errorInterceptors = [];
  initializeApi();
};

// Export initialized API
export default api;