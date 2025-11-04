/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import moment from "moment";
import Select from "react-select";
import React, { useState, useEffect } from "react";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

interface InputTimePickerProps<T extends FieldValues> {
  hookForm: UseFormReturn<T>;
  field: Path<T>;
  label: string;
  labelMandatory?: boolean;
  date?: string;
}

const InputTimePicker = <T extends FieldValues>({
  hookForm,
  field,
  label,
  date,
}: InputTimePickerProps<T>) => {
  const { watch, setValue } = hookForm;

  const [uid, setUid] = useState(`${Date.now() + field}`);
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<{
    hour: string | null;
    minute: string | null;
    period: string | null;
  }>({
    hour: null,
    minute: null,
    period: null,
  });

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));

  const minuteOptions = [
    { label: "00", value: "0" },
    { label: "30", value: "30" },
  ];

  useEffect(() => {
    const initialTime = watch(field);
    if (initialTime) {
      const date = new Date(initialTime);
      setHour(date.getHours() % 12 || 12);
      setMinute(date.getMinutes());
      setPeriod(date.getHours() >= 12 ? "PM" : "AM");
    }
  }, [watch, field]);

  useEffect(() => {
    const timeValue = watch(field);
    if (!timeValue) return;

    const momentTime = moment(timeValue, [
      "hh:mm A",
      "YYYY-MM-DDTHH:mm:ss.SSSSSSS",
    ]);
    if (momentTime.isValid()) {
      let h = momentTime.hour();
      const m = momentTime.minute();
      const p = h >= 12 ? "PM" : "AM";

      h = h % 12 || 12; // Convert to 12-hour format

      setHour(h);
      setMinute(m);
      setPeriod(p as "AM" | "PM");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch(field)]);

  const validate = () => {
    let isValid = true;
    const newErrors: {
      hour: string | null;
      minute: string | null;
      period: string | null;
    } = {
      hour: null,
      minute: null,
      period: null,
    };

    if (hour === null) {
      newErrors.hour = "Please select an hour.";
      isValid = false;
    }
    if (minute === null) {
      newErrors.minute = "Please select a minute.";
      isValid = false;
    }
    if (!period) {
      newErrors.period = "Please select AM or PM.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSetTime = () => {
    if (validate()) {
      if (hour !== null && minute !== null && period && date) {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        const timeString = `${formattedDate} ${hour}:${minute} ${period}`;
        const time = moment(timeString, "YYYY-MM-DD h:mm A");
        if (!time.isValid()) {
          console.error("Invalid time:", timeString);
          return;
        }
        const formattedTime = time.format("YYYY-MM-DDTHH:mm:ss.SSSSSSS");
        setValue(field, `${formattedTime}` as PathValue<T, Path<T>>);
        setIsOpen(false);
      }
    }
  };

  const toggleTimePicker = () => {
    if (!date) {
      setErrors({ ...errors, hour: "Date is required!" });
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleFieldChange = () => {
    setErrors({ hour: null, minute: null, period: null });
  };

  const formattedTime = () => {
    if (hour !== null && minute !== null && period) {
      return `${hour}:${minute < 10 ? `0${minute}` : minute} ${period}`;
    }
    return "";
  };

  return (
    <div style={{ zIndex: "10" }}>
      <div className="form-group CustomTimepicker">
        <label className="form-control-label">{label}</label>
        <div className="timePickerInput" onClick={toggleTimePicker}>
          <input
            type="text"
            className={`form-control ${
              errors.hour || errors.minute || errors.period
                ? "validate-field"
                : ""
            }`}
            placeholder={label}
            readOnly
            value={formattedTime()}
          />
          <i className="icon-session-out"></i>
        </div>
        {isOpen && (
          <div className="selecTime">
            <h5>Enter time</h5>
            <ul>
              <li>
                <div className="hour">
                  <div className={`customDropdown`}>
                    <Select
                      options={hourOptions}
                      value={
                        hour !== null
                          ? { label: hour.toString(), value: hour.toString() }
                          : null
                      }
                      onChange={(selectedOption) => {
                        setHour(
                          selectedOption ? parseInt(selectedOption.value) : null
                        );
                        handleFieldChange();
                      }}
                      placeholder=""
                      classNamePrefix="custom-select"
                    />
                  </div>
                </div>
                <h6>Hour</h6>
                {errors.hour && (
                  <div className="error-message">{errors.hour}</div>
                )}
              </li>
              <li>
                <div className="minute">
                  <div className={`customDropdown`}>
                    <Select
                      options={minuteOptions}
                      value={
                        minute !== null
                          ? {
                              label: minute.toString(),
                              value: minute.toString(),
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        setMinute(
                          selectedOption ? parseInt(selectedOption.value) : null
                        );
                        handleFieldChange();
                      }}
                      placeholder=""
                      classNamePrefix="custom-select"
                    />
                  </div>
                </div>
                <h6>Minute</h6>
                {errors.minute && (
                  <div className="error-message">{errors.minute}</div>
                )}
              </li>
              <li>
                <div className="switchbtn">
                  <div className="yesnobtn">
                    {["AM", "PM"].map((item, ind) => (
                      <div key={ind} className="form-check form-check-inline">
                        <input
                          id={uid + item}
                          type="radio"
                          checked={period === item}
                          value={item}
                          name={uid + item}
                          onChange={(e) => {
                            setPeriod(e.target.value as "AM" | "PM");
                            handleFieldChange();
                          }}
                          className="form-check-input"
                        />
                        <label
                          htmlFor={`${uid + item}`}
                          className="form-check-label"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {errors.period && (
                  <div className="error-message">{errors.period}</div>
                )}
              </li>
            </ul>
            <div className="submitFooter">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setValue(field, "" as PathValue<T, Path<T>>);
                  setIsOpen(false);
                }}
              >
                Cancel
              </button>
              <button className="btn" type="button" onClick={handleSetTime}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputTimePicker;
