import type { SystemId } from "../../state/types";

interface Props {
  system: SystemId;
}

export function SystemIllustration({ system }: Props) {
  return (
    <svg
      className="system-illustration"
      viewBox="0 0 64 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {system === "PC-9800" && <Pc9800 />}
      {system === "PC-8800" && <Pc8800 />}
      {system === "PC-8000" && <Pc8000 />}
      {system === "PC-6000" && <Pc6000 />}
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
      <rect x="6" y="10" width="22" height="32" rx="1.5" />
      <rect x="9" y="14" width="16" height="3" fill={ACCENT} stroke="none" />
      <circle cx="11" cy="35" r="1.4" fill={STROKE} stroke="none" />
      <circle cx="15" cy="35" r="1.4" fill={STROKE} stroke="none" />
      <rect x="32" y="6" width="26" height="20" rx="1.5" />
      <rect x="35" y="9" width="20" height="14" fill={ACCENT} stroke="none" opacity="0.65" />
      <rect x="40" y="28" width="10" height="3" rx="0.5" />
      <rect x="36" y="33" width="18" height="2" rx="1" />
      <line x1="32" y1="42" x2="58" y2="42" />
    </g>
  );
}

function Pc8800() {
  return (
    <g fill={FILL} stroke={STROKE} strokeWidth={SW} strokeLinejoin="round">
      <rect x="32" y="6" width="26" height="18" rx="1.5" />
      <rect x="35" y="9" width="20" height="12" fill={ACCENT} stroke="none" opacity="0.7" />
      <line x1="32" y1="26" x2="58" y2="26" />
      <rect x="38" y="26" width="14" height="2" rx="0.5" />
      <rect x="4" y="30" width="42" height="12" rx="1.5" />
      <rect x="7" y="33" width="2" height="2" />
      <rect x="11" y="33" width="2" height="2" />
      <rect x="15" y="33" width="2" height="2" />
      <rect x="19" y="33" width="2" height="2" />
      <rect x="23" y="33" width="2" height="2" />
      <rect x="27" y="33" width="2" height="2" />
      <rect x="31" y="33" width="2" height="2" />
      <rect x="35" y="33" width="2" height="2" />
      <rect x="39" y="33" width="2" height="2" />
      <rect x="9" y="37" width="32" height="3" rx="0.5" fill={ACCENT} stroke="none" opacity="0.55" />
    </g>
  );
}

function Pc8000() {
  return (
    <g fill={FILL} stroke={STROKE} strokeWidth={SW} strokeLinejoin="round">
      <path d="M4 38 L60 38 L54 18 L10 18 Z" />
      <rect x="14" y="22" width="36" height="4" fill={ACCENT} stroke="none" opacity="0.7" />
      <g fill={STROKE} stroke="none">
        <rect x="14" y="28" width="3" height="2" />
        <rect x="19" y="28" width="3" height="2" />
        <rect x="24" y="28" width="3" height="2" />
        <rect x="29" y="28" width="3" height="2" />
        <rect x="34" y="28" width="3" height="2" />
        <rect x="39" y="28" width="3" height="2" />
        <rect x="44" y="28" width="3" height="2" />
        <rect x="14" y="32" width="3" height="2" />
        <rect x="19" y="32" width="3" height="2" />
        <rect x="24" y="32" width="3" height="2" />
        <rect x="29" y="32" width="3" height="2" />
        <rect x="34" y="32" width="3" height="2" />
        <rect x="39" y="32" width="3" height="2" />
        <rect x="44" y="32" width="3" height="2" />
      </g>
      <line x1="2" y1="40" x2="62" y2="40" />
    </g>
  );
}

function Pc6000() {
  return (
    <g fill={FILL} stroke={STROKE} strokeWidth={SW} strokeLinejoin="round">
      <rect x="6" y="14" width="52" height="22" rx="3" />
      <rect x="10" y="18" width="44" height="5" fill={ACCENT} stroke="none" opacity="0.75" />
      <g fill={STROKE} stroke="none">
        <rect x="10" y="26" width="4" height="3" rx="0.5" />
        <rect x="16" y="26" width="4" height="3" rx="0.5" />
        <rect x="22" y="26" width="4" height="3" rx="0.5" />
        <rect x="28" y="26" width="4" height="3" rx="0.5" />
        <rect x="34" y="26" width="4" height="3" rx="0.5" />
        <rect x="40" y="26" width="4" height="3" rx="0.5" />
        <rect x="46" y="26" width="4" height="3" rx="0.5" />
        <rect x="10" y="31" width="4" height="3" rx="0.5" />
        <rect x="16" y="31" width="4" height="3" rx="0.5" />
        <rect x="22" y="31" width="4" height="3" rx="0.5" />
        <rect x="28" y="31" width="4" height="3" rx="0.5" />
        <rect x="34" y="31" width="4" height="3" rx="0.5" />
        <rect x="40" y="31" width="4" height="3" rx="0.5" />
        <rect x="46" y="31" width="4" height="3" rx="0.5" />
      </g>
    </g>
  );
}
