import type { ReactNode } from "react";
import { ResetIcon } from "../../../icons/Icons";
import { STRINGS } from "./strings";

interface Props {
  isOverridden: boolean;
  fieldName: string;
  onReset: () => void;
  children: ReactNode;
}

export function ControlRow({ isOverridden, fieldName, onReset, children }: Props) {
  return (
    <div className={`control-row${isOverridden ? " is-overridden" : ""}`}>
      {children}
      <button
        type="button"
        className="reset-chip"
        title={STRINGS.defaultable.resetTitle}
        aria-label={`${STRINGS.defaultable.resetTitle} for ${fieldName}`}
        onClick={onReset}
      >
        <ResetIcon size={11} />
        <span>{STRINGS.defaultable.resetLabel}</span>
      </button>
    </div>
  );
}
