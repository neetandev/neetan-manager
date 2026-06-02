import {useEffect, type Dispatch} from "react";
import {launchGame, listGames} from "../lib/api";
import {useAppDispatch, useAppState} from "../state/AppContext";
import type {Action, SystemId} from "../state/types";

// Reusable loader. Modals call this after upsert/delete to refresh the list.
export async function loadGames(
    dispatch: Dispatch<Action>,
    system: SystemId,
): Promise<void> {
    dispatch({type: "LOAD_GAMES_PENDING"});
    try {
        const rows = await listGames(system);
        dispatch({type: "LOAD_GAMES_SUCCESS", rows});
    } catch (err) {
        dispatch({type: "LOAD_GAMES_ERROR", error: String(err)});
    }
}

// Launches a game via the backend. Fire-and-forget: the backend spawns neetan
// detached, so we only learn whether the spawn itself succeeded. Surfaces progress
// and errors through the launch slice (shown in the StatusBar). A successful launch
// clears after a short delay; an error stays until the next launch.
export async function launchGameAction(
    dispatch: Dispatch<Action>,
    id: number,
    name: string,
): Promise<void> {
    dispatch({type: "LAUNCH_PENDING", name});
    try {
        await launchGame(id);
        dispatch({type: "LAUNCH_SUCCESS"});
        setTimeout(() => dispatch({type: "LAUNCH_CLEAR"}), 3000);
    } catch (err) {
        dispatch({type: "LAUNCH_ERROR", error: String(err)});
    }
}

// Called once at the app root. Loads on mount and whenever the active system
// changes.
export function useGameLibrary(): void {
    const {system} = useAppState();
    const dispatch = useAppDispatch();

    useEffect(() => {
        void loadGames(dispatch, system);
    }, [system, dispatch]);
}
