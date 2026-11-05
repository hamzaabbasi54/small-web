import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiErrorBody, ErrorCode } from '@smallweb/shared';
import { AppError } from './app-error';

const MONGO_DUPLICATE_KEY = 11000;

// Catches every error thrown while handling a request and sends the one error shape:
// { error: { code, message, details? } }. This is the only place error responses are built.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const error = this.toAppError(exception);

    const body: ApiErrorBody = {
      error: { code: error.code, message: error.message, details: error.details },
    };
    response.status(error.status).json(body);
  }

  private toAppError(exception: unknown): AppError {
    // 1. Our own errors, including validation errors (see the ValidationPipe in main.ts).
    if (exception instanceof AppError) {
      return exception;
    }

    // 2. Errors Nest throws itself: an unknown route (404) or an unreadable body such as broken JSON (400).
    if (exception instanceof NotFoundException) {
      return new AppError(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, 'Not found');
    }
    if (exception instanceof BadRequestException) {
      return new AppError(
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        'Request validation failed',
      );
    }

    // 3. Safety net: a duplicate address that a service didn't translate already.
    if (isDuplicateKeyError(exception)) {
      return new AppError(ErrorCode.ADDRESS_TAKEN, HttpStatus.CONFLICT, 'Address already taken');
    }

    // 4. Anything else is a bug. Log the details for us; send the client a generic message only.
    const stack = exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(stack);
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong',
    );
  }
}

function isDuplicateKeyError(exception: unknown): boolean {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'code' in exception &&
    exception.code === MONGO_DUPLICATE_KEY
  );
}
