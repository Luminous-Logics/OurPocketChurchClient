import { Family } from "@/types";
import { NextRequest } from "next/server";
import { httpGet } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/config/api";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

interface SearchResponse {
  data: Family[];
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

    const url = buildUrl(API_ENDPOINTS.FAMILIES.SEARCH, { parishId });
    const response = await httpGet<SearchResponse>(`${url}${queryString}`);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<SearchResponse>(err);

    return Response.json(errorResponse);
  }
}
