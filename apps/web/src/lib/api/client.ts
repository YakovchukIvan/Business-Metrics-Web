import { env } from '@/config/env';
import { ApiError } from './errors';
import type { ApiResponse, ApiErrorResponse } from '../types/analysis';

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
      console.error('[API] Error response:', errorData);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse error on error responses
    }
    throw new ApiError(response.status, errorMessage);
  }

  const result = (await response.json()) as ApiResponse<T>;
  console.log('[API] Raw response envelope:', result);
  console.log('[API] Parsed data:', result.data);
  return result.data;
}
