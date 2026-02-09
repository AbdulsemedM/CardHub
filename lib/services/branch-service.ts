import { apiClient } from './api-client';
import type {
  ApiTravelCardRequest,
  ApiRequestDetail,
  BranchReviewRequest,
  PageResponse,
} from '../types/request';

// Get pending branch reviews
export async function getPendingBranchReviews(): Promise<ApiTravelCardRequest[]> {
  try {
    return await apiClient.get<ApiTravelCardRequest[]>('/api/v1/branch/workflow/pending-reviews');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch pending reviews');
  }
}

// Get all cards for branch (paginated)
export async function getBranchCards(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ApiTravelCardRequest>> {
  try {
    return await apiClient.get<PageResponse<ApiTravelCardRequest>>(
      `/api/v1/branch/workflow/cards?page=${page}&size=${size}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch branch cards');
  }
}

// Get request detail
export async function getRequestDetail(travelCardId: number): Promise<ApiRequestDetail> {
  try {
    return await apiClient.get<ApiRequestDetail>(
      `/api/v1/branch/workflow/cards/${travelCardId}/request-detail`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch request detail');
  }
}

// Submit branch review
export async function submitBranchReview(
  review: BranchReviewRequest
): Promise<{ success: boolean; message: string }> {
  try {
    return await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/branch/workflow/review',
      review
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit review');
  }
}

// Get review history
export async function getReviewHistory(travelCardId: number): Promise<any[]> {
  try {
    return await apiClient.get<any[]>(
      `/api/v1/branch/workflow/review-history/${travelCardId}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch review history');
  }
}
