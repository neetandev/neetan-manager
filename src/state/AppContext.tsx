import {
    createContext,
    useContext,
    useReducer,
    type Dispatch,
    type ReactNode,
} from "react";
import type {Action, AppState, Theme} from "./types";

const THEME_KEY = "neetan.theme";

function readInitialTheme(): Theme {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "dark" ? "dark" : "light";
}

const initialState: AppState = {
    theme: readInitialTheme(),
    system: "PC-9800",
    query: "",
    view: "table",
    sort: {key: "latin_name", dir: "asc"},
    selected: null,
    modal: null,
    modalTargetGame: null,
    configSystem: null,
    systemConfigVersion: 0,
    games: {status: "idle", rows: [], error: null},
};

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "SET_SYSTEM":
            if (state.system === action.system) return state;
            return {...state, system: action.system, selected: null};
        case "SET_QUERY":
            if (state.query === action.query) return state;
            return {...state, query: action.query, selected: null};
        case "SET_VIEW":
            return state.view === action.view ? state : {...state, view: action.view};
        case "SET_SORT": {
            const sameKey = state.sort.key === action.key;
            const dir = sameKey && state.sort.dir === "asc" ? "desc" : "asc";
            return {...state, sort: {key: action.key, dir}};
        }
        case "SET_SELECTED":
            return {...state, selected: action.id};
        case "OPEN_MODAL":
            return {
                ...state,
                modal: action.kind,
                modalTargetGame: action.gameId ?? null,
            };
        case "OPEN_SYSTEM_CONFIG_MODAL":
            return {...state, modal: "system-config", configSystem: action.system};
        case "BUMP_SYSTEM_CONFIG":
            return {...state, systemConfigVersion: state.systemConfigVersion + 1};
        case "CLOSE_MODAL":
            return state.modal === null
                ? state
                : {...state, modal: null, modalTargetGame: null, configSystem: null};
        case "SET_THEME":
            return state.theme === action.theme ? state : {...state, theme: action.theme};
        case "TOGGLE_THEME":
            return {...state, theme: state.theme === "light" ? "dark" : "light"};
        case "LOAD_GAMES_PENDING":
            return {...state, games: {...state.games, status: "loading", error: null}};
        case "LOAD_GAMES_SUCCESS": {
            const rows = action.rows;
            // Drop the selection if the previously-selected game is gone (e.g. just deleted).
            const selected =
                state.selected !== null && rows.some((g) => g.id === state.selected)
                    ? state.selected
                    : null;
            const modalTargetGame =
                state.modalTargetGame !== null &&
                rows.some((g) => g.id === state.modalTargetGame)
                    ? state.modalTargetGame
                    : null;
            return {
                ...state,
                selected,
                modalTargetGame,
                games: {status: "loaded", rows, error: null},
            };
        }
        case "LOAD_GAMES_ERROR":
            return {
                ...state,
                games: {...state.games, status: "error", error: action.error},
            };
        default: {
            const _exhaustive: never = action;
            throw new Error(`Unhandled action: ${JSON.stringify(_exhaustive)}`);
        }
    }
}

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function AppProvider({children}: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
}

export function useAppState(): AppState {
    const ctx = useContext(StateContext);
    if (!ctx) throw new Error("useAppState must be used within AppProvider");
    return ctx;
}

export function useAppDispatch(): Dispatch<Action> {
    const ctx = useContext(DispatchContext);
    if (!ctx) throw new Error("useAppDispatch must be used within AppProvider");
    return ctx;
}
