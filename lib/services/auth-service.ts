import { apiClient } from './api-client';
import type { AdminLoginResponse, StaffLoginRequest, StaffLoginResponse } from '../types/user';

export async function loginAdmin(
  username: string,
  password: string
): Promise<AdminLoginResponse> {
  try {
    const response = await apiClient.post<AdminLoginResponse>('/login', {
      username,
      password,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', response.access_token);
      localStorage.setItem('user_type', 'admin');
    }

    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Invalid username or password');
  }
}

export async function loginBankStaff(
  identifier: string,
  password: string,
  deviceInfo?: Pick<StaffLoginRequest, 'modelId' | 'modelName' | 'deviceName' | 'pushToken'>
): Promise<StaffLoginResponse> {
  try {
    const body: StaffLoginRequest = { identifier, password, ...deviceInfo };
    const response = await apiClient.post<StaffLoginResponse>('/api/v1/auth/ldap-login', body);

    if (typeof window !== 'undefined') {
      localStorage.setItem('staff_token', response.token);
      localStorage.setItem('user_type', 'bank_staff');
      localStorage.setItem('user_role', response.role);
    }

    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const token = getStoredToken();
      if (token) {
        await apiClient.post('/api/v1/auth/logout', undefined);
      }
    } catch {
      // Continue with local cleanup even if backend logout fails
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('staff_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_role');
    }
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;

  const staffToken = localStorage.getItem('staff_token');
  if (staffToken) return staffToken;

  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) return adminToken;

  return null;
}

export function getUserType(): 'admin' | 'bank_staff' | null {
  if (typeof window === 'undefined') return null;
  const type = localStorage.getItem('user_type');
  return type as 'admin' | 'bank_staff' | null;
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_role');
}
