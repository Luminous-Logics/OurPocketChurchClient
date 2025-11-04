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

  return (
    <div className="form-group">
      <label className="form-control-label">
        {label}
        <span className="text-danger">{labelMandatory ? "*" : ""}</span>
      </label>
      <input
        type="text"
        className={`form-control ${isError(errors, field) ? "validate-field" : ""}`}
        placeholder={placeholder}
        {...register(field)}
      />
      {isError(errors, field) && errorText && (
        <div className="invalid-feedback">{errorText}</div>
      )}
    </div>
  );
};

export default InputPhone;
