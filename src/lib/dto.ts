import type {Game, SystemId} from "../state/types";

// Mirror of `GameDto` in src-tauri/src/dto/game.rs. The shape is identical to the
// frontend's `Game` type, so we just re-export the alias to make intent explicit at
// IPC call sites.
export type GameDto = Game;

// Mirror of `GameUpsertDto`. `id: null` means "insert"; `id: number` means "update".
export interface GameUpsertDto {
    id: number | null;
    system: SystemId;
    latin_name: string;
    japanese_name: string;
    developer_name: string;
    release_year: number;
}

// Mirror of `GameConfigDto`. The `value` shape for schema_version=1 is documented in
// src/lib/gameSerialization.ts: only non-null overrides, kebab-case keys matching emulator
// CLI flags, drive bays as path-string arrays (or single path for hdd), with ephemeral
// drive fields stripped.
export interface GameConfigDto {
    schema_version: number;
    value: Record<string, unknown>;
}
