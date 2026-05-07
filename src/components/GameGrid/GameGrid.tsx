import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useFilteredGames} from "../../hooks/useFilteredGames";
import {useAppDispatch, useAppState} from "../../state/AppContext";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {buildGameContextMenuItems} from "../ContextMenu/gameMenuItems";
import "./GameGrid.css";

export function GameGrid() {
    const {t} = useTranslation();
    const {selected} = useAppState();
    const dispatch = useAppDispatch();
    const {rows} = useFilteredGames();
    const [menu, setMenu] = useState<{
        x: number;
        y: number;
        gameId: number;
    } | null>(null);
    const closeMenu = () => setMenu(null);

    if (rows.length === 0) {
        return (
            <div className="grid-empty">{t("gameGrid.emptyState")}</div>
        );
    }

    return (
        <div className="game-grid">
            {rows.map((g) => (
                <button
                    type="button"
                    key={g.id}
                    className={`tile${selected === g.id ? " is-selected" : ""}`}
                    onClick={() => dispatch({type: "SET_SELECTED", id: g.id})}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setMenu({x: e.clientX, y: e.clientY, gameId: g.id});
                    }}
                >
          <span className="tile-cover">
            <span className="tile-cover-pill">{t("gameGrid.boxArtPlaceholder")}</span>
            <span className="tile-year-pill">{g.release_year}</span>
          </span>
                    <span className="tile-meta">
            <span className="tile-en">{g.latin_name}</span>
            <span className="tile-jp">{g.japanese_name}</span>
            <span className="tile-dev">{g.developer_name}</span>
          </span>
                </button>
            ))}
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
