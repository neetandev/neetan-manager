import {useEffect, type Dispatch} from "react";
import {listGames} from "../lib/api";
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

// Called once at the app root. Loads on mount and whenever the active system
// changes.
export function useGameLibrary(): void {
    const {system} = useAppState();
    const dispatch = useAppDispatch();

    useEffect(() => {
        void loadGames(dispatch, system);
    }, [system, dispatch]);
}
