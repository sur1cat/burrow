import { GraphQLError } from 'graphql';

export enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class AppError extends GraphQLError {
  constructor(
    message: string,
    code: ErrorCode,
    extensions?: Record<string, unknown>
  ) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'You must be logged in to perform this action') {
    super(message, ErrorCode.UNAUTHENTICATED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, ErrorCode.NOT_FOUND);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, ErrorCode.VALIDATION_ERROR, field ? { field } : undefined);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT);
  }
}

export function handleMongooseError(error: unknown): never {
  if (error instanceof Error) {
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }
    if (error.name === 'CastError') {
      throw new ValidationError('Invalid ID format');
    }
    if ((error as { code?: number }).code === 11000) {
      const match = error.message.match(/dup key: { (\w+):/);
      const field = match ? match[1] : 'field';
      throw new ConflictError(`${field} already exists`);
    }
    throw new AppError(error.message, ErrorCode.INTERNAL_ERROR);
  }
  throw new AppError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR);
}
