import {invoke} from "@tauri-apps/api/core";
import type {SystemId} from "../state/types";
import type {GameConfigDto, GameDto, GameUpsertDto} from "./dto";

export function getPortableDirectory(): Promise<string | null> {
    return invoke<string | null>("get_portable_directory");
}

export function setPortableDirectory(path: string | null): Promise<void> {
    return invoke<void>("set_portable_directory", {path});
}

export function defaultPortableDirectory(): Promise<string> {
    return invoke<string>("default_portable_directory");
}

export function getNeetanExecutable(): Promise<string | null> {
    return invoke<string | null>("get_neetan_executable");
}

export function setNeetanExecutable(path: string | null): Promise<void> {
    return invoke<void>("set_neetan_executable", {path});
}

export function getLocale(): Promise<string> {
    return invoke<string>("get_locale");
}

export function completeFirstSetup(path: string): Promise<void> {
    return invoke<void>("complete_first_setup", {path});
}

export function quitApp(): Promise<void> {
    return invoke<void>("quit_app");
}

export function listGames(system: SystemId): Promise<GameDto[]> {
    return invoke<GameDto[]>("list_games", {system});
}

export function getGame(id: number): Promise<GameDto> {
    return invoke<GameDto>("get_game", {id});
}

export function upsertGame(game: GameUpsertDto): Promise<number> {
    return invoke<number>("upsert_game", {game});
}

export function deleteGame(id: number): Promise<void> {
    return invoke<void>("delete_game", {id});
}

export function getGameConfig(id: number): Promise<GameConfigDto> {
    return invoke<GameConfigDto>("get_game_config", {id});
}

export function setGameConfig(
    id: number,
    config: GameConfigDto,
): Promise<void> {
    return invoke<void>("set_game_config", {id, config});
}

export function getSystemConfig(system: SystemId): Promise<GameConfigDto> {
    return invoke<GameConfigDto>("get_system_config", {system});
}

export function setSystemConfig(
    system: SystemId,
    config: GameConfigDto,
): Promise<void> {
    return invoke<void>("set_system_config", {system, config});
}

export function createDiskImage(
    kind: "fdd" | "hdd",
    path: string,
    preset: string,
): Promise<void> {
    return invoke<void>("create_disk_image", {kind, path, preset});
}
