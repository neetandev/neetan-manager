import type { ChangeEvent } from "react";
import { CloseIcon } from "../../../icons/Icons";
import { STRINGS } from "./strings";
import type { DefaultablePath } from "./types";

interface Props {
  value: DefaultablePath;
  placeholder?: string;
  fieldName: string;
  onChange: (value: DefaultablePath) => void;
  disabled?: boolean;
  warn?: boolean;
  id?: string;
}

export function ClearablePath({
  value,
  placeholder = STRINGS.defaultable.paren_no_value,
  fieldName,
  onChange,
  disabled,
  warn,
  id,
}: Props) {
  const inputClass = `input mono${warn ? " warn" : ""}`;
  const isEmpty = value === null || value === "";

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next === "" ? null : next);
  };

  return (
    <div className="path-row with-clear">
      <input
        id={id}
        type="text"
        className={inputClass}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onInputChange}
        disabled={disabled}
        aria-label={fieldName}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={disabled}
        onClick={() => {
          /* TODO: hook to Tauri dialog plugin once wired */
        }}
      >
        Browse…
      </button>
      <button
        type="button"
        className="path-clear"
        title={STRINGS.defaultable.clearTitle}
        aria-label={`Clear ${fieldName}`}
        disabled={disabled || isEmpty}
        onClick={() => onChange(null)}
      >
        <CloseIcon size={11} />
      </button>
    </div>
  );
}
