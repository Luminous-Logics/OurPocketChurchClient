/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from "@/utils/helpers";
import { InputHTMLAttributes } from "react";
import { FieldValues, UseFormReturn, Path } from "react-hook-form";

type InputTextProps<T extends FieldValues> = {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  errorText?: string;
  labelMandatory?: boolean;
  rows?:number;
} & InputHTMLAttributes<HTMLTextAreaElement>;

const InputTextArea = <T extends FieldValues>({
  hookForm,
  field,
  label,
  labelMandatory,
  disabled,
  rows,
  ...props
}: InputTextProps<T>) => {
  const {
    register,
    formState: { errors },
  } = hookForm;

  return (
    <>
      <label className="form-control-label">
        {label}
        <span className="text-danger">
          {labelMandatory ? "*" : ""}
        </span>
      </label>
      <textarea
        {...props}
        className={`form-control ${
          isError(errors, field) ? "validate-field" : ""
        }`}
        {...register(field)}
        onBlur={props.onBlur}
        disabled={disabled}
        rows={rows}
      />
    </>
  );
};

export default InputTextArea;
