/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { Ward } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface WardsListResponse {
  data: Ward[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;

    const url = buildUrl(API_ENDPOINTS.WARDS.LIST, { parishId });
    const response = await httpGet<WardsListResponse>(`${url}/all`);

    // response.data contains the WardsListResponse
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<WardsListResponse>(err);

    return Response.json(errorResponse);
  }
}
