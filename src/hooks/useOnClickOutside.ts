import {useEffect, useRef, type RefObject} from "react";

export function useOnClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    active: boolean,
    handler: (e: MouseEvent) => void,
): void {
    const handlerRef = useRef(handler);
    useEffect(() => {
        handlerRef.current = handler;
    });
    useEffect(() => {
        if (!active) return;

        function onDown(e: MouseEvent) {
            const el = ref.current;
            if (!el || el.contains(e.target as Node)) return;
            handlerRef.current(e);
        }

        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [ref, active]);
}
