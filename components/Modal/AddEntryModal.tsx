/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import InputText from "../InputComponents/InputText";
import InputDropDown from "../InputComponents/InputDropDown";
import InputTextArea from "../InputComponents/InputTextArea";
import "./styles.scss";
import { dropDownSchemaOpt } from "@/zod";
import { Transaction, TransactionType } from "@/types";

export const addEntrySchema = z.object({
  transaction_date: z.string().min(1, "Transaction date is required"),
  transaction_type: dropDownSchemaOpt,
  category_id: dropDownSchemaOpt,
  amount: z.string().min(1, "Amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 999999999.99;
    },
    { message: "Amount must be a positive number up to 999999999.99" }
  ),
  description: z.string().min(1, "Description is required").max(500, "Description must be at most 500 characters"),
  reference_number: z.string().max(100, "Reference number must be at most 100 characters").optional().or(z.literal("")),
  payment_method: dropDownSchemaOpt.optional(),
});

export type AddEntryFormType = z.infer<typeof addEntrySchema>;

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookForm: UseFormReturn<AddEntryFormType>;
  isCreating: boolean;
  onSubmit: (data: AddEntryFormType) => Promise<void>;
  isEditMode?: boolean;
  initialValues?: Transaction | null;
  categories: Array<{ category_id: number; category_name: string; category_type: TransactionType }>;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  hookForm,
  isCreating,
  onSubmit,
  isEditMode = false,
  initialValues = null,
  categories,
}) => {
  const {
    handleSubmit,
    reset,
    watch,
  } = hookForm;

  const selectedTransactionType = watch("transaction_type");

  // Filter categories based on selected transaction type
  const filteredCategories = React.useMemo(() => {
    if (!selectedTransactionType?.value) return [];
    return categories
      .filter((cat) => cat.category_type === selectedTransactionType.value)
      .map((cat) => ({
        label: cat.category_name,
        value: String(cat.category_id),
      }));
  }, [selectedTransactionType, categories]);

  const transactionTypeOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  const paymentMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "online", label: "Online" },
    { value: "other", label: "Other" },
  ];

  // Effect to reset form with initial values when modal opens in edit mode
  React.useEffect(() => {
    if (isOpen && isEditMode && initialValues) {
      reset({
        transaction_date: initialValues.transaction_date.split('T')[0],
        transaction_type: {
          label: initialValues.transaction_type === "income" ? "Income" : "Expense",
          value: initialValues.transaction_type,
        },
        category_id: {
          label: initialValues.category_name || "Select category",
          value: String(initialValues.category_id),
        },
        amount: String(initialValues.amount),
        description: initialValues.description,
        reference_number: initialValues.reference_number || "",
        payment_method: initialValues.payment_method
          ? {
              label: initialValues.payment_method.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
              value: initialValues.payment_method,
            }
          : { label: "", value: "" },
      });
    } else if (isOpen && !isEditMode) {
      // Reset for creation mode
      reset({
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: { label: "", value: "" },
        category_id: { label: "", value: "" },
        amount: "",
        description: "",
        reference_number: "",
        payment_method: { label: "", value: "" },
      });
    }
  }, [isOpen, isEditMode, initialValues, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit Entry" : "Add New Entry"}
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">
          {isEditMode ? "Edit Entry" : "Add New Entry"}
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
        <form onSubmit={handleSubmit(onSubmit)} id="add-entry-form">
          <div className="row g-3">
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="transaction_date"
                label="Transaction Date"
                labelMandatory
                errorText="Transaction date is required"
                type="date"
              />
            </div>

            <div className="col-md-6">
              <InputDropDown
                hookForm={hookForm}
                field="transaction_type"
                label="Transaction Type"
                labelMandatory
                errorText="Transaction type is required"
                placeholder="Select type"
                options={transactionTypeOptions}
              />
            </div>

            <div className="col-md-6">
              <InputDropDown
                hookForm={hookForm}
                field="category_id"
                label="Category"
                labelMandatory
                errorText="Category is required"
                placeholder="Select category"
                options={filteredCategories}
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="amount"
                label="Amount"
                labelMandatory
                errorText="Amount is required"
                placeholder="0.00"
                type="text"
              />
            </div>

            <div className="col-md-12">
              <InputTextArea
                hookForm={hookForm}
                field="description"
                label="Description"
                labelMandatory
                errorText="Description is required"
                placeholder="Enter transaction description"
                rows={3}
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="reference_number"
                label="Reference Number"
                placeholder="Optional reference number"
              />
            </div>

            <div className="col-md-6">
              <InputDropDown
                hookForm={hookForm}
                field="payment_method"
                label="Payment Method"
                placeholder="Select payment method (optional)"
                options={paymentMethodOptions}
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
          form="add-entry-form"
          variant="primary"
          isLoading={isCreating}
          disabled={isCreating}
        >
          {isCreating
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
            ? "Update Entry"
            : "Add Entry"}
        </Button>
      </div>
    </ReactModal>
  );
};

export default AddEntryModal;
