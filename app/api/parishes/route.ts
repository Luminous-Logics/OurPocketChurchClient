import { httpGet } from "@/lib/api/server";
import { NextRequest } from "next/server";
import { API_ENDPOINTS } from "@/config/api";
import { handleErrors } from "@/utils/apiHelpers";
import { ParishesApiResponse } from "@/types";

export const dynamic = "force-dynamic";


export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // Build query string
    const queryString = `?page=${page}&limit=${limit}`;

    const url = API_ENDPOINTS.PARISH.LIST;
    const response = await httpGet<ParishesApiResponse>(
      `${url}${queryString}`
    );
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<ParishesApiResponse>(err);

    return Response.json(errorResponse);
  }
}
