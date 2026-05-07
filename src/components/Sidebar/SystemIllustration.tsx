import type {SystemId} from "../../state/types";

interface Props {
    system: SystemId;
}

export function SystemIllustration({system}: Props) {
    return (
        <svg
            className="system-illustration"
            viewBox="0 0 64 48"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {system === "PC-9800" && <Pc9800/>}
        </svg>
    );
}

const FILL = "var(--surface-1)";
const STROKE = "currentColor";
const ACCENT = "var(--card-accent, currentColor)";
const SW = 1.2;

function Pc9800() {
    return (
        <g fill={FILL} stroke={STROKE} strokeWidth={SW} strokeLinejoin="round">
            <rect x="6" y="10" width="22" height="32" rx="1.5"/>
            <rect x="9" y="14" width="16" height="3" fill={ACCENT} stroke="none"/>
            <circle cx="11" cy="35" r="1.4" fill={STROKE} stroke="none"/>
            <circle cx="15" cy="35" r="1.4" fill={STROKE} stroke="none"/>
            <rect x="32" y="6" width="26" height="20" rx="1.5"/>
            <rect x="35" y="9" width="20" height="14" fill={ACCENT} stroke="none" opacity="0.65"/>
            <rect x="40" y="28" width="10" height="3" rx="0.5"/>
            <rect x="36" y="33" width="18" height="2" rx="1"/>
            <line x1="32" y1="42" x2="58" y2="42"/>
        </g>
    );
}

