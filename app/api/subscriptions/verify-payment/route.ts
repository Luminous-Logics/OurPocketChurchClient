/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpPost } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/config/api";
import { handleErrors } from "@/utils/apiHelpers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    subscription_id: number;
    parish_id: number;
    subscription_status: string;
    message: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json();

    // Validate required fields
    if (
      !body.razorpay_payment_id ||
      !body.razorpay_subscription_id ||
      !body.razorpay_signature
    ) {
      return Response.json(
        {
          success: false,
          message: "Missing required payment verification parameters",
        },
        { status: 400 }
      );
    }

    // Call backend API to verify payment
    const response = await httpPost<VerifyPaymentResponse>(
      `${API_ENDPOINTS.SUBSCRIPTIONS.PLANS}/verify-payment`,
      body
    );

    return Response.json(response.data);
  } catch (err) {
    const errorResponse = handleErrors<VerifyPaymentResponse>(err);

    return Response.json(errorResponse, {
      status: errorResponse.success === false ? 400 : 200,
    });
  }
}
