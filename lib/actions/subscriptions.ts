// lib/actions/subscriptions.ts
"use server";

import { API_ENDPOINTS } from "@/config/api";
import { httpPost } from "../api/server";

interface VerifyPaymentData {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  verified: boolean;
  subscription_id: number;
  parish_id: number;
  subscription_status: string;
  message: string;
}

// Verify Payment - Server Action
export async function verifyPaymentAction(data: VerifyPaymentData) {
  try {
    const response = await httpPost<VerifyPaymentResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.VERIFY_PAYMENT,
      data
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: "Payment verified successfully",
      };
    }

    return {
      success: false,
      message: response.message || "Payment verification failed",
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      message: "Failed to verify payment. Please try again.",
    };
  }
}
