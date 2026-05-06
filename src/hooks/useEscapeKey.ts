import { useEffect } from "react";

const stack: Array<() => void> = [];
let attached = false;

function onKey(e: KeyboardEvent) {
  if (e.key !== "Escape") return;
  const top = stack[stack.length - 1];
  if (!top) return;
  e.stopPropagation();
  top();
}

function ensureAttached() {
  if (attached) return;
  window.addEventListener("keydown", onKey);
  attached = true;
}

export function useEscapeKey(active: boolean, handler: () => void): void {
  useEffect(() => {
    if (!active) return;
    ensureAttached();
    stack.push(handler);
    return () => {
      const idx = stack.lastIndexOf(handler);
      if (idx !== -1) stack.splice(idx, 1);
    };
  }, [active, handler]);
}
