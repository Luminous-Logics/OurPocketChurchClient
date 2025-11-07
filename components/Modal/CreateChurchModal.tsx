/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import InputText from "../InputComponents/InputText";
import InputDropDown from "../InputComponents/InputDropDown";
import InputDatePicker from "../InputComponents/InputDatePicker";
import InputPhone from "../InputComponents/InputPhone";
import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { SubscriptionPlan, SubscriptionPlansResponse } from "@/types";
import "./styles.scss";
import {
  CreateChurchFormType,
  createChurchSchema,
  defaultValues,
  CreateChurchRequestBody,
} from "../ChurchManagment/Schema";

interface CreateChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  onSubmit: (data: CreateChurchFormType) => Promise<void>;
  isEditMode?: boolean;
  initialValues?: CreateChurchRequestBody | null;
}

const timezoneOptions = [
  { label: "America/Chicago", value: "America/Chicago" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Asia/Kolkata", value: "Asia/Kolkata" },
  // Add more timezone options as needed
];

const CreateChurchModal: React.FC<CreateChurchModalProps> = ({
  isOpen,
  onClose,
  isCreating,
  onSubmit,
  isEditMode = false,
  initialValues,
}) => {
  const baseSteps = ["Basic Info", "Address", "Subscription", "Billing Info", "Admin User"];
  const steps = isEditMode
    ? baseSteps.filter((step) => step !== "Admin User")
    : baseSteps;

  const [currentStep, setCurrentStep] = useState(0);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const hookForm = useForm<CreateChurchFormType>({
    resolver: zodResolver(createChurchSchema),
    defaultValues: defaultValues,
  });


  useEffect(() => {
    hookForm.setValue("billing_country","IN")
  }, [])
  

  // Fetch subscription plans
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

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0); // Reset to the first step when modal opens
      if (initialValues) {
        const transformedInitialValues: CreateChurchFormType = {
          ...initialValues,
          timezone: initialValues.timezone
            ? timezoneOptions.find((option) => option.value === initialValues.timezone)
            : undefined,
          billing_cycle: initialValues.billing_cycle || "monthly",
          billing_name: initialValues.billing_name || "",
          billing_email: initialValues.billing_email || "",
          billing_phone: initialValues.billing_phone || "",
          billing_address: initialValues.billing_address || "",
          billing_city: initialValues.billing_city || "",
          billing_state: initialValues.billing_state || "",
          billing_pincode: initialValues.billing_pincode || "",
          billing_country: initialValues.billing_country || "IN",
        };
        hookForm.reset(transformedInitialValues);
      } else {
        hookForm.reset(defaultValues); // Reset to default when opening for add
      }
    } else {
      hookForm.reset(defaultValues); // Reset to default when modal closes
    }
  }, [isOpen, initialValues, hookForm]);

  // Adjust currentStep if it points to the removed "Admin User" tab in edit mode
  React.useEffect(() => {
    if (isEditMode && currentStep === baseSteps.indexOf("Admin User")) {
      setCurrentStep(steps.length - 1); // Move to the last available step
    }
  }, [isEditMode, currentStep, baseSteps, steps.length]);

  const {
    handleSubmit,
    trigger,
    formState: { errors },
  } = hookForm;

  const handleNext = async () => {
    let isValid = false;
    const currentStepName = steps[currentStep];

    if (currentStepName === "Basic Info") {
      isValid = await trigger([
        "parish_name",
        "diocese",
        "patron_saint",
        "established_date",
        "phone",
        "email",
        "timezone",
      ]);
    } else if (currentStepName === "Address") {
      isValid = await trigger([
        "address_line1",
        "city",
        "state",
        "country",
        "postal_code",
      ]);
    } else if (currentStepName === "Subscription") {
      isValid = await trigger(["plan_id", "billing_cycle"]);
    } else if (currentStepName === "Billing Info") {
      isValid = await trigger([
        "billing_name",
        "billing_email",
        "billing_phone",
        "billing_address",
        "billing_city",
        "billing_state",
        "billing_pincode",
        "billing_country",
      ]);
    }
    // No validation needed for the last step before moving to next (it's the submit step)

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFormSubmit = (data: CreateChurchFormType) => {
    onSubmit(data);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit Church" : "Add New Church"}
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">
          {isEditMode ? "Edit Church" : "Add New Church"}
        </h3>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="modal-body">
        <div className="stepper-tabs">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`stepper-tab ${
                index === currentStep ? "active" : ""
              } ${index < currentStep ? "completed" : ""}`}
              onClick={() => setCurrentStep(index)} // Allow clicking on previous steps
            >
              {step}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} id="create-church-form">
          {currentStep === steps.indexOf("Basic Info") && (
            <div className="step-content">
              <div className="row g-3">
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="parish_name"
                    label="Parish Name"
                    labelMandatory
                    errorText={errors.parish_name?.message}
                    placeholder="e.g., St. Mary Parish"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="diocese"
                    label="Diocese"
                    labelMandatory
                    errorText={errors.diocese?.message}
                    placeholder="e.g., Diocese of Springfield"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="patron_saint"
                    label="Patron Saint"
                    labelMandatory
                    errorText={errors.patron_saint?.message}
                    placeholder="e.g., St. Mary"
                  />
                </div>
                <div className="col-md-6">
                  <InputDatePicker
                    hookForm={hookForm}
                    field="established_date"
                    label="Established Date"
                    labelMandatory
                    placeholder="dd-mm-yyyy"
                  />
                </div>
                <div className="col-md-6">
                  <InputPhone
                    hookForm={hookForm}
                    field="phone"
                    label="Phone"
                    labelMandatory
                    errorText={errors.phone?.message}
                    placeholder="e.g., +1234567890"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="email"
                    label="Email"
                    labelMandatory
                    errorText={errors.email?.message}
                    placeholder="e.g., info@stmary.org"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="website_url"
                    label="Website URL"
                    errorText={errors.website_url?.message}
                    placeholder="https://www.stmary.org"
                  />
                </div>
                <div className="col-md-6">
                  <InputDropDown
                    hookForm={hookForm}
                    field="timezone"
                    label="Timezone"
                    labelMandatory
                    errorText={errors.timezone?.message}
                    placeholder="Select timezone"
                    options={timezoneOptions}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === steps.indexOf("Address") && (
            <div className="step-content">
              <div className="row g-3">
                <div className="col-12">
                  <InputText
                    hookForm={hookForm}
                    field="address_line1"
                    label="Address Line 1"
                    labelMandatory
                    errorText={errors.address_line1?.message}
                    placeholder="e.g., 123 Church Street"
                  />
                </div>
                <div className="col-12">
                  <InputText
                    hookForm={hookForm}
                    field="address_line2"
                    label="Address Line 2"
                    errorText={errors.address_line2?.message}
                    placeholder="e.g., Suite 100"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="city"
                    label="City"
                    labelMandatory
                    errorText={errors.city?.message}
                    placeholder="e.g., Springfield"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="state"
                    label="State"
                    labelMandatory
                    errorText={errors.state?.message}
                    placeholder="e.g., Illinois"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="country"
                    label="Country"
                    labelMandatory
                    errorText={errors.country?.message}
                    placeholder="e.g., USA"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="postal_code"
                    label="Postal Code"
                    labelMandatory
                    errorText={errors.postal_code?.message}
                    placeholder="e.g., 62701"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === steps.indexOf("Subscription") && (
            <div className="step-content">
              <div className="billing-cycle-selector mb-4">
                <label className="form-control-label">Billing Cycle *</label>
                <div className="billing-cycle-buttons">
                  <button
                    type="button"
                    className={`billing-cycle-btn ${hookForm.watch("billing_cycle") === "monthly" ? "active" : ""}`}
                    onClick={() => hookForm.setValue("billing_cycle", "monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={`billing-cycle-btn ${hookForm.watch("billing_cycle") === "yearly" ? "active" : ""}`}
                    onClick={() => hookForm.setValue("billing_cycle", "yearly")}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              <div className="plans-grid">
                {subscriptionPlans
                  .filter((plan) => plan.billing_cycle === hookForm.watch("billing_cycle"))
                  .map((plan) => (
                    <div
                      key={plan.plan_id}
                      className={`plan-card ${selectedPlan?.plan_id === plan.plan_id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedPlan(plan);
                        hookForm.setValue("plan_id", Number(plan.plan_id));
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {selectedPlan?.plan_id === plan.plan_id && (
                        <div className="plan-selected-badge">✓ Selected</div>
                      )}

                      <div className="plan-header">
                        <div className="plan-info">
                          <h4>{plan.plan_name}</h4>
                          <div className="plan-price">
                            <span className="currency">{plan.currency === "INR" ? "₹" : "$"}</span>
                            <span className="amount">{plan.amount}</span>
                            <span className="period">/{hookForm.watch("billing_cycle") === "monthly" ? "mo" : "yr"}</span>
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

              <div className="row g-3 mt-3">
                <div className="col-md-12">
                  <InputDatePicker
                    hookForm={hookForm}
                    field="subscription_expiry"
                    label="Subscription Expiry"
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === steps.indexOf("Billing Info") && (
            <div className="step-content">
              <div className="row g-3">
                <div className="col-md-12">
                  <InputText
                    hookForm={hookForm}
                    field="billing_name"
                    label="Billing Name"
                    labelMandatory
                    errorText={errors.billing_name?.message}
                    placeholder="St. Mary Parish"
                  />
                </div>

                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="billing_email"
                    label="Billing Email"
                    labelMandatory
                    errorText={errors.billing_email?.message}
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
                    errorText={errors.billing_phone?.message}
                    placeholder="9876543210"
                  />
                </div>

                <div className="col-md-12">
                  <InputText
                    hookForm={hookForm}
                    field="billing_address"
                    label="Billing Address"
                    labelMandatory
                    errorText={errors.billing_address?.message}
                    placeholder="123 Church Street, Suite 100"
                  />
                </div>

                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="billing_city"
                    label="City"
                    labelMandatory
                    errorText={errors.billing_city?.message}
                    placeholder="Mumbai"
                  />
                </div>

                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="billing_state"
                    label="State"
                    labelMandatory
                    errorText={errors.billing_state?.message}
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="billing_pincode"
                    label="Pincode"
                    labelMandatory
                    errorText={errors.billing_pincode?.message}
                    placeholder="400001"
                  />
                </div>

                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="billing_country"
                    disabled={true}
                    label="Country"
                    labelMandatory
                    errorText={errors.billing_country?.message}
                    placeholder="IN"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === steps.indexOf("Admin User") && (
            <div className="step-content">
              <div className="row g-3">
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="admin_first_name"
                    label="Admin First Name"
                    labelMandatory
                    errorText={errors.admin_first_name?.message}
                    placeholder="e.g., John"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="admin_last_name"
                    label="Admin Last Name"
                    labelMandatory
                    errorText={errors.admin_last_name?.message}
                    placeholder="e.g., Smith"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="admin_email"
                    label="Admin Email"
                    labelMandatory
                    errorText={errors.admin_email?.message}
                    placeholder="e.g., admin@example.com"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="admin_password"
                    label="Admin Password"
                    labelMandatory
                    errorText={errors.admin_password?.message}
                    type="password"
                    placeholder="SecurePass123!"
                  />
                </div>
                <div className="col-md-6">
                  <InputPhone
                    hookForm={hookForm}
                    field="admin_phone"
                    label="Admin Phone"
                    labelMandatory
                    errorText={errors.admin_phone?.message}
                    placeholder="e.g., +1234567890"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="admin_role"
                    label="Admin Role"
                    labelMandatory
                    errorText={errors.admin_role?.message}
                    placeholder="e.g., Pastor"
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="admin_department"
                    label="Admin Department"
                    errorText={errors.admin_department?.message}
                    placeholder="e.g., Administration"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="modal-footer">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isCreating}
        >
          Cancel
        </Button>
        {currentStep > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={isCreating}
          >
            Back
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={isCreating}
          >
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button
            type="submit"
            form="create-church-form"
            variant="primary"
            isLoading={isCreating}
            disabled={isCreating}
          >
            {isCreating
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Church"
              : "Add Church"}
          </Button>
        )}
      </div>
    </ReactModal>
  );
};

export default CreateChurchModal;
