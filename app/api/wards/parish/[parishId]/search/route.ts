/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { Ward } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface SearchResponse {
  data: Ward[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query) {
      return Response.json({ data: [] });
    }

    // Build query string
    const queryString = `?q=${encodeURIComponent(query)}`;

    const url = buildUrl(API_ENDPOINTS.WARDS.SEARCH, { parishId });
    const response = await httpGet<SearchResponse>(`${url}${queryString}`);

    // response.data contains the search results
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<SearchResponse>(err);

    return Response.json(errorResponse);
  }
}
