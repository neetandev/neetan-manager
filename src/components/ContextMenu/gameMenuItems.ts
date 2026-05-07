import type {Dispatch} from "react";
import type {TFunction} from "i18next";
import type {Action} from "../../state/types";
import type {ContextMenuItem} from "./ContextMenu";

export function buildGameContextMenuItems(
    t: TFunction,
    dispatch: Dispatch<Action>,
    gameId: number,
    closeMenu: () => void,
): ContextMenuItem[] {
    return [
        {
            label: t("common.edit"),
            onSelect: () => {
                dispatch({type: "OPEN_MODAL", kind: "edit", gameId});
                closeMenu();
            },
        },
        {
            label: t("common.duplicate"),
            onSelect: () => {
                dispatch({type: "OPEN_MODAL", kind: "duplicate", gameId});
                closeMenu();
            },
        },
        {
            label: t("common.delete"),
            danger: true,
            onSelect: () => {
                dispatch({type: "OPEN_MODAL", kind: "delete", gameId});
                closeMenu();
            },
        },
    ];
}
