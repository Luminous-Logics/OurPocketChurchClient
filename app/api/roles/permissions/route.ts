/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpGet } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/config/api";
import { handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await httpGet<any>(
      API_ENDPOINTS.ROLES.PERMISSIONS.ALL
    );
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<any>(err);

    return Response.json(errorResponse);
  }
}
