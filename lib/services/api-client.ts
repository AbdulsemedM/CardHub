'use client';

// API Client - TEMPORARY: force dev tunnel for testing (overrides env so deployed site uses it)
// const PRODUCTION_BASE_URL = 'https://cardhub.coopbankoromiasc.com';
const TEST_BASE_URL = 'https://1jrrz730-8041.uks1.devtunnels.ms';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    // Use test URL for now; restore: process.env.NEXT_PUBLIC_API_BASE_URL || PRODUCTION_BASE_URL
    this.baseURL = TEST_BASE_URL;
  }

  private getUrl(endpoint: string): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${path}`;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get staff token first, then admin token
    const staffToken = localStorage.getItem('staff_token');
    if (staffToken) return staffToken;
    
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) return adminToken;
    
    return null;
  }

  private clearAuthAndRedirectToLogin(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('staff_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_role');
    window.location.href = '/api/auth/session-expired';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = (errorData as Record<string, string>).error_message
          ?? (errorData as Record<string, string>).message
          ?? (errorData as Record<string, string>).error
          ?? errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      // 401 Unauthorized (e.g. token expired): clear auth and redirect to login
      if (response.status === 401) {
        this.clearAuthAndRedirectToLogin();
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'GET',
      headers,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(this.getUrl(endpoint), {
      method: 'DELETE',
      headers,
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
