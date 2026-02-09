import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiError extends Error {
  code?: string;
  status?: number;
  details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Map status codes to user-friendly messages
const statusMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication failed. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists or conflicts with another.',
  423: 'This account is locked. Please contact support.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service temporarily unavailable. Please try again.',
};

/**
 * Handle API errors and display appropriate messages to the user
 */
export function handleApiError(error: any, context?: string): void {
  console.error('[API Error]', context || '', error);

  let message = 'An unexpected error occurred';

  if (error instanceof ApiError) {
    message = error.message;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.status && statusMessages[error.status]) {
    message = statusMessages[error.status];
  }

  // Add context if provided
  if (context) {
    message = `${context}: ${message}`;
  }

  toast.error(message);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Validate required fields in an object
 */
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter((field) => !data[field]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true, missing: [] };
}

/**
 * Log error to monitoring service (placeholder for future integration)
 */
export function logError(error: any, context?: string, metadata?: any): void {
  // In production, this would send to error monitoring service
  // like Sentry, Rollbar, etc.
  
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      ...metadata,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Log]', errorData);
  }

  // TODO: Send to monitoring service
}
