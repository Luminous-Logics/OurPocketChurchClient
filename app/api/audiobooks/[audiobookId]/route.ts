import { Audiobook } from "@/types";
import { httpGet } from "@/lib/api/server";
import { NextRequest } from "next/server";
import { API_ENDPOINTS } from "@/config/api";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";

export const dynamic = "force-dynamic";

interface AudiobookByIdResponse {
  data: Audiobook;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { audiobookId: string } }
) {
  try {
    const { audiobookId } = params;
    const url = buildUrl(API_ENDPOINTS.AUDIOBOOKS.GET_BY_ID, { audiobookId });
    const response = await httpGet<AudiobookByIdResponse>(`${url}`);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<AudiobookByIdResponse>(err);

    return Response.json(errorResponse);
  }
}
