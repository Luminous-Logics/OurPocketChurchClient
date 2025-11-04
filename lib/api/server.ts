/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/server.ts
/**
 * SERVER-SIDE API HELPERS
 * Use these ONLY in API route handlers (app/api/**)
 * DO NOT import in client components or shared code
 */

import { cookies } from "next/headers";
import { ApiResponse } from "@/types";
import { handleAxiosError as handleError } from "@/utils/apiHelpers";

/**
 * Server-side HTTP GET with automatic token injection from cookies
 * Use this in API route handlers
 */
export async function httpGet<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${backendUrl}${url}`, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();
    console.log(response,"res")
    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      };
    }

    // Backend already returns ApiResponse<T> format, so return it directly
    return data as ApiResponse<T>;
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Server-side HTTP POST with automatic token injection from cookies
 * Use this in API route handlers
 */
export async function httpPost<T>(
  url: string,
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${backendUrl}${url}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      };
    }

    // Backend already returns ApiResponse<T> format, so return it directly
    return data as ApiResponse<T>;
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Server-side HTTP PUT with automatic token injection from cookies
 * Use this in API route handlers
 */
export async function httpPut<T>(
  url: string,
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${backendUrl}${url}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      };
    }

    // Backend already returns ApiResponse<T> format, so return it directly
    return data as ApiResponse<T>;
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Server-side HTTP DELETE with automatic token injection from cookies
 * Use this in API route handlers
 */
export async function httpDelete<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${backendUrl}${url}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      };
    }

    // Backend already returns ApiResponse<T> format, so return it directly
    return data as ApiResponse<T>;
  } catch (error) {
    throw handleError(error);
  }
}
