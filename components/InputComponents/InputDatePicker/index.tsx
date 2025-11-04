import moment from "moment";
import DatePicker from "react-datepicker";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import { isError } from "@/utils/helpers";

interface DatePickerProps<T extends FieldValues> {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  labelMandatory?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  placeholder?: string; // Added placeholder prop
}

const InputDatePicker = <T extends FieldValues>({
  hookForm,
  field,
  label,
  labelMandatory,
  minDate,
  maxDate,
  showMonthDropdown,
  showYearDropdown,
  placeholder, // Destructure placeholder
}: DatePickerProps<T>) => {
  const {
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = hookForm;

  return (
    <div className="customDatePicker">
      <label className="form-control-label">
        {label}
        <span className="text-danger">{labelMandatory ? "*" : ""}</span>
      </label>
      <DatePicker
        onChange={(e) => {
          console.log(e);
          setValue(field, e?.toString() as PathValue<T, Path<T>>);
          if (e) {
            clearErrors(field);
          }
        }}
        value={watch(field) ? moment(watch(field)).format("D-MMM-YYYY") : ""}
        selected={watch(field) ? new Date(watch(field)) : null}
        wrapperClassName={`${isError(errors, field) ? "DatePicker-field" : ""}`}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder} // Pass placeholder to react-datepicker
      />
    </div>
  );
};

export default InputDatePicker;
