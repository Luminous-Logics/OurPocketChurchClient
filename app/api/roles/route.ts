import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { RolesListResponse } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parishId = searchParams.get("parishId");

    const url = parishId
      ? `${API_ENDPOINTS.ROLES.LIST}?parishId=${parishId}`
      : API_ENDPOINTS.ROLES.LIST;

    const response = await httpGet<RolesListResponse>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<RolesListResponse>(err);
    return Response.json(errorResponse);
  }
}
