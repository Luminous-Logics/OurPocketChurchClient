"use server"
import { API_ENDPOINTS } from "@/config/api";
import { httpPost, httpPut, httpGet } from "@/lib/api/server";
import { Family } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";

type FamilyCreateData = Omit<Family, "family_id" | "is_active" | "created_at" | "updated_at" | "address"> & {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
};

type FamilyUpdateData = Partial<Omit<Family, "family_id" | "created_at" | "updated_at" | "address">> & {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
};

export async function createFamily(familyData: FamilyCreateData) {
  try {
    const url = API_ENDPOINTS.FAMILIES.CREATE;
    const response = await httpPost<Family>(url, familyData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

export async function updateFamily(familyId: number, familyData: FamilyUpdateData) {
  try {
    const url = API_ENDPOINTS.FAMILIES.UPDATE.replace(":id", String(familyId));
    const response = await httpPut<Family>(url, familyData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

export async function fetchFamilyById(familyId: number) {
  try {
    const url = API_ENDPOINTS.FAMILIES.GET_BY_ID.replace(":id", String(familyId));
    const response = await httpGet<Family>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}
