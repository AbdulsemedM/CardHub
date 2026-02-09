import { apiClient } from './api-client';
import type {
  BankStaff,
  InitializeAdminRequest,
  InitializeAdminResponse,
  RegisterStaffRequest,
  RegisterStaffResponse,
  UpdateStaffRequest,
} from '../types/user';

// Normalize API response - backend may return array directly or wrapped (e.g. { content: [...] })
function normalizeToArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

// Initialize first admin user
export async function initializeAdmin(
  data: InitializeAdminRequest
): Promise<InitializeAdminResponse> {
  try {
    return await apiClient.post<InitializeAdminResponse>('/api/v1/admin/initialize', data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to initialize admin');
  }
}

// Register bank staff
export async function registerBankStaff(
  data: RegisterStaffRequest
): Promise<RegisterStaffResponse> {
  try {
    return await apiClient.post<RegisterStaffResponse>('/api/v1/admin/bank-staff/register', data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to register bank staff');
  }
}

// Get all bank staff
export async function getAllBankStaff(): Promise<BankStaff[]> {
  try {
    const data = await apiClient.get<unknown>('/api/v1/admin/bank-staff');
    return normalizeToArray<BankStaff>(data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch bank staff');
  }
}

// Get bank staff by ID
export async function getBankStaffById(staffId: number): Promise<BankStaff> {
  try {
    return await apiClient.get<BankStaff>(`/api/v1/admin/bank-staff/${staffId}`);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch bank staff');
  }
}

// Update bank staff
export async function updateBankStaff(
  staffId: number,
  data: UpdateStaffRequest
): Promise<BankStaff> {
  try {
    return await apiClient.put<BankStaff>(`/api/v1/admin/bank-staff/${staffId}`, data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update bank staff');
  }
}

// Deactivate bank staff
export async function deactivateBankStaff(staffId: number): Promise<{
  success: boolean;
  message: string;
  staffId: number;
  email: string;
  isActive: boolean;
}> {
  try {
    return await apiClient.delete(`/api/v1/admin/bank-staff/${staffId}`);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to deactivate bank staff');
  }
}
