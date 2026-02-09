// Legacy roles (kept for backward compatibility)
export type UserRole = 'branch_officer' | 'operations' | 'ops_head' | 'admin';

// New API-aligned roles for bank staff
export type StaffRole = 'BRANCH_USER' | 'OPERATIONS' | 'OPERATIONS_HEAD' | 'CARD_ISSUANCE' | 'PRINTING' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  branch?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BankStaff {
  staffId: number;
  email: string;
  username: string;
  fullName: string;
  role: {
    roleId: number;
    roleName: StaffRole;
  };
  branchName?: string;
  branchCode?: string;
  department?: string;
  city?: string;
  jobTitle?: string;
  isActive: boolean;
  createdAt: string;
  lastLoggedIn?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface StaffAuthTokens {
  token: string;
  username: string;
  email: string;
  fullName: string;
  role: StaffRole;
  message: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface StaffLoginResponse {
  token: string;
  username: string;
  email: string;
  fullName: string;
  role: StaffRole;
  message: string;
}

export interface InitializeAdminRequest {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
}

export interface InitializeAdminResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  message: string;
}

export interface RegisterStaffRequest {
  email: string;
  username: string;
  roleName: StaffRole;
  fullName?: string;
  branchName?: string;
  branchCode?: string;
}

export interface RegisterStaffResponse {
  staffId: number;
  email: string;
  username: string;
  fullName: string;
  role: StaffRole;
  message: string;
}

export interface UpdateStaffRequest {
  roleName?: StaffRole;
  fullName?: string;
  isActive?: boolean;
}

export interface AuthSession {
  user: User | BankStaff;
  token: string;
  expiresAt: number;
  userType: 'admin' | 'bank_staff';
}

