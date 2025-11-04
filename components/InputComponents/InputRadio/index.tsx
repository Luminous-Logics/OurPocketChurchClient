import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

interface InputRadioProps<T extends FieldValues> {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  options: [string, string];
  labelMandatory?: boolean;
  disabled?: boolean;
}

const InputRadio = <T extends FieldValues>({
  hookForm,
  field,
  label,
  options,
  labelMandatory,
  disabled,
}: InputRadioProps<T>) => {
  const { watch, register, setValue} = hookForm;

  return (
    <div className="switchbtn">
      <label htmlFor="" className="form-control-label">
        {label}
        <span className="text-danger">
          {labelMandatory ? "*" : ""}
        </span>
      </label>
      <div className="yesnobtn">
        {["true", "false"].map((item, ind) => (
          <div key={ind} className="form-check form-check-inline">
            <input
              id={`${field}-${ind}`}
              type="radio"
              checked={watch(field) === (ind === 0)}
              value={item}
              disabled={disabled}
              name={register(field).name}
              onChange={(e) => {
                setValue(
                  field,
                  (e?.target?.value === "true") as PathValue<T, Path<T>>
                );
              }}
              className="form-check-input"
            />
            <label htmlFor={`${field}-${ind}`} className="form-check-label">
              {item === "true" ? options[0] : options[1]}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputRadio;
