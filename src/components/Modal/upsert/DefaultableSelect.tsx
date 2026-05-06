import type { ChangeEvent } from "react";
import { ControlRow } from "./ControlRow";
import { STRINGS } from "./strings";
import type { DefaultableString } from "./types";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: DefaultableString;
  defaultLabel: string;
  options: ReadonlyArray<Option>;
  fieldName: string;
  onChange: (value: DefaultableString) => void;
  id?: string;
  maxWidth?: number;
}

export function DefaultableSelect({
  value,
  defaultLabel,
  options,
  fieldName,
  onChange,
  id,
  maxWidth,
}: Props) {
  const isOverridden = value !== null;

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    onChange(next === "" ? null : next);
  };

  const onReset = () => onChange(null);
  const selectClass = `select${isOverridden ? "" : " is-default"}`;

  return (
    <ControlRow
      isOverridden={isOverridden}
      fieldName={fieldName}
      onReset={onReset}
    >
      <select
        id={id}
        className={selectClass}
        value={value ?? ""}
        onChange={onSelectChange}
        style={maxWidth ? { maxWidth } : undefined}
      >
        <option value="">{STRINGS.defaultable.paren(defaultLabel)}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </ControlRow>
  );
}
