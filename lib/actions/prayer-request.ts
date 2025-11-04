// lib/actions/prayer-request.ts
"use server";

import { apiPatch, apiPost } from "../api";
import { PrayerRequest, ErrorResponse, CreatePrayerRequestData } from "@/types";
import { isSuccessResponse } from "@/utils/apiHelpers";

interface PrayerRequestActionResponse {
  success: boolean;
  message: string;
  data: PrayerRequest;
}

export const approvePrayerRequest = async (
  prayerRequestId: number
): Promise<
  { success: true; data: PrayerRequest; message: string } | ErrorResponse
> => {
  const response = await apiPatch<PrayerRequestActionResponse>(
    `/prayer-requests/${prayerRequestId}/approve`
  );

  if (isSuccessResponse(response) && response.data) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Prayer request approved successfully",
    };
  }

  return response as ErrorResponse;
};

export const closePrayerRequest = async (
  prayerRequestId: number
): Promise<
  { success: true; data: PrayerRequest; message: string } | ErrorResponse
> => {
  const response = await apiPatch<PrayerRequestActionResponse>(
    `/prayer-requests/${prayerRequestId}/close`
  );

  if (isSuccessResponse(response) && response.data) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Prayer request closed successfully",
    };
  }

  return response as ErrorResponse;
};

export const createPrayerRequest = async (
  data: CreatePrayerRequestData
): Promise<
  { success: true; data: PrayerRequest; message: string } | ErrorResponse
> => {
  const response = await apiPost<PrayerRequestActionResponse>(
    `/prayer-requests`,
    data
  );

  if (isSuccessResponse(response) && response.data) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Prayer request created successfully",
    };
  }

  return response as ErrorResponse;
};
