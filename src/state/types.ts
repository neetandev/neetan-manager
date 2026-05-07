export type SystemId = "PC-9800";
export type View = "table" | "grid";
export type Theme = "light" | "dark";
export type SortKey = "latin_name" | "japanese_name" | "developer_name" | "release_year";
export type SortDir = "asc" | "desc";
export type ModalKind =
    | "settings"
    | "license"
    | "version"
    | "add"
    | "edit"
    | "duplicate"
    | "delete"
    | "system-config"
    | null;

export interface Game {
    id: number;
    system: SystemId;
    latin_name: string;
    japanese_name: string;
    developer_name: string;
    release_year: number;
}

export interface SystemMeta {
    id: SystemId;
    name: string;
    tagline: string;
    accent: string;
}

export type GamesStatus = "idle" | "loading" | "loaded" | "error";

export interface GamesSlice {
    status: GamesStatus;
    rows: Game[];
    error: string | null;
}

export interface AppState {
    theme: Theme;
    system: SystemId;
    query: string;
    view: View;
    sort: { key: SortKey; dir: SortDir };
    selected: number | null;
    modal: ModalKind;
    modalTargetGame: number | null;
    configSystem: SystemId | null;
    systemConfigVersion: number;
    games: GamesSlice;
}

export type Action =
    | { type: "SET_SYSTEM"; system: SystemId }
    | { type: "SET_QUERY"; query: string }
    | { type: "SET_VIEW"; view: View }
    | { type: "SET_SORT"; key: SortKey }
    | { type: "SET_SELECTED"; id: number | null }
    | {
    type: "OPEN_MODAL";
    kind: Exclude<ModalKind, null | "system-config">;
    gameId?: number | null;
}
    | { type: "OPEN_SYSTEM_CONFIG_MODAL"; system: SystemId }
    | { type: "BUMP_SYSTEM_CONFIG" }
    | { type: "CLOSE_MODAL" }
    | { type: "SET_THEME"; theme: Theme }
    | { type: "TOGGLE_THEME" }
    | { type: "LOAD_GAMES_PENDING" }
    | { type: "LOAD_GAMES_SUCCESS"; rows: Game[] }
    | { type: "LOAD_GAMES_ERROR"; error: string };
