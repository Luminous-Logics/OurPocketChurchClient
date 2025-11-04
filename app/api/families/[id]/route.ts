import { Family } from "@/types";
import { httpGet } from "@/lib/api/server";
import { NextRequest } from "next/server";
import { API_ENDPOINTS } from "@/config/api";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

interface FamiliesByIdResponse {
  data: Family;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const url = buildUrl(API_ENDPOINTS.FAMILIES.GET_BY_ID, { id });
    const response = await httpGet<FamiliesByIdResponse>(
      `${url}`
    );
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<FamiliesByIdResponse>(err);

    return Response.json(errorResponse);
  }
}
