import { ErrorCode } from '@smallweb/shared';

export type ErrorDetail = { field: string; message: string };

// The one error type our code throws. AllExceptionsFilter turns it into the error JSON.
// Example: throw new AppError(ErrorCode.SITE_NOT_FOUND, 404, `No site at ${address}`);
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
  }
}
