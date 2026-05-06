import type { SystemId } from "../state/types";
import type { SystemDefaults } from "../components/Modal/upsert/types";

const EMULATOR_DEFAULTS: SystemDefaults = {
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

// TODO: replace with a backend-backed per-system config when available.
// The hook signature stays stable; only the body changes.
export function useSystemDefaults(_system: SystemId): SystemDefaults {
  return EMULATOR_DEFAULTS;
}
