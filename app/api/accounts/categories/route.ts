
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { API_ENDPOINTS } from "@/config/api";
import { httpGet } from "@/lib/api/server";
import { CategoriesListResponse } from "@/types";
import { handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.CATEGORIES.LIST;
    const response = await httpGet<CategoriesListResponse>(url);
    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<CategoriesListResponse>(err);
    return Response.json(errorResponse);
  }
}
