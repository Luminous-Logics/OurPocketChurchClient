"use client";
import React from "react";
import { FieldValues, UseFormReturn, Path } from "react-hook-form";
import { isError } from "@/utils/helpers";

interface InputPhoneProps<T extends FieldValues> {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  labelMandatory?: boolean;
  errorText?: string;
  placeholder?: string;
}

const InputPhone = <T extends FieldValues>({
  hookForm,
  field,
  label,
  labelMandatory,
  errorText,
  placeholder,
}: InputPhoneProps<T>) => {
  const {
    register,
    formState: { errors },
  } = hookForm;

  const error = errors[field];
  const errorMessage = (error?.message as string) || errorText;
  const hasError = isError(errors, field);

  return (
    <div className="input-field-wrapper">
      <label className="form-control-label" htmlFor={field}>
        {label}
        {labelMandatory && <span className="text-danger"> *</span>}
      </label>
      <input
        id={field}
        type="tel"
        className={`form-control ${hasError ? "validate-field" : ""}`}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field}-error` : undefined}
        autoComplete="tel"
        {...register(field)}
      />
      {hasError && errorMessage && (
        <div
          id={`${field}-error`}
          className="field-error-message"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default InputPhone;
