import { HttpStatus, Injectable } from '@nestjs/common';
import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';
import type { ApiResponseEnvelope } from '../dto/res/api-response-envelope.dto';
import { isMetaEnvelope } from '../responses/with-meta';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseEnvelope<T> | T> {
    return next.handle().pipe(
      map((val) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (response.statusCode === Number(HttpStatus.NO_CONTENT)) {
          return val;
        }

        const baseMeta = { path: request.url, timestamp: new Date().toISOString() };

        if (isMetaEnvelope(val)) {
          return { success: true, data: val.data as T, meta: { ...baseMeta, ...val.meta } };
        }

        return { success: true, data: (val ?? null) as T, meta: baseMeta };
      }),
    );
  }
}
