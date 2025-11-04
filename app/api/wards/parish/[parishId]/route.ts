/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { Ward } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface WardsListResponse {
  data: Ward[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // Build query string
    const queryString = `?page=${page}&limit=${limit}`;

    const url = buildUrl(API_ENDPOINTS.WARDS.LIST, { parishId });
    const response = await httpGet<WardsListResponse>(`${url}${queryString}`);

    // response.data contains the WardsListResponse
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<WardsListResponse>(err);

    return Response.json(errorResponse);
  }
}
