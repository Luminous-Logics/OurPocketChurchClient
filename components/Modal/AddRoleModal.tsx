"use client";

import React from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import InputText from "../InputComponents/InputText";
import InputTextArea from "../InputComponents/InputTextArea";
import InputNumber from "../InputComponents/InputNumber";
import "./styles.scss";
import { Role } from "@/types";

export const addRoleSchema = z.object({
  role_name: z.string().min(1, "Role name is required"),
  role_code: z.string().min(1, "Role code is required").regex(/^[A-Z_]+$/, "Role code must be uppercase with underscores only"),
  description: z.string().optional().or(z.literal("")),
  priority: z.string().optional().or(z.literal("")),
});

export type AddRoleFormType = z.infer<typeof addRoleSchema>;

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookForm: UseFormReturn<AddRoleFormType>;
  isCreating: boolean;
  onSubmit: (data: AddRoleFormType) => Promise<void>;
  isEditMode?: boolean;
  initialValues?: Role | null;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  onClose,
  hookForm,
  isCreating,
  onSubmit,
  isEditMode = false,
  initialValues = null,
}) => {
  const {
    handleSubmit,
    reset,
  } = hookForm;

  // Effect to reset form with initial values when modal opens in edit mode
  React.useEffect(() => {
    if (isOpen && isEditMode && initialValues) {
      reset({
        role_name: initialValues.role_name,
        role_code: initialValues.role_code,
        description: initialValues.description || "",
        priority: initialValues.priority?.toString() || "",
      });
    } else if (isOpen && !isEditMode) {
      reset({
        role_name: "",
        role_code: "",
        description: "",
        priority: "",
      });
    }
  }, [isOpen, isEditMode, initialValues, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit Role" : "Create New Role"}
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">
          {isEditMode ? "Edit Role" : "Create New Role"}
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
        <form onSubmit={handleSubmit(onSubmit)} id="add-role-form">
          <div className="row g-3">
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="role_name"
                label="Role Name"
                labelMandatory
                errorText="Role name is required"
                placeholder="e.g., Event Coordinator"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="role_code"
                label="Role Code"
                labelMandatory
                errorText="Role code is required"
                placeholder="e.g., EVENT_COORDINATOR"
                disabled={isEditMode && initialValues?.is_system_role}
              />
              {isEditMode && initialValues?.is_system_role && (
                <p className="text-xs text-gray-500 mt-1">
                  System role codes cannot be changed
                </p>
              )}
            </div>

            <div className="col-md-12">
              <InputTextArea
                hookForm={hookForm}
                field="description"
                label="Description"
                placeholder="Describe the role's responsibilities..."
                rows={3}
              />
            </div>

            <div className="col-md-12">
              <InputNumber
                hookForm={hookForm}
                field="priority"
                label="Priority (Optional)"
                placeholder="e.g., 5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher priority roles appear first in lists
              </p>
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
          form="add-role-form"
          variant="primary"
          isLoading={isCreating}
          disabled={isCreating}
        >
          {isCreating
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Role"
            : "Create Role"}
        </Button>
      </div>
    </ReactModal>
  );
};

export default AddRoleModal;
