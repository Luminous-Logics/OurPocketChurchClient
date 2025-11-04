import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { FamiliesListResponse } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const queryString = `?page=${page}&limit=${limit}`;
    const url = buildUrl(API_ENDPOINTS.FAMILIES.LIST, { parishId });
    const response = await httpGet<FamiliesListResponse>(
      `${url}${queryString}`
    );
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<FamiliesListResponse>(err);

    return Response.json(errorResponse);
  }
}
