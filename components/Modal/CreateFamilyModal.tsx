/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import InputText from "../InputComponents/InputText";
// import InputNumber from "../InputComponents/InputNumber"; // Removed as no longer needed
// import InputTextArea from "../InputComponents/InputTextArea"; // Removed as no longer needed
import InputDropDown from "../InputComponents/InputDropDown";
import "./styles.scss";
import { dropDownSchemaOpt } from "@/zod";

// Validation schema
export const createFamilySchema = z.object({
  parish_id: z.number().min(1, "Parish ID is required"),
  family_name: z.string().min(1, "Family Name is required"),
  head_of_family: z.string().min(1, "Head of Family is required"),
  ward_id: dropDownSchemaOpt,
  home_phone: z.string().optional(),
  address_line1: z.string().optional(), // New address fields
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
});

export type CreateFamilyFormType = z.infer<typeof createFamilySchema>;

import { Family } from "@/types"; // Import Family type

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookForm: UseFormReturn<CreateFamilyFormType>;
  isCreating: boolean;
  onSubmit: (data: CreateFamilyFormType) => Promise<void>;
  isEditMode?: boolean;
  initialValues?: Family | null; // Added initialValues prop
  wards: { label: string; value: string }[];
  parishId?: number;
}

const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  isOpen,
  onClose,
  hookForm,
  isCreating,
  onSubmit,
  isEditMode = false,
  initialValues = null, // Default to null
  parishId,
  wards,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = hookForm; // Destructure reset
  console.log(errors);

  // Effect to reset form with initial values when modal opens in edit mode
  React.useEffect(() => {
    if (isOpen && isEditMode && initialValues) {
      reset({
        parish_id: parishId,
        family_name: initialValues.family_name,
        head_of_family: initialValues.head_of_family || "",
        ward_id: {
          label: `Ward ${initialValues.ward_id}`,
          value: String(initialValues.ward_id),
        },
        home_phone: initialValues.home_phone || "",
        address_line1: initialValues.address_line1 || "",
        address_line2: initialValues.address_line2 || "",
        city: initialValues.city || "",
        state: initialValues.state || "",
        country: initialValues.country || "",
        postal_code: initialValues.postal_code || "",
      });
    } else if (isOpen && !isEditMode) {
      // Reset for creation mode if modal opens
      reset({
        parish_id: parishId, // Provide a default or handle appropriately
        family_name: "",
        head_of_family: "",
        ward_id: { label: "", value: "" },
        home_phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
      });
    }
  }, [isOpen, isEditMode, initialValues, reset]);
  console.log(wards);
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit Family" : "Add New Family"}
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">
          {isEditMode ? "Edit Family" : "Add New Family"}
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
        <form onSubmit={handleSubmit(onSubmit)} id="create-family-form">
          <div className="row g-3">
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="family_name"
                label="Family Name"
                labelMandatory
                errorText="Family Name is required"
                placeholder="e.g., The Johnsons"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="head_of_family"
                label="Head of Family"
                labelMandatory
                errorText="Head of Family is required"
                placeholder="e.g., John Johnson"
              />
            </div>

            <div className="col-md-6">
              <InputDropDown
                hookForm={hookForm}
                field="ward_id"
                label="Ward"
                labelMandatory
                errorText="Ward is required"
                placeholder="Select ward"
                options={wards}
              />
            </div>
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="home_phone"
                label="Phone"
                placeholder="e.g., +1 555 123 4567"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="address_line1"
                label="Address Line 1"
                placeholder="e.g., 123 Main St"
              />
            </div>
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="address_line2"
                label="Address Line 2"
                placeholder="e.g., Apt 4B"
              />
            </div>
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="city"
                label="City"
                placeholder="e.g., Springfield"
              />
            </div>
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="state"
                label="State"
                placeholder="e.g., IL"
              />
            </div>
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="country"
                label="Country"
                placeholder="e.g., USA"
              />
            </div>
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="postal_code"
                label="Postal Code"
                placeholder="e.g., 62704"
              />
            </div>
          </div>
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
        <Button
          type="submit"
          form="create-family-form"
          variant="primary"
          isLoading={isCreating}
          disabled={isCreating}
        >
          {isCreating
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Family"
            : "Add Family"}
        </Button>
      </div>
    </ReactModal>
  );
};

export default CreateFamilyModal;
