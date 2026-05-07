import {useStrings} from "./strings";
import type {Tri} from "./types";

interface Props {
    value: Tri;
    ariaLabel: string;
    onChange: (value: Tri) => void;
    labelledBy?: string;
}

export function TriState({value, ariaLabel, onChange, labelledBy}: Props) {
    const STRINGS = useStrings();
    const SEGMENTS: Array<{ key: "default" | "on" | "off"; value: Tri; label: string }> = [
        {key: "default", value: null, label: STRINGS.tri.default},
        {key: "on", value: true, label: STRINGS.tri.on},
        {key: "off", value: false, label: STRINGS.tri.off},
    ];
    return (
        <div
            className="tri"
            role="radiogroup"
            aria-label={labelledBy ? undefined : ariaLabel}
            aria-labelledby={labelledBy}
        >
            {SEGMENTS.map((seg) => {
                const isActive = seg.value === value;
                const isDefault = seg.value === null;
                const cls = [
                    isActive ? "on" : "",
                    isActive && isDefault ? "is-default" : "",
                ]
                    .filter(Boolean)
                    .join(" ");
                return (
                    <button
                        key={seg.key}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={cls}
                        onClick={() => onChange(seg.value)}
                    >
                        {seg.label}
                    </button>
                );
            })}
        </div>
    );
}
