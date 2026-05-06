import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { CloseIcon } from "../../icons/Icons";
import "./Modal.css";

type ModalSize = "sm" | "lg";

interface Props {
  title: string;
  subline?: ReactNode;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

export function Modal({
  title,
  subline,
  open,
  onClose,
  children,
  footer,
  size = "sm",
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => {
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  function onBackdropMouseDown(e: MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  const panelClass = `modal-panel${size === "lg" ? " modal-panel-lg" : ""}`;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onBackdropMouseDown}>
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        <header className="modal-header">
          <div className="modal-header-text">
            <h2 className="modal-title">{title}</h2>
            {subline && <div className="modal-subline">{subline}</div>}
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon size={13} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
