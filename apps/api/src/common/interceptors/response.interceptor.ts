import { Injectable } from '@nestjs/common';
import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import type { ApiResponseEnvelope } from '../dto/res/api-response-envelope.dto';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T> | T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseEnvelope<T> | T> {
    return next.handle().pipe(
      map((val: unknown) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const statusCode = response.statusCode;

        // Skip wrapping for 204 No Content
        if (statusCode === 204) {
          return val as T;
        }

        const message = this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);

        const extraMeta = {
          path: request.url,
          timestamp: new Date().toISOString(),
        };

        // If response is already formatted with success, return it directly
        if (val && typeof val === 'object' && 'success' in val) {
          const formatted = val as ApiResponseEnvelope<T>;
          if (message && !formatted.message) {
            formatted.message = message;
          }
          formatted.meta = { ...extraMeta, ...(formatted.meta || {}) };
          return formatted;
        }

        // Check if the response already separates data and meta
        if (val && typeof val === 'object' && ('data' in val || 'meta' in val)) {
          const { data, meta, ...rest } = val as Record<string, unknown>;
          return {
            success: true,
            ...(message && { message }),
            data: (data !== undefined ? data : rest) as T,
            meta: { ...extraMeta, ...((meta as Record<string, unknown>) || {}) },
          };
        }

        return {
          success: true,
          ...(message && { message }),
          data: (val !== undefined ? val : null) as T,
          meta: extraMeta,
        };
      }),
    );
  }
}
