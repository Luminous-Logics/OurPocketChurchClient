import { Family } from "@/types";
import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { NextRequest } from "next/server";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

interface FamiliesByWardResponse {
  data: Family[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string; wardId: string } }
) {
  try {
    const { wardId } = params;

    const url = buildUrl(API_ENDPOINTS.FAMILIES.BY_WARD, { wardId });
    const response = await httpGet<FamiliesByWardResponse>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<FamiliesByWardResponse>(err);

    return Response.json(errorResponse);
  }
}
