import { NextRequest } from "next/server";
import { httpGet } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/config/api";
import { ActivePrayerRequestsResponse } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;

    const url = buildUrl(API_ENDPOINTS.PRAYER_REQUESTS.ACTIVE, { parishId });
    const response = await httpGet<ActivePrayerRequestsResponse>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<ActivePrayerRequestsResponse>(err);

    return Response.json(errorResponse);
  }
}
