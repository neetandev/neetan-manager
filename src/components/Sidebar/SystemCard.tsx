import {useState, type CSSProperties, type MouseEvent} from "react";
import {useTranslation} from "react-i18next";
import {CogIcon} from "../../icons/Icons";
import type {SystemMeta} from "../../state/types";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {SystemIllustration} from "./SystemIllustration";

interface Props {
    system: SystemMeta;
    active: boolean;
    count: number;
    onClick: () => void;
    onConfigure: () => void;
}

export function SystemCard({system, active, count, onClick, onConfigure}: Props) {
    const {t} = useTranslation();
    const style = {"--card-accent": system.accent} as CSSProperties;
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
    const onCogClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onConfigure();
    };
    const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setMenu({x: e.clientX, y: e.clientY});
    };
    const cogLabel = t("sidebar.configureSystem", {name: system.name});
    return (
        <div
            className="system-card-wrap"
            style={style}
            onContextMenu={onContextMenu}
        >
            <button
                type="button"
                className={`system-card${active ? " is-active" : ""}`}
                aria-pressed={active}
                onClick={onClick}
            >
        <span className="system-tile">
          <SystemIllustration system={system.id}/>
        </span>
                <span className="system-meta">
          <span className="system-name">{system.name}</span>
          <span className="system-tag">{system.tagline}</span>
        </span>
                <span className="system-badge">{count}</span>
            </button>
            <button
                type="button"
                className="system-card-cog"
                title={cogLabel}
                aria-label={cogLabel}
                onClick={onCogClick}
            >
                <CogIcon size={14}/>
            </button>
            <ContextMenu
                open={menu !== null}
                x={menu?.x ?? 0}
                y={menu?.y ?? 0}
                onClose={() => setMenu(null)}
                items={[
                    {
                        label: t("sidebar.editSystemConfig"),
                        onSelect: () => {
                            onConfigure();
                            setMenu(null);
                        },
                    },
                ]}
            />
        </div>
    );
}
