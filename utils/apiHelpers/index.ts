/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/apiHelpers/index.ts
/**
 * API Helper Utilities for Parish Management System
 */

import { ApiResponse, ErrorResponse } from "@/types";

// ============================================
// SUCCESS RESPONSE HELPERS
// ============================================

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message: message || "Request processed successfully",
  };
}

/**
 * Create a paginated success response
 */
export function createPaginatedResponse<T>(
  data: T,
  currentPage: number,
  pageSize: number,
  totalRecords: number,
  message?: string
): ApiResponse<T> {
  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    success: true,
    data,
    message: message || "Request processed successfully",
    pagination: {
      currentPage,
      pageSize,
      totalRecords,
      totalPages,
    },
  };
}

// ============================================
// ERROR RESPONSE HELPERS
// ============================================

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number,
  code?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      statusCode,
      code,
    },
  };
}

/**
 * Common error responses
 */
export const CommonErrors = {
  UNAUTHORIZED: (message = "Unauthorized access") =>
    createErrorResponse(message, 401, "UNAUTHORIZED"),

  FORBIDDEN: (message = "Access forbidden") =>
    createErrorResponse(message, 403, "FORBIDDEN"),

  NOT_FOUND: (message = "Resource not found") =>
    createErrorResponse(message, 404, "NOT_FOUND"),

  BAD_REQUEST: (message = "Invalid request") =>
    createErrorResponse(message, 400, "BAD_REQUEST"),

  VALIDATION_ERROR: (message = "Validation failed") =>
    createErrorResponse(message, 422, "VALIDATION_ERROR"),

  SERVER_ERROR: (message = "Internal server error") =>
    createErrorResponse(message, 500, "SERVER_ERROR"),

  SESSION_EXPIRED: (message = "Session expired. Please log in again.") =>
    createErrorResponse(message, 401, "SESSION_EXPIRED"),

  NETWORK_ERROR: (message = "Network error. Please check your connection.") =>
    createErrorResponse(message, 0, "NETWORK_ERROR"),
};

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if a response is a success response
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T> | ErrorResponse
): response is ApiResponse<T> {
  return response.success === true;
}

/**
 * Check if a response is an error response
 */
export function isErrorResponse<T>(
  response: ApiResponse<T> | ErrorResponse
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Check if error is a session expiration error
 * Treats all 401 errors as session expiration
 */
export function isSessionExpiredError(error: ErrorResponse): boolean {
  return error.error.statusCode === 401;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: ErrorResponse): boolean {
  return (
    error.error.statusCode === 422 || error.error.code === "VALIDATION_ERROR"
  );
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("error" in error && typeof error.error === "object" && error.error) {
      if ("message" in error.error && typeof error.error.message === "string") {
        return error.error.message;
      }
    }
  }

  return "An unexpected error occurred";
}

/**
 * Handle Axios error and convert to standardized ErrorResponse
 */
export function handleAxiosError(error: unknown): ErrorResponse {
  // Type guard for axios error structure
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object"
  ) {
    const axiosError = error as {
      response: {
        status?: number;
        data?: {
          success?: false;
          error?: string | { message?: string; code?: string; statusCode?: number };
          message?: string;
        };
      };
    };

    const status = axiosError.response.status || 500;
    const responseData = axiosError.response.data;

    // Check if response already has ErrorResponse format (with nested error object)
    if (
      responseData?.success === false &&
      responseData.error &&
      typeof responseData.error === "object"
    ) {
      return responseData as ErrorResponse;
    }

    // Handle backend's simple string error format: { success: false, error: "string" }
    if (
      responseData?.success === false &&
      typeof responseData.error === "string"
    ) {
      return createErrorResponse(responseData.error, status);
    }

    // Try to extract message from various possible locations
    const message =
      (typeof responseData?.error === "object"
        ? responseData?.error?.message
        : responseData?.error) ||
      responseData?.message ||
      "An error occurred";

    const code =
      typeof responseData?.error === "object"
        ? responseData?.error?.code
        : undefined;

    return createErrorResponse(message, status, code);
  }

  // Handle network errors
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.toLowerCase().includes("network")
  ) {
    return CommonErrors.NETWORK_ERROR();
  }

  // Default error
  return CommonErrors.SERVER_ERROR(extractErrorMessage(error));
}

/**
 * Generic error handler for API route handlers
 * Converts any error type to standardized ErrorResponse
 */
export function handleErrors<T>(error: unknown): ApiResponse<T> | ErrorResponse {
  // If it's already an ErrorResponse, return as is
  if (
    error &&
    typeof error === "object" &&
    "success" in error &&
    error.success === false &&
    "error" in error
  ) {
    return error as ErrorResponse;
  }

  // If it's an ApiResponse with errors array (some legacy format)
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as any).errors) &&
    (error as any).errors.length > 0
  ) {
    const legacyError = error as { errors: string[]; messages?: string[] };
    return createErrorResponse(
      legacyError.errors[0] || "An error occurred",
      500,
      "API_ERROR"
    );
  }

  // Handle Axios errors
  return handleAxiosError(error);
}

// ============================================
// URL BUILDING UTILITIES
// ============================================

/**
 * Build URL from template by replacing parameters
 * @param template - URL template with :param placeholders
 * @param params - Object containing parameter values
 * @returns Built URL with parameters replaced
 *
 * @example
 * buildUrl('/families/parish/:parishId', { parishId: 123 })
 * // Returns: '/families/parish/123'
 */
export function buildUrl(
  template: string,
  params: Record<string, string | number>
): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`:${key}`, String(value)),
    template
  );
}
