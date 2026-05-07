import type {SystemId} from "../../../state/types";

export type Tri = null | true | false;
export type DefaultableString = string | null;
export type DefaultablePath = string | null;

export type DriveImageType =
    | "D88"
    | "HDM"
    | "NFD"
    | "HDI"
    | "CUE"
    | "SASI"
    | "IDE"
    | string;

export interface DriveImage {
    id: string;
    path: string;
    type: DriveImageType;
    missing?: boolean;
}

export type DriveBayKey = "fdd1" | "fdd2" | "hdd1" | "hdd2" | "cdrom";

export interface GameUpsertForm {
    id: number | null;
    system: SystemId;
    latin_name: string;
    japanese_name: string;
    developer: string;
    year: number | null;

    machine: DefaultableString;
    "cpu-mode": DefaultableString;
    "force-gdc-clock": DefaultableString;

    "boot-device": DefaultableString;
    "aspect-mode": DefaultableString;
    crt: Tri;
    "window-mode": DefaultableString;
    "audio-volume": number | null;
    soundboard: DefaultableString;
    "adpcm-ram": Tri;
    midi: DefaultableString;
    "mt32-roms": DefaultablePath;
    "sc55-roms": DefaultablePath;
    ems: Tri;
    xms: Tri;

    "bios-rom": DefaultablePath;
    "font-rom": DefaultablePath;
    printer: DefaultablePath;

    fdd1: DriveImage[];
    fdd2: DriveImage[];
    hdd1: DriveImage | null;
    hdd2: DriveImage | null;
    cdrom: DriveImage[];
}

export type UpsertMode = "add" | "edit" | "duplicate";

export interface SystemDefaults {
    machine: string;
    "cpu-mode": string;
    "force-gdc-clock": string;
    "boot-device": string;
    "aspect-mode": string;
    crt: boolean;
    "window-mode": string;
    "audio-volume": number;
    soundboard: string;
    "adpcm-ram": boolean;
    midi: string;
    "mt32-roms": string;
    "sc55-roms": string;
    ems: boolean;
    xms: boolean;
    "bios-rom": string;
    "font-rom": string;
    printer: string;
}
