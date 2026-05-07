import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useFilteredGames} from "../../hooks/useFilteredGames";
import {useAppDispatch, useAppState} from "../../state/AppContext";
import type {SortDir, SortKey} from "../../state/types";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {buildGameContextMenuItems} from "../ContextMenu/gameMenuItems";
import "./GameTable.css";

interface ColumnDef {
    key: SortKey;
    label: string;
    width: string;
    align: "left" | "right";
}

function ariaSort(active: boolean, dir: SortDir) {
    if (!active) return "none" as const;
    return dir === "asc" ? ("ascending" as const) : ("descending" as const);
}

export function GameTable() {
    const {t} = useTranslation();
    const {sort, selected} = useAppState();
    const dispatch = useAppDispatch();
    const {rows} = useFilteredGames();
    const COLUMNS: ColumnDef[] = [
        {key: "latin_name", label: t("gameTable.columnLatin"), width: "32%", align: "left"},
        {key: "japanese_name", label: t("gameTable.columnJapanese"), width: "28%", align: "left"},
        {key: "developer_name", label: t("gameTable.columnDeveloper"), width: "22%", align: "left"},
        {key: "release_year", label: t("gameTable.columnYear"), width: "10%", align: "right"},
    ];
    const [menu, setMenu] = useState<{
        x: number;
        y: number;
        gameId: number;
    } | null>(null);
    const closeMenu = () => setMenu(null);

    return (
        <div className="game-table-wrap">
            <table className="game-table">
                <colgroup>
                    {COLUMNS.map((c) => (
                        <col key={c.key} style={{width: c.width}}/>
                    ))}
                </colgroup>
                <thead>
                <tr>
                    {COLUMNS.map((c) => {
                        const isActive = sort.key === c.key;
                        return (
                            <th
                                key={c.key}
                                scope="col"
                                className={`align-${c.align}${isActive ? " is-active" : ""}`}
                                aria-sort={ariaSort(isActive, sort.dir)}
                            >
                                <button
                                    type="button"
                                    className="th-button"
                                    onClick={() => dispatch({type: "SET_SORT", key: c.key})}
                                >
                                    <span className="th-label">{c.label}</span>
                                    <span className="th-indicator" aria-hidden="true">
                      {isActive && sort.dir === "desc" ? "▼" : "▲"}
                    </span>
                                </button>
                            </th>
                        );
                    })}
                </tr>
                </thead>
                <tbody>
                {rows.length === 0 ? (
                    <tr className="empty-row">
                        <td colSpan={COLUMNS.length}>{t("gameTable.emptyState")}</td>
                    </tr>
                ) : (
                    rows.map((g) => (
                        <tr
                            key={g.id}
                            className={`game-row${selected === g.id ? " is-selected" : ""}`}
                            onClick={() => dispatch({type: "SET_SELECTED", id: g.id})}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setMenu({x: e.clientX, y: e.clientY, gameId: g.id});
                            }}
                        >
                            <td className="cell-en">{g.latin_name}</td>
                            <td className="cell-jp">{g.japanese_name}</td>
                            <td className="cell-dev">{g.developer_name}</td>
                            <td className="cell-year">{g.release_year}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
            <ContextMenu
                open={menu !== null}
                x={menu?.x ?? 0}
                y={menu?.y ?? 0}
                onClose={closeMenu}
                items={
                    menu === null
                        ? []
                        : buildGameContextMenuItems(t, dispatch, menu.gameId, closeMenu)
                }
            />
        </div>
    );
}
