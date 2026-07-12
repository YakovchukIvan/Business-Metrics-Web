import { Injectable } from '@nestjs/common';
import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponseEnvelope } from '../dto/res/api-response-envelope.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map((val: unknown) => {
        // If response is already formatted with success, return it directly
        if (val && typeof val === 'object' && 'success' in val) {
          return val as ApiResponseEnvelope<T>;
        }

        // Check if the response already separates data and meta
        if (val && typeof val === 'object' && ('data' in val || 'meta' in val)) {
          const { data, meta, ...rest } = val as Record<string, unknown>;
          return {
            success: true,
            data: (data !== undefined ? data : rest) as T,
            meta: (meta as Record<string, unknown>) || {},
          };
        }

        return {
          success: true,
          data: (val !== undefined ? val : null) as T,
          meta: {},
        };
      }),
    );
  }
}
