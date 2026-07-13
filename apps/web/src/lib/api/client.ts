import { env } from '@/config/env';
import { ApiError } from './errors';
import { ApiResponse, ApiErrorResponse } from '../types/analysis';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      const errorData = (await response.json()) as ApiErrorResponse;
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse error on error responses
    }
    throw new ApiError(response.status, errorMessage);
  }

  const result = (await response.json()) as ApiResponse<T>;
  return result.data;
}
