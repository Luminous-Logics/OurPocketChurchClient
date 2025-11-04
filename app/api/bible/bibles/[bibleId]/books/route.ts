/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpGet } from "@/lib/api/server";
import { BibleBooksResponse } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string } }
) {
  try {
    const { bibleId } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeChapters = searchParams.get("includeChapters") || "false";

    // Build query string
    const queryString = `?includeChapters=${includeChapters}`;

    // Call external Bible API
    const response = await httpGet<BibleBooksResponse>(
      `/bible/api/bibles/${bibleId}/books${queryString}`
    );

    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<BibleBooksResponse>(err);
    return Response.json(errorResponse);
  }
}
