/**
 * API error handling utilities
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Create a standardized API error response
 * @param {Error|APIError} error - Error object
 * @returns {Object} Error response object
 */
export function createErrorResponse(error) {
  if (error instanceof APIError) {
    return {
      error: {
        message: error.message,
        code: error.code || 'INTERNAL_ERROR',
        statusCode: error.statusCode
      }
    };
  }

  // Handle database errors
  if (error.code && error.code.startsWith('23')) {
    // PostgreSQL constraint violation
    return {
      error: {
        message: '資料驗證失敗：請檢查輸入的資料',
        code: 'VALIDATION_ERROR',
        statusCode: 400
      }
    };
  }

  // Default error
  return {
    error: {
      message: error.message || '伺服器錯誤',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    }
  };
}

/**
 * Create a success response
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Success response object
 */
export function createSuccessResponse(data, statusCode = 200) {
  return {
    success: true,
    data,
    statusCode
  };
}

