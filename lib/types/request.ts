// Legacy status (kept for backward compatibility)
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'under_review';

// New API-aligned status values
export type ApiRequestStatus = 
  | 'PENDING_BRANCH_REVIEW'
  | 'PENDING_OPERATIONS_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CARD_REQUESTED'
  | 'PRINTING'
  | 'READY'
  | 'CARD_COLLECTED'
  | 'COMPLETED';

export interface Document {
  id: string;
  type: 'kyc' | 'passport' | 'visa';
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface AccountInfo {
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  sixMonthAverage: number;
  currentBalance: number;
  monthlyBalances: {
    month: string;
    balance: number;
  }[];
}

export interface Recommendation {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  role: string;
  status: RequestStatus;
  comment?: string;
  timestamp: string;
}

export interface AMLFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  detectedAt: string;
}

export interface TravelCardRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  travelReason: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  status: RequestStatus;
  documents: Document[];
  accountInfo: AccountInfo;
  recommendations: Recommendation[];
  history: HistoryEntry[];
  amlFlags?: AMLFlag[];
  escalatedTo?: string;
  escalatedAt?: string;
  escalationReason?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

// API-aligned interfaces
export interface BranchReviewRequest {
  travelCardId: number;
  reviewStatus: 'APPROVED' | 'REJECTED';
  recommendedAmount?: number;
  recommendationNote?: string;
  rejectionReason?: string;
}

export interface OperationsReviewRequest {
  travelCardId: number;
  reviewStatus: 'APPROVED' | 'REJECTED' | 'ESCALATED';
  amlCheck?: boolean;
  sanctionsCheck?: boolean;
  travelPolicyCompliance?: boolean;
  complianceNotes?: string;
  rejectionReason?: string;
  escalationReason?: string;
  escalatedToUserId?: number;
}

export interface CardIssuanceRequest {
  travelCardId: number;
  cardProvider: string;
  requestNotes?: string;
}

export interface ApiTravelCardRequest {
  travelCardId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  travelReason: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  requestedAmount: number;
  status: ApiRequestStatus;
  branchName?: string;
  branchCode?: string;
  submittedAt: string;
  lastUpdatedAt: string;
}

export interface ApiRequestDetail extends ApiTravelCardRequest {
  accountInfo?: AccountInfo;
  documents?: Document[];
  branchReview?: {
    reviewedBy: string;
    reviewedAt: string;
    recommendedAmount?: number;
    recommendationNote?: string;
    reviewStatus: string;
  };
  operationsReview?: {
    reviewedBy: string;
    reviewedAt: string;
    amlCheck: boolean;
    sanctionsCheck: boolean;
    travelPolicyCompliance: boolean;
    complianceNotes?: string;
    reviewStatus: string;
  };
  cardIssuance?: {
    cardProvider?: string;
    issuedAt?: string;
    cardStatus?: string;
    collectedBy?: string;
    collectedAt?: string;
  };
}

// Pagination types
export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}










