import type {GameUpsertForm, SystemDefaults} from "./types";

export const PC9821_MODELS = ["PC9821AS", "PC9821AP"] as const;

type DefaultableKey = keyof SystemDefaults;

export function resolveEffective<K extends DefaultableKey>(
    form: GameUpsertForm,
    defaults: SystemDefaults,
    key: K,
): SystemDefaults[K] {
    const v = (form as unknown as Record<string, unknown>)[key];
    if (v === null || v === undefined || v === "") {
        return defaults[key];
    }
    return v as SystemDefaults[K];
}

export function isPc9821(machineId: string): boolean {
    return (PC9821_MODELS as readonly string[]).includes(machineId);
}

export function defaultHddPreset(machineId: string): string {
    return isPc9821(machineId) ? "ide40" : "sasi20";
}

export function inferDriveTypeFromPath(path: string): string {
    const lower = path.toLowerCase();
    if (
        lower.endsWith(".d88") ||
        lower.endsWith(".d98") ||
        lower.endsWith(".88d") ||
        lower.endsWith(".98d")
    ) {
        return "D88";
    }
    if (lower.endsWith(".hdm")) return "HDM";
    if (lower.endsWith(".nfd")) return "NFD";
    if (lower.endsWith(".hdi")) return "HDI";
    if (lower.endsWith(".cue")) return "CUE";
    return "FILE";
}

let idCounter = 0;

export function newDriveId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    idCounter += 1;
    return `drive-${Date.now().toString(36)}-${idCounter}`;
}
