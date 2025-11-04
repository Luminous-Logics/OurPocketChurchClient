// lib/actions/wards.ts
"use server";

import { Ward, ErrorResponse } from "@/types";
import { isSuccessResponse } from "@/utils/apiHelpers";
import { httpPost, httpPut } from "../api/server"; // Import httpPut
import { API_ENDPOINTS } from "@/config/api";
import { CreateWardFormType } from "@/components/Modal/CreateWardModal"; // Import the type

export type CreateWardData = CreateWardFormType; // Use the imported type

// Define type for updating a ward, including ward_id
export type UpdateWardData = CreateWardFormType & { ward_id: number };

interface WardActionResponse {
  success: boolean;
  message: string;
  data: Ward;
}

export const createWard = async (
  data: CreateWardData
): Promise<{ success: true; data: Ward; message: string } | ErrorResponse> => {
  const response = await httpPost<WardActionResponse>(
    API_ENDPOINTS.WARDS.CREATE,
    data
  );

  if (isSuccessResponse(response) && response.data) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Ward created successfully",
    };
  }

  return response as ErrorResponse;
};

export const updateWard = async (
  wardId: number,
  data: UpdateWardData
): Promise<{ success: true; data: Ward; message: string } | ErrorResponse> => {
  const response = await httpPut<WardActionResponse>(
    `${API_ENDPOINTS.WARDS.UPDATE}/${wardId}`, // Assuming an update endpoint like /wards/:id
    data
  );

  if (isSuccessResponse(response) && response.data) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Ward updated successfully",
    };
  }

  return response as ErrorResponse;
};
