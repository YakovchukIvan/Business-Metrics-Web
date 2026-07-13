import { APP_FILTER, APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

export const appProviders = [
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
  { provide: APP_PIPE, useClass: GlobalValidationPipe },
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
] as const;
