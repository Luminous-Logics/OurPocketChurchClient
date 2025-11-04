import { Family } from "@/types";
import { httpGet } from "@/lib/api/server";
import { NextRequest } from "next/server";
import { API_ENDPOINTS } from "@/config/api";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

interface FamiliesByWardResponse {
  data: Family[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { wardId: string } }
) {
  try {
    const { wardId } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // Build query string
    const queryString = `?page=${page}&limit=${limit}`;

    const url = buildUrl(API_ENDPOINTS.FAMILIES.BY_WARD, { wardId });
    const response = await httpGet<FamiliesByWardResponse>(
      `${url}${queryString}`
    );
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<FamiliesByWardResponse>(err);

    return Response.json(errorResponse);
  }
}
