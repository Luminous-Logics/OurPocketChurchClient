"use server"
import { CreateChurchRequestBody } from "@/components/ChurchManagment/Schema";
import { API_ENDPOINTS } from "@/config/api";
import { httpPost } from "@/lib/api/server";
import { ParishRes } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";
import { httpPut, httpDelete } from "@/lib/api/server";

export async function createParish(parishData: CreateChurchRequestBody) {
  try {
    const url = API_ENDPOINTS.PARISH.LIST;
    const response = await httpPost<ParishRes>(url, parishData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

export async function updateParish(parishId: string, parishData: CreateChurchRequestBody) {
  try {
    const url = API_ENDPOINTS.PARISH.DETAILS(parishId); // Assuming this endpoint exists
    const response = await httpPut<ParishRes>(url, parishData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

export async function deleteParish(parishId: string) {
  try {
    const url = API_ENDPOINTS.PARISH.DETAILS(parishId);
    const response = await httpDelete<ParishRes>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}
