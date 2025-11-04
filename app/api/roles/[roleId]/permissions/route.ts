import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { ApiResponse, Permission } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const { roleId } = params;
    const url = buildUrl(API_ENDPOINTS.ROLES.PERMISSIONS.BY_ROLE, { roleId });
    const response = await httpGet<ApiResponse<Permission[]>>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<ApiResponse<Permission[]>>(err);
    return Response.json(errorResponse);
  }
}
