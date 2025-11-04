"use client";

import React from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import InputDropDown from "../InputComponents/InputDropDown";
import InputText from "../InputComponents/InputText";
import "./styles.scss";
import { dropDownSchemaOpt } from "@/zod";
import { Role } from "@/types";

export const assignRoleSchema = z.object({
  role_id: dropDownSchemaOpt,
  expires_at: z.string().optional().or(z.literal("")),
});

export type AssignRoleFormType = z.infer<typeof assignRoleSchema>;

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookForm: UseFormReturn<AssignRoleFormType>;
  isAssigning: boolean;
  onSubmit: (data: AssignRoleFormType) => Promise<void>;
  userName?: string;
  roles: Role[];
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  onClose,
  hookForm,
  isAssigning,
  onSubmit,
  userName,
  roles,
}) => {
  const {
    handleSubmit,
    reset,
  } = hookForm;

  const roleOptions = React.useMemo(() => {
    return roles
      .filter((role) => role.is_active)
      .map((role) => ({
        label: role.role_name,
        value: String(role.role_id),
      }));
  }, [roles]);

  React.useEffect(() => {
    if (isOpen) {
      reset({
        role_id: { label: "", value: "" },
        expires_at: "",
      });
    }
  }, [isOpen, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Assign Role"
      className="modal-content"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">Assign Role</h3>
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
        {userName && (
          <p className="mb-3">
            Assign a role to <strong>{userName}</strong>
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} id="assign-role-form">
          <div className="row g-3">
            <div className="col-md-12">
              <InputDropDown
                hookForm={hookForm}
                field="role_id"
                label="Select Role"
                labelMandatory
                errorText="Role is required"
                placeholder="Choose a role"
                options={roleOptions}
              />
            </div>

            <div className="col-md-12">
              <InputText
                hookForm={hookForm}
                field="expires_at"
                label="Expiration Date (Optional)"
                type="datetime-local"
                placeholder="Select expiration date and time"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for permanent role assignment
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
          disabled={isAssigning}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="assign-role-form"
          variant="primary"
          isLoading={isAssigning}
          disabled={isAssigning}
        >
          {isAssigning ? "Assigning..." : "Assign Role"}
        </Button>
      </div>
    </ReactModal>
  );
};

export default AssignRoleModal;
