/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

// Get API URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://kalasetu-backend-xxxxx-uc.a.run.app' // Update with your Cloud Run URL
    : 'http://localhost:5000'); // Default to localhost for development

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    signup: `${API_BASE_URL}/api/auth/signup`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    verify: `${API_BASE_URL}/api/auth/verify`,
  },
  
  // Products
  products: {
    list: `${API_BASE_URL}/api/products`,
    get: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    create: `${API_BASE_URL}/api/products`,
    update: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  },
  
  // Artisans
  artisans: {
    list: `${API_BASE_URL}/api/artisans`,
    get: (id: string) => `${API_BASE_URL}/api/artisans/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/artisans/${id}`,
    profile: (id: string) => `${API_BASE_URL}/api/artisans/${id}/profile`,
  },
  
  // Upload
  upload: {
    image: `${API_BASE_URL}/api/upload/image`,
    product: `${API_BASE_URL}/api/upload/product`,
  },
  
  // Cart & Orders
  cart: {
    get: `${API_BASE_URL}/api/cart`,
    add: `${API_BASE_URL}/api/cart/add`,
    update: `${API_BASE_URL}/api/cart/update`,
    remove: (id: string) => `${API_BASE_URL}/api/cart/${id}`,
    clear: `${API_BASE_URL}/api/cart/clear`,
  },
  
  orders: {
    list: `${API_BASE_URL}/api/orders`,
    get: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
    create: `${API_BASE_URL}/api/orders`,
  },
  
  // Health check
  health: `${API_BASE_URL}/health`,
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

