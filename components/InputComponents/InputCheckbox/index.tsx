/* eslint-disable @typescript-eslint/no-unused-vars */
import { isError } from "@/utils/helpers";
import { InputHTMLAttributes } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type InputTextProps<T extends FieldValues> = {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  errorText?: string;
  labelMandatory?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const InputCheckbox = <T extends FieldValues>({
  hookForm,
  field,
  label,
  labelMandatory,
  ...props
}: InputTextProps<T>) => {
  const {
    register,
    formState: { errors },
  } = hookForm;

  return (
    <div className="agree form-check">
      <input
        type="checkbox"
        id={field}
        className={`form-check-input ${
          isError(errors, field) ? "validate-field" : ""
        }`}
        {...register(field)}
        {...props}
      />
      <label htmlFor={field} className="form-check-label">
        {label}<span className="text-danger">{labelMandatory ? "*" : ""}</span>
      </label>
    </div>
  );
};

export default InputCheckbox;
