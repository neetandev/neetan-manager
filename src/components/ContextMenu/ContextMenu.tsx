import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import "./ContextMenu.css";

export interface ContextMenuItem {
    label: string;
    onSelect: () => void;
    danger?: boolean;
    disabled?: boolean;
}

interface Props {
    open: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

const VIEWPORT_MARGIN = 6;

export function ContextMenu({open, x, y, items, onClose}: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState<{ left: number; top: number }>({
        left: x,
        top: y,
    });

    useLayoutEffect(() => {
        if (!open) return;
        const node = ref.current;
        if (!node) return;
        const {offsetWidth: w, offsetHeight: h} = node;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const left =
            x + w + VIEWPORT_MARGIN > vw
                ? Math.max(VIEWPORT_MARGIN, x - w)
                : x;
        const top =
            y + h + VIEWPORT_MARGIN > vh
                ? Math.max(VIEWPORT_MARGIN, y - h)
                : y;
        setPos({left, top});
    }, [open, x, y, items]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            e.stopPropagation();
            onClose();
        };
        const onPointerDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        const onScroll = () => onClose();
        const onBlur = () => onClose();
        const onContext = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onPointerDown, true);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("blur", onBlur);
        window.addEventListener("contextmenu", onContext, true);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("mousedown", onPointerDown, true);
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("contextmenu", onContext, true);
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            ref={ref}
            className="ctx-menu"
            role="menu"
            style={{left: pos.left, top: pos.top}}
            onContextMenu={(e) => e.preventDefault()}
        >
            {items.map((item, i) => (
                <button
                    key={i}
                    type="button"
                    role="menuitem"
                    className={`ctx-menu-item${item.danger ? " is-danger" : ""}`}
                    disabled={item.disabled}
                    onClick={() => {
                        if (item.disabled) return;
                        item.onSelect();
                    }}
                >
                    {item.label}
                </button>
            ))}
        </div>,
        document.body,
    );
}
