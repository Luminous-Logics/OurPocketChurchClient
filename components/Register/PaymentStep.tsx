/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import toaster from "@/lib/toastify";
import { useRouter } from "next/navigation";
import { verifyPaymentAction } from "@/lib/actions/subscriptions";
import "razorpay-checkout"; // ✅ Import script once globally

interface PaymentStepProps {
  razorpaySubscriptionId: string;
  razorpayKeyId: string;
  parishName: string;
  adminEmail: string;
  adminPhone: string;
  adminName: string;
}

export default function PaymentStep({
  razorpaySubscriptionId,
  razorpayKeyId,
  parishName,
  adminEmail,
  adminPhone,
  adminName,
}: PaymentStepProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const verifyPayment = async (paymentData: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const response = await verifyPaymentAction(paymentData);

      if (response.success) {
        toaster.success("Payment verified successfully! Please login to continue.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toaster.error(response.message || "Payment verification failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toaster.error("Failed to verify payment. Please contact support.");
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const options = {
        key: razorpayKeyId,
        subscription_id: razorpaySubscriptionId,
        name: "Parish Management System",
        description: `Subscription for ${parishName}`,
        handler: function (response: any) {
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          };
          verifyPayment(paymentData);
        },
        prefill: {
          name: adminName,
          email: adminEmail,
          contact: adminPhone,
        },
        theme: {
          color: "#4f6aed",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toaster.error("Payment cancelled. Please complete payment to activate your subscription.");
          },
        },
      };

      // ✅ Use global Razorpay from window
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization failed:", error);
      toaster.error("Payment system failed to initialize. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="registration-step">
      <div className="step-header">
        <CreditCard size={32} />
        <h3>Complete Payment</h3>
        <p>Subscribe and pay to activate your parish account</p>
      </div>

      <div className="payment-info-card">
        <div className="payment-details">
          <h4>Registration Successful!</h4>
          <p className="payment-message">
            Your parish has been registered successfully. Please complete the payment to
            activate your subscription.
          </p>

          <div className="parish-info">
            <div className="info-row">
              <span className="info-label">Parish:</span>
              <span className="info-value">{parishName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Admin Email:</span>
              <span className="info-value">{adminEmail}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-payment"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing Payment..." : "Proceed to Payment"}
        </button>

        <p className="payment-note">
          You will be redirected to Razorpay secure payment gateway
        </p>
      </div>

      <div className="payment-footer">
        <p className="secure-badge">🔒 Secure Payment by Razorpay</p>
      </div>
    </div>
  );
}
