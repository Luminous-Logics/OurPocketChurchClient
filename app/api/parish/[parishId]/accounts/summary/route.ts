import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { FinancialSummaryResponse } from "@/types";
import { buildUrl, handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { parishId: string } }
) {
  try {
    const { parishId } = params;
    const url = buildUrl(API_ENDPOINTS.ACCOUNTS.PARISH.SUMMARY, { parishId });
    const response = await httpGet<FinancialSummaryResponse>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<FinancialSummaryResponse>(err);
    return Response.json(errorResponse);
  }
}
