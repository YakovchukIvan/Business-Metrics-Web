import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, unknown>;
        message = typeof responseObj['message'] === 'string' ? responseObj['message'] : exception.message;
        details = responseObj['error'] || null;

        if (Array.isArray(responseObj['message'])) {
          details = responseObj['message'];
          message = 'Validation failed';
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the exception
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${statusCode} - Error: ${
        exception instanceof Error ? exception.stack || exception.message : JSON.stringify(exception)
      }`,
    );

    response.status(statusCode).json({
      success: false,
      error: {
        statusCode,
        message,
        ...(details !== null && details !== undefined ? { details } : {}),
      },
    });
  }
}
