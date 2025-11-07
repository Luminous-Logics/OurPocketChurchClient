/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import * as z from "zod";
import toaster from "@/lib/toastify";
import { useForm } from "react-hook-form";
import InputText from "../InputComponents/InputText";
import InputDropDown from "../InputComponents/InputDropDown";
import InputDatePicker from "../InputComponents/InputDatePicker";
import InputPhone from "../InputComponents/InputPhone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { parishRegisterAction } from "@/lib/actions/auth";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { SubscriptionPlan, SelectItem, SubscriptionPlansResponse } from "@/types";
import PaymentStep from "./PaymentStep";
import { Loader2 } from "lucide-react";

// Validation schema
const parishRegistrationSchema = z.object({
  // Step 1: Parish Information
  parish_name: z.string().min(1, "Parish name is required"),
  diocese: z.string().min(1, "Diocese is required"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  website_url: z.string().optional(),
  established_date: z.string().optional(),
  patron_saint: z.string().min(1, "Patron saint is required"),
  timezone: z.object({
    value: z.string(),
    label: z.string(),
  }).refine((val) => val?.value, { message: "Timezone is required" }),

  // Step 2: Administrator Details
  admin_email: z.string().email("Valid admin email is required"),
  admin_password: z.string().min(6, "Password must be at least 6 characters"),
  admin_first_name: z.string().min(1, "First name is required"),
  admin_last_name: z.string().min(1, "Last name is required"),
  admin_phone: z.string().min(1, "Phone is required"),
  admin_role: z.string().optional(),
  admin_department: z.string().optional(),

  // Step 3: Plan Selection
  plan_id: z.number().min(1, "Please select a plan"),
  billing_cycle: z.enum(["monthly", "yearly"]),

  // Step 4: Billing Information
  billing_name: z.string().min(1, "Billing name is required"),
  billing_email: z.string().email("Valid billing email is required"),
  billing_phone: z.string().min(1, "Billing phone is required"),
  billing_address: z.string().min(1, "Billing address is required"),
  billing_city: z.string().min(1, "City is required"),
  billing_state: z.string().min(1, "State is required"),
  billing_pincode: z.string()
  .min(1, "Pincode is required")
  .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  billing_country: z.string().min(1, "Country is required"),
});

type RegistrationFormType = z.infer<typeof parishRegistrationSchema>;

const TIMEZONES: SelectItem[] = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

export default function RegisterComp() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState<any>(null);

  const hookForm = useForm<RegistrationFormType>({
    resolver: zodResolver(parishRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      billing_cycle: "monthly",
    },
  });

  const { handleSubmit, watch, setValue, trigger } = hookForm;

  useEffect(() => {
  setValue("billing_country","IN")
  }, [ ])
  

  // Watch billing cycle for plan selection
  const billingCycle = watch("billing_cycle");

  // Fetch subscription plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const resp = await promiseTracker(
          httpServerGet<SubscriptionPlansResponse>("/subscriptions/plans")
        );

        if (resp.data) {
          if (Array.isArray(resp.data)) {
            setSubscriptionPlans(resp.data);
          } else if ((resp.data as any).data) {
            setSubscriptionPlans((resp.data as any).data);
          }
        }
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        toaster.error("Failed to load subscription plans");
      }
    };
    fetchPlans();
  }, []);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "parish_name",
          "diocese",
          "address_line1",
          "city",
          "state",
          "country",
          "postal_code",
          "phone",
          "email",
          "patron_saint",
          "timezone",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "admin_email",
          "admin_password",
          "admin_first_name",
          "admin_last_name",
          "admin_phone",
        ];
        break;
      case 3:
        fieldsToValidate = ["plan_id", "billing_cycle"];
        break;
      default:
        break;
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      toaster.error("Please fill all required fields");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setValue("plan_id", Number(plan.plan_id));
  };

  const registrationHandler = async (data: RegistrationFormType) => {
    try {
      setIsSubmitting(true);

      // Transform data for API
      const registrationData = {
        ...data,
        timezone: data.timezone.value,
        payment_method:"online"
      };

      const resp = await parishRegisterAction(registrationData as any);

      if (resp.success && resp.data) {
        toaster.success("Registration Successful! Please complete payment.");
        // Store registration response with Razorpay details
        setRegistrationResponse(resp.data);
        // Move to payment step
        setCurrentStep(5);
      } else {
        toaster.error(resp.message || "Registration Failed");
      }
    } catch (err) {
      console.error(err);
      toaster.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="registration-step">
      <div className="row g-3">
        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="parish_name"
            label="Parish Name"
            labelMandatory
            placeholder="St. Mary Parish"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="diocese"
            label="Diocese"
            labelMandatory
            placeholder="Diocese of Springfield"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="patron_saint"
            label="Patron Saint"
            labelMandatory
            placeholder="St. Mary"
          />
        </div>

        <div className="col-md-6">
          <InputDatePicker
            hookForm={hookForm}
            field="established_date"
            label="Established Date"
            placeholder="Select date"
            showYearDropdown
            showMonthDropdown
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="email"
            label="Parish Email"
            labelMandatory
            placeholder="info@stmary.org"
            type="email"
          />
        </div>

        <div className="col-md-6">
          <InputPhone
            hookForm={hookForm}
            field="phone"
            label="Parish Phone"
            labelMandatory
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="col-md-12">
          <InputText
            hookForm={hookForm}
            field="website_url"
            label="Website URL"
            placeholder="https://www.stmary.org"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="address_line1"
            label="Address Line 1"
            labelMandatory
            placeholder="123 Church Street"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="address_line2"
            label="Address Line 2"
            placeholder="Suite 100 (optional)"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="city"
            label="City"
            labelMandatory
            placeholder="Springfield"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="state"
            label="State / Province"
            labelMandatory
            placeholder="Illinois"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="postal_code"
            label="Postal / ZIP Code"
            labelMandatory
            placeholder="62701"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="country"
            label="Country"
            labelMandatory
            placeholder="United States"
          />
        </div>

        <div className="col-md-12">
          <InputDropDown
            hookForm={hookForm}
            field="timezone"
            label="Timezone"
            labelMandatory
            options={TIMEZONES}
            placeholder="Select your timezone"
            isClearable
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="registration-step">
      <div className="step-content-header">
        <h3>Administrator Details</h3>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="admin_first_name"
            label="First Name"
            labelMandatory
            placeholder="John"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="admin_last_name"
            label="Last Name"
            labelMandatory
            placeholder="Smith"
          />
        </div>

        <div className="col-md-12">
          <InputText
            hookForm={hookForm}
            field="admin_email"
            label="Admin Email"
            labelMandatory
            placeholder="admin@stmary.org"
            type="email"
          />
        </div>

        <div className="col-md-12">
          <InputText
            hookForm={hookForm}
            field="admin_password"
            label="Admin Password"
            labelMandatory
            placeholder="Minimum 6 characters"
            type="password"
          />
        </div>

        <div className="col-md-6">
          <InputPhone
            hookForm={hookForm}
            field="admin_phone"
            label="Admin Phone"
            labelMandatory
            placeholder="+1234567890"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="admin_role"
            label="Role"
            placeholder="Pastor"
          />
        </div>

        <div className="col-md-12">
          <InputText
            hookForm={hookForm}
            field="admin_department"
            label="Department"
            placeholder="Administration"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const filteredPlans = subscriptionPlans.filter(
      (plan) => plan.billing_cycle === billingCycle
    );

    return (
      <div className="registration-step">
        <div className="step-content-header">
          <h3>Select Your Plan</h3>
        </div>

        <div className="billing-cycle-selector">
          <label className="form-control-label">Billing Cycle *</label>
          <div className="billing-cycle-buttons">
            <button
              type="button"
              className={`billing-cycle-btn ${billingCycle === "monthly" ? "active" : ""}`}
              onClick={() => setValue("billing_cycle", "monthly")}
              aria-label="Select monthly billing"
              aria-pressed={billingCycle === "monthly"}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`billing-cycle-btn ${billingCycle === "yearly" ? "active" : ""}`}
              onClick={() => setValue("billing_cycle", "yearly")}
              data-savings="Save 20%"
              aria-label="Select yearly billing and save 20%"
              aria-pressed={billingCycle === "yearly"}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="plans-grid" role="radiogroup" aria-label="Subscription plans">
          {filteredPlans.map((plan) => (
            <div
              key={plan.plan_id}
              className={`plan-card ${selectedPlan?.plan_id === plan.plan_id ? "selected" : ""}`}
              onClick={() => handlePlanSelect(plan)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePlanSelect(plan);
                }
              }}
              role="radio"
              aria-checked={selectedPlan?.plan_id === plan.plan_id}
              aria-label={`${plan.plan_name} plan, ${plan.currency === "INR" ? "₹" : "$"}${plan.amount} per ${billingCycle === "monthly" ? "month" : "year"}`}
              tabIndex={0}
            >
              {selectedPlan?.plan_id === plan.plan_id && (
                <div className="plan-selected-badge" aria-label="Selected plan">✓ Selected</div>
              )}

              <div className="plan-header">
                <div className="plan-info">
                  <h4>{plan.plan_name}</h4>
                  <div className="plan-price">
                    <span className="currency">{plan.currency === "INR" ? "₹" : "$"}</span>
                    <span className="amount">{plan.amount}</span>
                    <span className="period">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                </div>
              </div>

              <div className="plan-features">
                {plan.max_parishioners && (
                  <div className="plan-feature">
                    Up to {plan.max_parishioners.toLocaleString()} parishioners
                  </div>
                )}
                {plan.max_families && (
                  <div className="plan-feature">
                    Up to {plan.max_families.toLocaleString()} families
                  </div>
                )}
                {plan.trial_period_days && (
                  <div className="plan-feature">
                    {plan.trial_period_days} days free trial
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="registration-step">
      <div className="step-content-header">
        <h3>Billing Information</h3>
      </div>

      <div className="row g-3">
        <div className="col-md-12">
          <InputText
            hookForm={hookForm}
            field="billing_name"
            label="Billing Name"
            labelMandatory
            placeholder="St. Mary Parish"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="billing_email"
            label="Billing Email"
            labelMandatory
            placeholder="billing@stmary.org"
            type="email"
          />
        </div>

        <div className="col-md-6">
          <InputPhone
            hookForm={hookForm}
            field="billing_phone"
            label="Billing Phone"
            labelMandatory
            placeholder="9876543210"
          />
        </div>

        <div className="col-md-12">
          <InputText
            hookForm={hookForm}
            field="billing_address"
            label="Billing Address"
            labelMandatory
            placeholder="123 Church Street, Suite 100"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="billing_city"
            label="City"
            labelMandatory
            placeholder="Mumbai"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="billing_state"
            label="State"
            labelMandatory
            placeholder="Maharashtra"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="billing_pincode"
            label="Pincode"
            labelMandatory
            placeholder="400001"
          />
        </div>

        <div className="col-md-6">
          <InputText
            hookForm={hookForm}
            field="billing_country"
            label="Country"
            labelMandatory
            placeholder="IN"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="register-page login-bg">
      <div className="register-wrapper">
        {/* Left Side - Dynamic Progress Indicator */}
        <div className="register-feature-panel">
          <div className="register-progress-container">
            <div className="brand-section">
              <h1 className="brand-title">Our Pocket Church</h1>
              <p className="brand-tagline">Your Journey to Better Parish Management</p>
            </div>

            {/* Step-by-step Progress Tracker */}
            <div className="register-progress-steps">
              <div className={`progress-step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
                <div className="progress-step-icon">
                  {currentStep > 1 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )}
                </div>
                <div className="progress-step-content">
                  <h3 className="progress-step-title">Parish Information</h3>
                  <p className="progress-step-description">Basic details about your church</p>
                </div>
              </div>

              <div className={`progress-step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
                <div className="progress-step-icon">
                  {currentStep > 2 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
                <div className="progress-step-content">
                  <h3 className="progress-step-title">Administrator Setup</h3>
                  <p className="progress-step-description">Create your admin account</p>
                </div>
              </div>

              <div className={`progress-step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
                <div className="progress-step-icon">
                  {currentStep > 3 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  )}
                </div>
                <div className="progress-step-content">
                  <h3 className="progress-step-title">Choose Your Plan</h3>
                  <p className="progress-step-description">Select the right package</p>
                </div>
              </div>

              <div className={`progress-step-item ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`}>
                <div className="progress-step-icon">
                  {currentStep > 4 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  )}
                </div>
                <div className="progress-step-content">
                  <h3 className="progress-step-title">Billing Details</h3>
                  <p className="progress-step-description">Payment information</p>
                </div>
              </div>

              <div className={`progress-step-item ${currentStep === 5 ? 'active' : ''}`}>
                <div className="progress-step-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="progress-step-content">
                  <h3 className="progress-step-title">Complete Payment</h3>
                  <p className="progress-step-description">Finalize registration</p>
                </div>
              </div>
            </div>

            <div className="powered-by">
              Powered by <strong>Luminous Logics</strong>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-panel">
          <div className="registerForm">
            <div className="form-header">
              <h2>Parish Registration</h2>
              <p>
                Step {currentStep} of 5: {" "}
                {currentStep === 1 && "Parish Details"}
                {currentStep === 2 && "Administrator Info"}
                {currentStep === 3 && "Plan Selection"}
                {currentStep === 4 && "Billing Info"}
                {currentStep === 5 && "Payment"}
              </p>

              {/* Progress Bar */}
              <div className="progress-bar-container" role="progressbar" aria-valuenow={(currentStep / 5) * 100} aria-valuemin={0} aria-valuemax={100} aria-label={`Registration progress: step ${currentStep} of 5`}>
                <div className="progress-bar-fill" style={{ width: `${(currentStep / 5) * 100}%` }}></div>
              </div>
            </div>

            {currentStep === 5 && registrationResponse ? (
              <PaymentStep
                razorpaySubscriptionId={registrationResponse.razorpay_subscription_id}
                razorpayKeyId={registrationResponse.razorpay_key_id}
                parishName={registrationResponse.parish_name || hookForm.getValues("parish_name")}
                adminEmail={hookForm.getValues("admin_email")}
                adminPhone={hookForm.getValues("admin_phone")}
                adminName={`${hookForm.getValues("admin_first_name")} ${hookForm.getValues("admin_last_name")}`}
              />
            ) : (
              <form onSubmit={handleSubmit(registrationHandler)}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="registration-actions">
                  {currentStep > 1 && currentStep < 5 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                      aria-label="Go to previous step"
                    >
                      Previous
                    </button>
                  )}

                  {currentStep < 4 && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      aria-label="Continue to next step"
                    >
                      Next Step
                    </button>
                  )}

                  {currentStep === 4 && (
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={isSubmitting}
                      aria-label={isSubmitting ? "Processing registration" : "Complete registration and proceed to payment"}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="spinner-icon" size={18} />
                          Processing...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </button>
                  )}
                </div>

                {currentStep !== 5 && (
                  <>
                    <div className="register-footer">
                      <p>
                        Already have an account?{" "}
                        <a
                          onClick={() => !isSubmitting && router.push("/login")}
                          style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && !isSubmitting) {
                              e.preventDefault();
                              router.push("/login");
                            }
                          }}
                          aria-label="Back to login page"
                        >
                          Back to Login
                        </a>
                      </p>
                    </div>

                    {/* Security Badge */}
                    <div className="security-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span>256-bit SSL encryption · Your data is protected</span>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
