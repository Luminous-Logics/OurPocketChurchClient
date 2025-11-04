/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpGet } from "@/lib/api/server";
import { BibleChaptersResponse } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string; bookId: string } }
) {
  try {
    const { bibleId, bookId } = params;

    // Call external Bible API
    const response = await httpGet<BibleChaptersResponse>(
      `/bible/api/bibles/${bibleId}/books/${bookId}/chapters`
    );

    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<BibleChaptersResponse>(err);
    return Response.json(errorResponse);
  }
}
