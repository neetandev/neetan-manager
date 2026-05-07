import type {ChangeEvent} from "react";
import {ControlRow, type DefaultLabelMode} from "./ControlRow";
import {useStrings} from "./strings";
import type {DefaultableString} from "./types";

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
    defaultLabelMode?: DefaultLabelMode;
}

export function DefaultableSelect({
                                      value,
                                      defaultLabel,
                                      options,
                                      fieldName,
                                      onChange,
                                      id,
                                      maxWidth,
                                      defaultLabelMode = "system",
                                  }: Props) {
    const STRINGS = useStrings();
    const isOverridden = value !== null;

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const next = e.target.value;
        onChange(next === "" ? null : next);
    };

    const onReset = () => onChange(null);
    const selectClass = `select${isOverridden ? "" : " is-default"}`;
    const parenLabel =
        defaultLabelMode === "emulator"
            ? STRINGS.defaultable.paren_emulator(defaultLabel)
            : STRINGS.defaultable.paren(defaultLabel);

    return (
        <ControlRow
            isOverridden={isOverridden}
            fieldName={fieldName}
            onReset={onReset}
            defaultLabelMode={defaultLabelMode}
        >
            <select
                id={id}
                className={selectClass}
                value={value ?? ""}
                onChange={onSelectChange}
                style={maxWidth ? {maxWidth} : undefined}
            >
                <option value="">{parenLabel}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </ControlRow>
    );
}
