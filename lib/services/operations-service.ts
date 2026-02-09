import { apiClient } from './api-client';
import type {
  ApiTravelCardRequest,
  ApiRequestDetail,
  OperationsReviewRequest,
  PageResponse,
} from '../types/request';

// Get pending operations reviews
export async function getPendingOperationsReviews(): Promise<ApiTravelCardRequest[]> {
  try {
    return await apiClient.get<ApiTravelCardRequest[]>(
      '/api/v1/operations/workflow/pending-reviews'
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch pending operations reviews');
  }
}

// Get all operations cards (paginated)
export async function getOperationsCards(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ApiTravelCardRequest>> {
  try {
    return await apiClient.get<PageResponse<ApiTravelCardRequest>>(
      `/api/v1/operations/workflow/cards?page=${page}&size=${size}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch operations cards');
  }
}

// Get operations head cards (paginated)
export async function getOperationsHeadCards(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ApiTravelCardRequest>> {
  try {
    return await apiClient.get<PageResponse<ApiTravelCardRequest>>(
      `/api/v1/operations/workflow/head/cards?page=${page}&size=${size}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch operations head cards');
  }
}

// Get request detail
export async function getOperationsRequestDetail(
  travelCardId: number
): Promise<ApiRequestDetail> {
  try {
    return await apiClient.get<ApiRequestDetail>(
      `/api/v1/operations/workflow/cards/${travelCardId}/request-detail`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch request detail');
  }
}

// Submit operations review
export async function submitOperationsReview(
  review: OperationsReviewRequest
): Promise<{ success: boolean; message: string }> {
  try {
    return await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/operations/workflow/review',
      review
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit operations review');
  }
}

// Get review history
export async function getOperationsReviewHistory(travelCardId: number): Promise<any[]> {
  try {
    return await apiClient.get<any[]>(
      `/api/v1/operations/workflow/review-history/${travelCardId}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch review history');
  }
}
