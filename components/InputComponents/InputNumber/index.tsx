import { isError } from "@/utils/helpers";
import { InputHTMLAttributes } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type InputTextProps<T extends FieldValues> = {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  errorText?: string;
  labelMandatory?: boolean;
  infoText?: string;
  showInfoIcon?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const InputNumber = <T extends FieldValues>({
  hookForm,
  field,
  label,
  labelMandatory,
  infoText,
  showInfoIcon,
  ...props
}: InputTextProps<T>) => {
  const {
    register,
    formState: { errors },
  } = hookForm;

  return (
    <>
      <label className="form-control-label infoLabel">
        {label}
        <span className="text-danger">{labelMandatory ? "*" : ""}</span>
        {showInfoIcon && infoText && (
          <div className="infolabelText">
            <i className="icon icon-info" />
            <span>{infoText}</span>
          </div>
        )}
      </label>

      <input
        className={`form-control ${
          isError(errors, field) ? "validate-field" : ""
        }`}
        {...props}
        {...register(field, {
          onChange: (e) => {
            const cleaned = e.target.value.replace(/[^0-9]/g, "");
            e.target.value = cleaned;
          },
        })}
        onBlur={props.onBlur}
      />
    </>
  );
};

export default InputNumber;
