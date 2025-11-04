//lib/api/index.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "../axios";
import httpServer from "../axios/api";
import { trackPromise } from "react-promise-tracker";
import { ApiResponse, ErrorResponse } from "@/types";
import { handleAxiosError } from "@/utils/apiHelpers";

/**
 * HTTP GET request with automatic promise tracking
 */
export const apiGet = async <T>(
  url: string
): Promise<ApiResponse<T> | ErrorResponse> => {
  return trackPromise(
    (async () => {
      try {
        const response = await http.get<ApiResponse<T>>(url);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    })()
  );
};

/**
 * HTTP POST request with automatic promise tracking
 */
export const apiPost = async <T>(
  url: string,
  data?: object,
  config: object = {}
): Promise<ApiResponse<T> | ErrorResponse> => {
  return trackPromise(
    (async () => {
      try {
        const response = await http.post<ApiResponse<T>>(url, data, config);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    })()
  );
};

/**
 * HTTP PUT request with automatic promise tracking
 */
export const apiPut = async <T>(
  url: string,
  data?: object,
  config: object = {}
): Promise<ApiResponse<T> | ErrorResponse> => {
  return trackPromise(
    (async () => {
      try {
        const response = await http.put<ApiResponse<T>>(url, data, config);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    })()
  );
};

/**
 * HTTP PATCH request with automatic promise tracking
 */
export const apiPatch = async <T>(
  url: string,
  data?: object,
  config: object = {}
): Promise<ApiResponse<T> | ErrorResponse> => {
  return trackPromise(
    (async () => {
      try {
        const response = await http.patch<ApiResponse<T>>(url, data, config);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    })()
  );
};

/**
 * HTTP DELETE request with automatic promise tracking
 */
export const apiDelete = async <T>(
  url: string
): Promise<ApiResponse<T> | ErrorResponse> => {
  return trackPromise(
    (async () => {
      try {
        const response = await http.delete<ApiResponse<T>>(url);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    })()
  );
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Access /api routes from server components
 * API routes now return T directly (not wrapped in ApiResponse)
 */
export const httpServerGet = <T>(url: string) =>
  httpServer.get<T>(url);

/**
 * Promise tracker with loading state management
 * Wraps promises with react-promise-tracker for loading indicators
 */
export function promiseTracker<T>(promise: Promise<T>): Promise<T> {
  const trackedPromise = trackPromise(promise);

  trackedPromise.then((response) => {
    // Check if response has success property (our standardized format)
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      (response as any).success === false
    ) {
      const errorResp = response as any;

      // Handle session expiration (401 errors)
      // Check for 401 in error.statusCode (our normalized format)
      const is401Error = errorResp.error?.statusCode === 401;

      if (is401Error) {
        console.log("🔥 SESSION TIMEOUT (401) detected - clearing token");

        if (typeof window !== "undefined") {
          // Clear expired token from localStorage/sessionStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.clear();

          console.log("🔥 Redirecting to /login");
          window.location.href = "/login";
        }
      }
    }
  });

  return trackedPromise;
}
