import type { ChangeEvent } from "react";
import { ControlRow } from "./ControlRow";

interface Props {
  value: number | null;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  fieldName: string;
  onChange: (value: number | null) => void;
  format?: (n: number) => string;
  id?: string;
}

export function DefaultableSlider({
  value,
  defaultValue,
  min,
  max,
  step,
  fieldName,
  onChange,
  format = (n) => n.toFixed(2),
  id,
}: Props) {
  const isOverridden = value !== null;
  const effective = value ?? defaultValue;

  const onRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };
  const onReset = () => onChange(null);

  return (
    <ControlRow
      isOverridden={isOverridden}
      fieldName={fieldName}
      onReset={onReset}
    >
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={effective}
        onChange={onRangeChange}
        aria-label={fieldName}
      />
      <span
        className={`slider-value${isOverridden ? "" : " is-default"}`}
        aria-hidden="true"
      >
        {format(effective)}
      </span>
    </ControlRow>
  );
}
