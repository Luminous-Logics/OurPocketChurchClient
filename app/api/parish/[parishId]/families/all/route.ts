import { Family } from "@/types";
import { httpGet } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/config/api";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

interface AllFamiliesResponse {
  data: Family[];
}

export async function GET(
  request: Request,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;
    const url = buildUrl(API_ENDPOINTS.FAMILIES.ALL, { parishId });
    const response = await httpGet<AllFamiliesResponse>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<AllFamiliesResponse>(err);

    return Response.json(errorResponse);
  }
}
