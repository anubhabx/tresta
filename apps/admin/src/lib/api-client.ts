import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { toast } from 'sonner';

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get Clerk token from window if available (client-side only)
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore - Clerk is available on window
        const token = await window.Clerk?.session?.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }

    // Note: X-Request-ID is added by the server middleware, not client-side

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { message?: string; code?: string } }>) => {
    // Handle different error scenarios
    if (error.response) {
      const status = error.response.status;
      const errorMessage =
        error.response.data?.error?.message || 'An error occurred';

      switch (status) {
        case 401:
          // Unauthorized - redirect to sign-in
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
          toast.error('Session expired. Please sign in again.');
          break;

        case 403:
          // Forbidden - redirect to unauthorized
          if (typeof window !== 'undefined') {
            window.location.href = '/unauthorized';
          }
          toast.error('Access denied. Admin privileges required.');
          break;

        case 404:
          toast.error('Resource not found');
          break;

        case 429:
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Helper function to create API client with auth (for server components)
export async function createApiClient(token?: string): Promise<AxiosInstance> {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 30000,
  });

  return client;
}
