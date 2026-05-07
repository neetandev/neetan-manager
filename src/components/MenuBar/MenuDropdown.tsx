import {Fragment, useRef} from "react";
import {useEscapeKey} from "../../hooks/useEscapeKey";
import {useOnClickOutside} from "../../hooks/useOnClickOutside";

export type MenuItem =
    | {
    kind: "item";
    label: string;
    shortcut?: string;
    onSelect: () => void;
}
    | { kind: "divider" };

interface Props {
    id: string;
    label: string;
    items: MenuItem[];
    open: boolean;
    anyOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onHoverWhenAnotherOpen: () => void;
    onSelect: (action: () => void) => void;
}

export function MenuDropdown({
                                 id,
                                 label,
                                 items,
                                 open,
                                 anyOpen,
                                 onOpen,
                                 onClose,
                                 onHoverWhenAnotherOpen,
                                 onSelect,
                             }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);

    useEscapeKey(open, onClose);
    useOnClickOutside(wrapRef, open, onClose);

    function handleTriggerClick() {
        if (open) onClose();
        else onOpen();
    }

    function handleTriggerEnter() {
        if (anyOpen && !open) onHoverWhenAnotherOpen();
    }

    return (
        <div
            className={`menu-trigger-wrap${open ? " is-open" : ""}`}
            ref={wrapRef}
        >
            <button
                type="button"
                className="menu-trigger"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={`menu-${id}`}
                onClick={handleTriggerClick}
                onMouseEnter={handleTriggerEnter}
            >
                {label}
            </button>
            {open && (
                <div className="menu-panel" role="menu" id={`menu-${id}`}>
                    {items.map((item, i) => {
                        if (item.kind === "divider") {
                            return <div key={`d-${i}`} className="menu-divider" role="separator"/>;
                        }
                        return (
                            <Fragment key={item.label}>
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="menu-item"
                                    onClick={() => onSelect(item.onSelect)}
                                >
                                    <span className="menu-item-label">{item.label}</span>
                                    {item.shortcut && (
                                        <span className="menu-item-shortcut">{item.shortcut}</span>
                                    )}
                                </button>
                            </Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
