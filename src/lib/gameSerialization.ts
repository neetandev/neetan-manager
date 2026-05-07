import {
    inferDriveTypeFromPath,
    newDriveId,
} from "../components/Modal/upsert/resolve";
import type {
    DriveImage,
    GameUpsertForm,
} from "../components/Modal/upsert/types";
import type {GameUpsertDto} from "./dto";

// Schema for the JSON stored in `config.config_value` at schema_version=1.
// Only non-null overrides are persisted (system defaults remain implicit).
// Keys match the emulator's CLI flags so the persisted shape stays compatible
// with the json_to_args contract in src-tauri/src/commands.rs.
//
// Drive bays:
//   fdd1, fdd2, cdrom (lists)  -> array of path strings; omitted when empty.
//   hdd1, hdd2 (single drive)  -> single path string; omitted when null.
//
// Ephemeral DriveImage fields (`id`, `type`, `missing`) are not persisted; on
// load `id` is regenerated and `type` is re-inferred from the path.

const PERSISTED_DEFAULTABLE_KEYS = [
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
] as const satisfies readonly (keyof GameUpsertForm)[];

const PERSISTED_TRI_KEYS = [
    "crt",
    "adpcm-ram",
    "ems",
    "xms",
] as const satisfies readonly (keyof GameUpsertForm)[];

const LIST_BAY_KEYS = ["fdd1", "fdd2", "cdrom"] as const;
const SINGLE_BAY_KEYS = ["hdd1", "hdd2"] as const;

export class FormValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FormValidationError";
    }
}

export function formToUpsertDto(form: GameUpsertForm): GameUpsertDto {
    if (form.year === null) {
        throw new FormValidationError("year is required");
    }
    return {
        id: form.id,
        system: form.system,
        latin_name: form.latin_name,
        japanese_name: form.japanese_name,
        developer_name: form.developer,
        release_year: form.year,
    };
}

export function formToConfigValue(
    form: GameUpsertForm,
): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    for (const key of PERSISTED_DEFAULTABLE_KEYS) {
        const v = form[key];
        if (v !== null && v !== "") {
            out[key] = v;
        }
    }

    for (const key of PERSISTED_TRI_KEYS) {
        const v = form[key];
        if (v !== null) {
            out[key] = v;
        }
    }

    if (form["audio-volume"] !== null) {
        out["audio-volume"] = form["audio-volume"];
    }

    for (const key of LIST_BAY_KEYS) {
        const list = form[key];
        if (list && list.length > 0) {
            out[key] = list.map((d) => d.path);
        }
    }

    for (const key of SINGLE_BAY_KEYS) {
        const drive = form[key];
        if (drive) {
            out[key] = drive.path;
        }
    }

    return out;
}

export function configValueToFormPatch(
    value: Record<string, unknown>,
): Partial<GameUpsertForm> {
    const patch: Record<string, unknown> = {};

    for (const key of PERSISTED_DEFAULTABLE_KEYS) {
        const v = value[key];
        if (typeof v === "string") {
            patch[key] = v;
        }
    }

    for (const key of PERSISTED_TRI_KEYS) {
        const v = value[key];
        if (typeof v === "boolean") {
            patch[key] = v;
        }
    }

    const vol = value["audio-volume"];
    if (typeof vol === "number") {
        patch["audio-volume"] = vol;
    }

    for (const key of LIST_BAY_KEYS) {
        const v = value[key];
        if (Array.isArray(v)) {
            patch[key] = v
                .filter((p): p is string => typeof p === "string")
                .map(pathToDrive);
        }
    }

    for (const key of SINGLE_BAY_KEYS) {
        const v = value[key];
        if (typeof v === "string") {
            patch[key] = pathToDrive(v);
        }
    }

    return patch as Partial<GameUpsertForm>;
}

function pathToDrive(path: string): DriveImage {
    return {
        id: newDriveId(),
        path,
        type: inferDriveTypeFromPath(path),
    };
}
