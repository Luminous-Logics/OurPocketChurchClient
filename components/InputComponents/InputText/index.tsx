/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from "@/utils/helpers";
import { InputHTMLAttributes } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type TextTransformMode = "capitalize" | "uppercase" | "lowercase" | "none";

type InputTextProps<T extends FieldValues> = {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  errorText?: string;
  labelMandatory?: boolean;
  infoText?: string;
  showInfoIcon?: boolean;
  textTransformMode?: TextTransformMode;
  onConditionCheck?: (newValue: string, oldValue: string) => boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const InputText = <T extends FieldValues>({
  hookForm,
  field,
  label,
  labelMandatory,
  infoText,
  showInfoIcon,
  textTransformMode = "none",
  onConditionCheck,
  ...props
}: InputTextProps<T>) => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = hookForm;

  const textTransformHandler = (value: string) => {
    switch (textTransformMode) {
      case "capitalize":
        return value.length > 0
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : value;
      case "uppercase":
        return value.toUpperCase();
      case "lowercase":
        return value.toLowerCase();
      default:
        return value;
    }
  };

  const error = errors[field];
  const errorMessage = error?.message as string;
  const hasError = isError(errors, field);

  return (
    <div className="input-field-wrapper">
      {label && (
        <label
          className="form-control-label"
          htmlFor={field}
        >
          {label}
          {labelMandatory && <span className="text-danger"> *</span>}
          {showInfoIcon && infoText && (
            <div className="infolabelText">
              <i className="icon icon-info" />
              <span>{infoText}</span>
            </div>
          )}
        </label>
      )}

      <input
        id={field}
        className={`form-control ${hasError ? "validate-field" : ""}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field}-error` : undefined}
        {...props}
        {...register(field, {
          onChange: (e) => {
            const oldValue = getValues(field) as string;
            const newValue = textTransformHandler(e.target.value);
            if (onConditionCheck && !onConditionCheck(newValue, oldValue)) {
              e.preventDefault();
              return;
            }

            setValue(field, newValue as any, { shouldValidate: true });
          },
        })}
        onBlur={props.onBlur}
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

export default InputText;
