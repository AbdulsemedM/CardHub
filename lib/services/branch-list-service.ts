import { apiClient } from './api-client';
import type { BranchListItem } from '../types/branch';

// Normalize API response - backend may return array directly or wrapped
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

export async function getBranchList(): Promise<BranchListItem[]> {
  try {
    const data = await apiClient.get<unknown>('/api/v1/branch_lists');
    return normalizeToArray<BranchListItem>(data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch branches');
  }
}

export async function getBranchById(branchListId: number): Promise<BranchListItem> {
  try {
    return await apiClient.get<BranchListItem>(`/api/v1/branch_lists/${branchListId}`);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch branch');
  }
}

export async function deleteBranch(branchListId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/branch_lists/${branchListId}`);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete branch');
  }
}
