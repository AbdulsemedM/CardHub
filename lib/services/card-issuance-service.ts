import { apiClient } from './api-client';
import type {
  ApiTravelCardRequest,
  ApiRequestDetail,
  CardIssuanceRequest,
  PageResponse,
} from '../types/request';

// Get approved requests ready for card issuance
export async function getApprovedRequests(): Promise<ApiTravelCardRequest[]> {
  try {
    return await apiClient.get<ApiTravelCardRequest[]>(
      '/api/v1/card-issuance/approved-requests'
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch approved requests');
  }
}

// Get all card issuance cards (paginated)
export async function getCardIssuanceCards(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ApiTravelCardRequest>> {
  try {
    return await apiClient.get<PageResponse<ApiTravelCardRequest>>(
      `/api/v1/card-issuance/cards?page=${page}&size=${size}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch card issuance cards');
  }
}

// Get request detail
export async function getCardIssuanceRequestDetail(
  travelCardId: number
): Promise<ApiRequestDetail> {
  try {
    return await apiClient.get<ApiRequestDetail>(
      `/api/v1/card-issuance/cards/${travelCardId}/request-detail`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch request detail');
  }
}

// Request card
export async function requestCard(
  request: CardIssuanceRequest
): Promise<{ success: boolean; message: string }> {
  try {
    return await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/card-issuance/request',
      request
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to request card');
  }
}

// Update card status
export async function updateCardStatus(
  travelCardId: number,
  status: string
): Promise<{ success: boolean; message: string }> {
  try {
    return await apiClient.put<{ success: boolean; message: string }>(
      `/api/v1/card-issuance/${travelCardId}/status?status=${status}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update card status');
  }
}

// Mark card as collected
export async function markCardCollected(
  travelCardId: number,
  collectedBy: string
): Promise<{ success: boolean; message: string }> {
  try {
    return await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/card-issuance/${travelCardId}/collect?collectedBy=${encodeURIComponent(
        collectedBy
      )}`
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark card as collected');
  }
}

// Get issuance info
export async function getIssuanceInfo(travelCardId: number): Promise<any> {
  try {
    return await apiClient.get<any>(`/api/v1/card-issuance/${travelCardId}`);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch issuance info');
  }
}
