/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { Parishioner } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface ParishionerListResponse {
  data: Parishioner[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const { familyId } = params;

    const url = buildUrl(API_ENDPOINTS.PARISHIONERS.BY_FAMILY, { familyId });
    const response = await httpGet<ParishionerListResponse>(`${url}`);

    // response.data contains the WardsListResponse
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<ParishionerListResponse>(err);

    return Response.json(errorResponse);
  }
}
