import type { GameUpsertForm } from "../components/Modal/upsert/types";

// Demo data so the visual mock of the upsert modal renders populated states
// (drag handles, missing-file warning, override resets). Removed once the
// backend exposes real per-game config.
export const DEMO_UPSERT_CONFIGS: Record<number, Partial<GameUpsertForm>> = {
  // Game A - clean populated state. Machine override set to PC-9821 so the
  // CD-ROM banner is hidden and the Reset chip on Machine is visible.
  1: {
    machine: "PC9821AS",
    "audio-volume": 0.85,
    crt: true,
    fdd1: [
      {
        id: "demo-fdd1-a",
        path: "~/games/princess-maker-2/disk-a.d88",
        type: "D88",
      },
      {
        id: "demo-fdd1-b",
        path: "~/games/princess-maker-2/disk-b.d88",
        type: "D88",
      },
    ],
    fdd2: [],
    hdd1: {
      id: "demo-hdd1-a",
      path: "~/games/princess-maker-2/system.hdi",
      type: "HDI",
    },
    hdd2: null,
    cdrom: [],
  },
  // Game B - warning state. One missing FDD file; machine left default so the
  // CD-ROM banner is shown.
  2: {
    fdd1: [
      {
        id: "demo-fdd1-touhou",
        path: "~/games/touhou/disk1.d88",
        type: "D88",
        missing: true,
      },
    ],
    fdd2: [],
    hdd1: null,
    hdd2: null,
    cdrom: [],
  },
};
