/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface CustomHttpExceptionResponse {
  message?: string | string[];
  errorCode?: string;
  errors?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as
        CustomHttpExceptionResponse | string;

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = Array.isArray(res.message)
          ? res.message.join(', ')
          : res.message || exception.message;
        errorCode = res.errorCode || this.getErrorCodeFromStatus(status);
        errors =
          res.errors || (Array.isArray(res.message) ? res.message : null);
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const dbErr = exception as {
        code: string;
        detail?: string;
        message?: string;
      };
      if (dbErr.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry detected';
        errorCode = 'DUPLICATE_ENTRY';
        errors = dbErr.detail;
      } else {
        message = dbErr.message || 'Database execution error';
      }
    }

    response.status(status).json({
      success: false,
      message,
      errorCode,
      errors,
    });
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'RESOURCE_NOT_FOUND';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
