import {useEffect, useMemo, useState} from "react";
import type {SystemDefaults} from "../components/Modal/upsert/types";
import {getSystemConfig} from "../lib/api";
import {useAppState} from "../state/AppContext";
import type {SystemId} from "../state/types";

export const EMULATOR_DEFAULTS: SystemDefaults = {
    machine: "PC9801RA",
    "cpu-mode": "high",
    "force-gdc-clock": "auto",
    "boot-device": "auto",
    "aspect-mode": "4:3",
    crt: true,
    "window-mode": "windowed",
    "audio-volume": 1.0,
    soundboard: "86+26k",
    "adpcm-ram": true,
    midi: "none",
    "mt32-roms": "",
    "sc55-roms": "",
    ems: true,
    xms: true,
    "bios-rom": "",
    "font-rom": "",
    printer: "",
};

const STRING_KEYS = [
    "machine",
    "cpu-mode",
    "force-gdc-clock",
    "boot-device",
    "aspect-mode",
    "window-mode",
    "soundboard",
    "midi",
    "mt32-roms",
    "sc55-roms",
    "bios-rom",
    "font-rom",
    "printer",
] as const satisfies readonly (keyof SystemDefaults)[];

const BOOL_KEYS = [
    "crt",
    "adpcm-ram",
    "ems",
    "xms",
] as const satisfies readonly (keyof SystemDefaults)[];

function systemConfigOverlay(
    value: Record<string, unknown>,
): Partial<SystemDefaults> {
    const out: Partial<SystemDefaults> = {};
    for (const key of STRING_KEYS) {
        const v = value[key];
        if (typeof v === "string") {
            (out as Record<string, unknown>)[key] = v;
        }
    }
    for (const key of BOOL_KEYS) {
        const v = value[key];
        if (typeof v === "boolean") {
            (out as Record<string, unknown>)[key] = v;
        }
    }
    const vol = value["audio-volume"];
    if (typeof vol === "number") {
        out["audio-volume"] = vol;
    }
    return out;
}

export function useSystemDefaults(system: SystemId): SystemDefaults {
    const {systemConfigVersion} = useAppState();
    const [overlay, setOverlay] = useState<Partial<SystemDefaults>>({});
    useEffect(() => {
        let cancelled = false;
        getSystemConfig(system)
            .then((cfg) => {
                if (cancelled) return;
                setOverlay(systemConfigOverlay(cfg.value));
            })
            .catch(() => {
                if (cancelled) return;
                setOverlay({});
            });
        return () => {
            cancelled = true;
        };
    }, [system, systemConfigVersion]);
    return useMemo(() => ({...EMULATOR_DEFAULTS, ...overlay}), [overlay]);
}
