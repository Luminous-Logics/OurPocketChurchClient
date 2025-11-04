import { ProfileResponse } from "@/types";
import { httpGet } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/config/api";
import { handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await httpGet<ProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<ProfileResponse>(err);

    return Response.json(errorResponse);
  }
}
