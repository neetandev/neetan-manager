import {useEffect, useState} from "react";
import {getVersion} from "@tauri-apps/api/app";

let cached: string | null = null;
let pending: Promise<string> | null = null;

export function useAppVersion(): string | null {
    const [version, setVersion] = useState<string | null>(cached);
    useEffect(() => {
        if (version !== null) return;
        let cancelled = false;
        if (pending === null) {
            pending = getVersion().then((v) => {
                cached = v;
                return v;
            });
        }
        pending.then((v) => {
            if (!cancelled) setVersion(v);
        });
        return () => {
            cancelled = true;
        };
    }, [version]);
    return version;
}
