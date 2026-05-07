import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {ResetIcon} from "../../../icons/Icons";
import {useStrings} from "./strings";

export type DefaultLabelMode = "system" | "emulator";

interface Props {
    isOverridden: boolean;
    fieldName: string;
    onReset: () => void;
    children: ReactNode;
    defaultLabelMode?: DefaultLabelMode;
}

export function ControlRow({
                               isOverridden,
                               fieldName,
                               onReset,
                               children,
                               defaultLabelMode = "system",
                           }: Props) {
    const {t} = useTranslation();
    const STRINGS = useStrings();
    const resetTitle =
        defaultLabelMode === "emulator"
            ? STRINGS.defaultable.resetTitle_emulator
            : STRINGS.defaultable.resetTitle;
    return (
        <div className={`control-row${isOverridden ? " is-overridden" : ""}`}>
            {children}
            <button
                type="button"
                className="reset-chip"
                title={resetTitle}
                aria-label={t("upsert.modal.resetFor", {title: resetTitle, field: fieldName})}
                onClick={onReset}
            >
                <ResetIcon size={11}/>
                <span>{STRINGS.defaultable.resetLabel}</span>
            </button>
        </div>
    );
}
