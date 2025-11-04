"use server"
import { API_ENDPOINTS } from "@/config/api";
import { httpPost, httpPut } from "@/lib/api/server"; // Import httpPut
import { CreateParishionerRequestBody, ParishionerResponse, ApiResponse } from "@/types"; // Import ApiResponse
import { handleErrors } from "@/utils/apiHelpers";

export async function createParishioner(parishionerData: CreateParishionerRequestBody) {
  try {
    const url = API_ENDPOINTS.PARISHIONERS.CREATE;
    const response = await httpPost<ParishionerResponse>(url, parishionerData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

export async function updateParishioner(
  parishionerId: number,
  parishionerData: CreateParishionerRequestBody
) {
  try {
    const url = API_ENDPOINTS.PARISHIONERS.UPDATE.replace(":id", String(parishionerId));
    const response = await httpPut<ApiResponse<ParishionerResponse>>(url, parishionerData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}
