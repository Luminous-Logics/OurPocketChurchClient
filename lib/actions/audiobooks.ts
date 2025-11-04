"use server"
import { API_ENDPOINTS } from "@/config/api";
import { httpPost, httpPut, httpDelete } from "@/lib/api/server";
import { Audiobook, CreateAudiobookRequestBody, UpdateAudiobookRequestBody } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";

/**
 * Create a new audiobook
 */
export async function createAudiobook(audiobookData: CreateAudiobookRequestBody) {
  try {
    const url = API_ENDPOINTS.AUDIOBOOKS.CREATE;
    const response = await httpPost<Audiobook>(url, audiobookData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Update an existing audiobook
 */
export async function updateAudiobook(audiobookId: number, audiobookData: UpdateAudiobookRequestBody) {
  try {
    const url = API_ENDPOINTS.AUDIOBOOKS.UPDATE.replace(":audiobookId", String(audiobookId));
    const response = await httpPut<Audiobook>(url, audiobookData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Delete an audiobook
 */
export async function deleteAudiobook(audiobookId: number) {
  try {
    const url = API_ENDPOINTS.AUDIOBOOKS.DELETE.replace(":audiobookId", String(audiobookId));
    const response = await httpDelete<Audiobook>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}
