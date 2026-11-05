export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED', // 400 — DTO validation
  INVALID_CURSOR = 'INVALID_CURSOR', // 400 — undecodable pagination cursor
  SITE_NOT_FOUND = 'SITE_NOT_FOUND', // 404
  PERSON_NOT_FOUND = 'PERSON_NOT_FOUND', // 404
  ADDRESS_TAKEN = 'ADDRESS_TAKEN', // 409 — publish to an existing address
  NOT_FOUND = 'NOT_FOUND', // 404 — unknown route
  INTERNAL_ERROR = 'INTERNAL_ERROR', // 500 — anything unexpected
}

/** The body of every error response. `details` appears only for VALIDATION_FAILED. */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: { field: string; message: string }[];
  };
}
