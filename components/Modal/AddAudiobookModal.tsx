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
import { Audiobook } from "@/types";

// Validation schema - matching backend Joi validation
const currentYear = new Date().getFullYear();

export const addAudiobookSchema = z.object({
  parish_id: z.number().int().positive(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  author: z.string().min(1, "Author is required").max(255, "Author must be less than 255 characters"),
  narrator: z.string().max(255, "Narrator must be less than 255 characters").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  thumbnail_url: z.string().url("Must be a valid URL").max(500, "URL must be less than 500 characters").optional().or(z.literal("")),
  audio_file_url: z.string().min(1, "Audio file URL is required").optional().or(z.literal("")),
  duration_minutes: z.string().min(1, "Duration is required").refine(
    (val) => !val || (parseInt(val, 10) >= 0),
    { message: "Duration must be 0 or greater" }
  ),
  file_size_mb: z.string().optional().or(z.literal("")).refine(
    (val) => !val || (parseFloat(val) >= 0),
    { message: "File size must be 0 or greater" }
  ),
  category: z.string().max(100, "Category must be less than 100 characters").optional().or(z.literal("")),
  language: dropDownSchemaOpt,
  publication_year: z.string().optional().or(z.literal("")).refine(
    (val) => {
      if (!val) return true; // Optional field
      const year = parseInt(val, 10);
      return year >= 1000 && year <= currentYear + 1;
    },
    { message: `Publication year must be between 1000 and ${currentYear + 1}` }
  ),
});

export type AddAudiobookFormType = z.infer<typeof addAudiobookSchema>;

interface AddAudiobookModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookForm: UseFormReturn<AddAudiobookFormType>;
  isCreating: boolean;
  onSubmit: (data: AddAudiobookFormType) => Promise<void>;
  isEditMode?: boolean;
  initialValues?: Audiobook | null;
  parishId?: number;
}

const languageOptions = [
  { label: "English", value: "English" },
  { label: "Spanish", value: "Spanish" },
  { label: "Portuguese", value: "Portuguese" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
  { label: "Italian", value: "Italian" },
  { label: "Other", value: "Other" },
];

const AddAudiobookModal: React.FC<AddAudiobookModalProps> = ({
  isOpen,
  onClose,
  hookForm,
  isCreating,
  onSubmit,
  isEditMode = false,
  initialValues = null,
  parishId,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = hookForm;

  console.log(errors);

  // Effect to reset form with initial values when modal opens
  React.useEffect(() => {
    if (isOpen && isEditMode && initialValues) {
      reset({
        parish_id: parishId,
        title: initialValues.title,
        author: initialValues.author,
        narrator: initialValues.narrator || "",
        description: initialValues.description || "",
        thumbnail_url: initialValues.thumbnail_url || "",
        audio_file_url: initialValues.audio_file_url,
        // Convert numbers to strings for form inputs
        duration_minutes: initialValues.duration_minutes ? String(initialValues.duration_minutes) : "",
        file_size_mb: initialValues.file_size_mb ? String(initialValues.file_size_mb) : "",
        category: initialValues.category || "",
        language: {
          label: initialValues.language,
          value: initialValues.language,
        },
        publication_year: initialValues.publication_year ? String(initialValues.publication_year) : "",
      });
    } else if (isOpen && !isEditMode) {
      // Reset for creation mode
      reset({
        parish_id: parishId,
        title: "",
        author: "",
        narrator: "",
        description: "",
        thumbnail_url: "",
        audio_file_url: "",
        duration_minutes: "",
        file_size_mb: "",
        category: "",
        language: { label: "", value: "" },
        publication_year: "",
      });
    }
  }, [isOpen, isEditMode, initialValues, reset, parishId]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit Audiobook" : "Add New Audiobook"}
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">
          {isEditMode ? "Edit Audiobook" : "Add New Audiobook"}
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
        <form onSubmit={handleSubmit(onSubmit)} id="add-audiobook-form">
          <div className="row g-3">
            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="title"
                label="Title"
                labelMandatory
                errorText="Title is required"
                placeholder="e.g., The Imitation of Christ"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="author"
                label="Author"
                labelMandatory
                errorText="Author is required"
                placeholder="e.g., Thomas à Kempis"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="narrator"
                label="Narrator"
                placeholder="e.g., John Doe"
              />
            </div>

            <div className="col-md-6">
              <InputDropDown
                hookForm={hookForm}
                field="language"
                label="Language"
                labelMandatory
                errorText="Language is required"
                placeholder="Select language"
                options={languageOptions}
              />
            </div>

            <div className="col-12">
              <InputTextArea
                hookForm={hookForm}
                field="description"
                label="Description"
                placeholder="Enter audiobook description"
                rows={3}
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="audio_file_url"
                label="Audio File URL"
                labelMandatory
                errorText="Audio file URL is required"
                placeholder="https://example.com/audiobook.mp3"
              />
            </div>

            <div className="col-md-6">
              <InputText
                hookForm={hookForm}
                field="thumbnail_url"
                label="Thumbnail URL"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="col-md-4">
              <InputText
                hookForm={hookForm}
                field="duration_minutes"
                label="Duration (minutes)"
                labelMandatory
                errorText="Duration is required"
                placeholder="e.g., 525"
                type="number"
              />
            </div>

            <div className="col-md-4">
              <InputText
                hookForm={hookForm}
                field="file_size_mb"
                label="File Size (MB)"
                placeholder="e.g., 150"
                type="number"
              />
            </div>

            <div className="col-md-4">
              <InputText
                hookForm={hookForm}
                field="publication_year"
                label="Publication Year"
                placeholder="e.g., 2024"
                type="number"
              />
            </div>

            <div className="col-12">
              <InputText
                hookForm={hookForm}
                field="category"
                label="Category"
                placeholder="e.g., Spiritual, Biography, Theology"
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
          form="add-audiobook-form"
          variant="primary"
          isLoading={isCreating}
          disabled={isCreating}
        >
          {isCreating
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Audiobook"
            : "Add Audiobook"}
        </Button>
      </div>
    </ReactModal>
  );
};

export default AddAudiobookModal;
