import type { CSSProperties } from "react";
import type { SystemMeta } from "../../state/types";
import { SystemIllustration } from "./SystemIllustration";

interface Props {
  system: SystemMeta;
  active: boolean;
  count: number;
  onClick: () => void;
}

export function SystemCard({ system, active, count, onClick }: Props) {
  const style = { "--card-accent": system.accent } as CSSProperties;
  return (
    <button
      type="button"
      className={`system-card${active ? " is-active" : ""}`}
      style={style}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="system-tile">
        <SystemIllustration system={system.id} />
      </span>
      <span className="system-meta">
        <span className="system-name">{system.name}</span>
        <span className="system-tag">{system.tagline}</span>
      </span>
      <span className="system-badge">{count}</span>
    </button>
  );
}
