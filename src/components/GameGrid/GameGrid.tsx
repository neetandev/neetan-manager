import { useFilteredGames } from "../../hooks/useFilteredGames";
import { useAppDispatch, useAppState } from "../../state/AppContext";
import "./GameGrid.css";

export function GameGrid() {
  const { selected } = useAppState();
  const dispatch = useAppDispatch();
  const { rows } = useFilteredGames();

  if (rows.length === 0) {
    return (
      <div className="grid-empty">No titles match your search.</div>
    );
  }

  return (
    <div className="game-grid">
      {rows.map((g) => (
        <button
          type="button"
          key={g.id}
          className={`tile${selected === g.id ? " is-selected" : ""}`}
          onClick={() => dispatch({ type: "SET_SELECTED", id: g.id })}
        >
          <span className="tile-cover">
            <span className="tile-cover-pill">BOX ART</span>
            <span className="tile-year-pill">{g.year}</span>
          </span>
          <span className="tile-meta">
            <span className="tile-en">{g.en}</span>
            <span className="tile-jp">{g.jp}</span>
            <span className="tile-dev">{g.dev}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
