import {open} from "@tauri-apps/plugin-dialog";
import type {ChangeEvent} from "react";
import {useTranslation} from "react-i18next";
import {CloseIcon} from "../../../icons/Icons";
import {toRelativeIfInside} from "../../../lib/paths";
import type {DefaultLabelMode} from "./ControlRow";
import {useStrings} from "./strings";
import type {DefaultablePath} from "./types";

export type PickerOptions =
    | {
    kind: "file";
    filters?: { name: string; extensions: string[] }[];
}
    | { kind: "directory" };

interface Props {
    value: DefaultablePath;
    placeholder?: string;
    fieldName: string;
    onChange: (value: DefaultablePath) => void;
    pickerOptions: PickerOptions;
    portableDir: string | null;
    disabled?: boolean;
    warn?: boolean;
    id?: string;
    defaultLabelMode?: DefaultLabelMode;
}

export function ClearablePath({
                                  value,
                                  placeholder,
                                  fieldName,
                                  onChange,
                                  pickerOptions,
                                  portableDir,
                                  disabled,
                                  warn,
                                  id,
                                  defaultLabelMode = "system",
                              }: Props) {
    const {t} = useTranslation();
    const STRINGS = useStrings();
    const inputClass = `input mono${warn ? " warn" : ""}`;
    const isEmpty = value === null || value === "";

    const effectivePlaceholder =
        placeholder ??
        (defaultLabelMode === "emulator"
            ? STRINGS.defaultable.paren_no_value_emulator
            : STRINGS.defaultable.paren_no_value);

    const clearTitle =
        defaultLabelMode === "emulator"
            ? STRINGS.defaultable.clearTitle_emulator
            : STRINGS.defaultable.clearTitle;

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        onChange(next === "" ? null : next);
    };

    const onBrowse = async () => {
        const isDir = pickerOptions.kind === "directory";
        const result = await open({
            directory: isDir,
            multiple: false,
            defaultPath: portableDir ?? undefined,
            title: t("upsert.modal.selectFieldTitle", {field: fieldName}),
            filters: pickerOptions.kind === "file" ? pickerOptions.filters : undefined,
        });
        if (typeof result === "string") {
            const stored = portableDir
                ? toRelativeIfInside(result, portableDir)
                : result;
            onChange(stored);
        }
    };

    return (
        <div className="path-row with-clear">
            <input
                id={id}
                type="text"
                className={inputClass}
                placeholder={effectivePlaceholder}
                value={value ?? ""}
                onChange={onInputChange}
                disabled={disabled}
                aria-label={fieldName}
            />
            <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={disabled}
                onClick={onBrowse}
            >
                {t("common.browse")}
            </button>
            <button
                type="button"
                className="path-clear"
                title={clearTitle}
                aria-label={t("upsert.modal.clearFieldAriaLabel", {field: fieldName})}
                disabled={disabled || isEmpty}
                onClick={() => onChange(null)}
            >
                <CloseIcon size={11}/>
            </button>
        </div>
    );
}
