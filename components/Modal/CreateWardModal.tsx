"use client";
import React from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import InputText from "../InputComponents/InputText";
import InputTextArea from "../InputComponents/InputTextArea";
import "./styles.scss";

// Validation schema
export const createWardSchema = z.object({
  parish_id: z.number().optional().nullable(),
  ward_name: z.string().min(1, "Ward Name is required"),
  ward_number: z.string().min(1, "Ward Number is required"),
  description: z.string().optional(),
  coordinator_id: z.string().optional().nullable(),
  area_coverage: z.string().optional(),
});

export type CreateWardFormType = z.infer<typeof createWardSchema>;

interface CreateWardModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookForm: UseFormReturn<CreateWardFormType>;
  isCreating: boolean;
  onSubmit: (data: CreateWardFormType) => Promise<void>;
  isEditMode?: boolean; // New prop
}

const CreateWardModal: React.FC<CreateWardModalProps> = ({
  isOpen,
  onClose,
  hookForm,
  isCreating,
  onSubmit,
  isEditMode = false, // Default to false
}) => {
  const { handleSubmit,formState:{errors}} = hookForm;
  console.log(errors)
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit Ward" : "Create New Ward"} // Dynamic title
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">{isEditMode ? "Edit Ward" : "Create New Ward"}</h3> {/* Dynamic title */}
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
        <form onSubmit={handleSubmit(onSubmit)} id="create-ward-form">
          <div className="row g-3">
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="ward_name"
                label="Ward Name"
                labelMandatory
                errorText="Ward Name is required"
                placeholder="e.g., Ward 1 - North"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="ward_number"
                label="Ward Number"
                labelMandatory
                errorText="Ward Number is required"
                placeholder="e.g., W001"
              />
            </div>

            <div className="col-12">
              <InputTextArea
                hookForm={hookForm}
                field="description"
                label="Description"
                placeholder="Brief description of the ward"
                rows={3}
              />
            </div>

              {isEditMode && (
                <div className="col-md-6">
                  <InputText
                    hookForm={hookForm}
                    field="coordinator_id"
                    label="Coordinator ID"
                    placeholder="Optional"
                  />
                </div>
              )}
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="area_coverage"
                label="Area Coverage"
                placeholder="e.g., Main Street, Oak Avenue"
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
          form="create-ward-form"
          variant="primary"
          isLoading={isCreating}
          disabled={isCreating}
        >
          {isCreating
            ? isEditMode ? "Updating..." : "Creating..."
            : isEditMode ? "Update Ward" : "Create Ward"}
        </Button>
      </div>
    </ReactModal>
  );
};

export default CreateWardModal;
