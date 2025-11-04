/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpGet } from "@/lib/api/server";
import { BibleChapterContentResponse } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string; chapterId: string } }
) {
  try {
    const { bibleId, chapterId } = params;

    // Call external Bible API to get full chapter content
    const response = await httpGet<BibleChapterContentResponse>(
      `/bible/api/bibles/${bibleId}/chapters/${chapterId}`
    );

    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<BibleChapterContentResponse>(err);
    return Response.json(errorResponse);
  }
}
