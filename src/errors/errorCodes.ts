export const ErrorCodes = {
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    status: 409,
    message: 'User with this email already exists',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    status: 401,
    message: 'Invalid email or password',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    status: 401,
    message: 'Token has expired',
  },
  TOKEN_REVOKED: {
    code: 'TOKEN_REVOKED',
    status: 401,
    message: 'Token has been revoked',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Unauthorized',
  },
  ACCESS_TOKEN_REQUIRED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Access token is required',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    status: 401,
    message: 'Invalid or expired token',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: 403,
    message: 'Insufficient permissions',
  },
  ORGANIZATION_NOT_FOUND: {
    code: 'ORGANIZATION_NOT_FOUND',
    status: 404,
    message: 'Organization not found',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: 'Validation failed',
  },
  PROJECT_NOT_FOUND: {
    code: 'PROJECT_NOT_FOUND',
    status: 404,
    message: 'Project not found',
  },
  TASK_NOT_FOUND: {
    code: 'TASK_NOT_FOUND',
    status: 404,
    message: 'Task not found',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    status: 404,
    message: 'User not found',
  },
  INVALID_STATUS_TRANSITION: {
    code: 'INVALID_STATUS_TRANSITION',
    status: 400,
    message: 'Invalid status transition',
  },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;
