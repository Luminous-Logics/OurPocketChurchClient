import CreatableSelect from "react-select/creatable";
import { Controller, FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

type SelectItem = {
  value: string;
  label: string;
};

type InputSelectProps<T extends FieldValues> = {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  options: SelectItem[];
  placeholder: string;
  isMultiple?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;
  onChangeHandle?: (data: SelectItem[]) => void;
};

const InputCreatableDropDown = <T extends FieldValues>({
  hookForm,
  field,
  label,
  options,
  placeholder,
  isMultiple,
  isDisabled,
  isClearable,
  onChangeHandle,
}: InputSelectProps<T>) => {
  const { control,setValue,getValues } = hookForm;

  return (
    <div className={`customDropdown ${isMultiple ? "multiDropdown" : ""}`}>
      <label className="form-control-label">{label}</label>
      <Controller
        name={field}
        control={control}
        render={({ field: { onChange, value } }) => (
          <CreatableSelect
            options={options}
            onChange={(selected) => {
              onChange(selected);
              if (onChangeHandle) onChangeHandle(selected as SelectItem[]);
            }}
            onCreateOption={(inputValue) => {
              const newOption: SelectItem = { label: inputValue, value: "0" };
              setValue(field, [...getValues(field), newOption]  as PathValue<T, Path<T>>);
            }}
            placeholder={placeholder}
            classNamePrefix="custom-select"
            isClearable={isClearable}
            value={value as SelectItem[]}
            isMulti={isMultiple}
            isDisabled={isDisabled}
          />
        )}
      />
    </div>
  );
};

export default InputCreatableDropDown;
