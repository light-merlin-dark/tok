export enum ErrorCode {
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  ESTIMATION_ERROR = 'ESTIMATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export class CommandError extends Error {
  code: ErrorCode;
  userMessage: string;
  details?: Record<string, any>;

  constructor(code: ErrorCode, userMessage: string, details?: Record<string, any>) {
    super(userMessage);
    this.name = 'CommandError';
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;
  }
}

export function createCommandError(
  code: ErrorCode,
  userMessage: string,
  details?: Record<string, any>
): CommandError {
  return new CommandError(code, userMessage, details);
}