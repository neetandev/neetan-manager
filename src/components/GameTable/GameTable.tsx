import { useFilteredGames } from "../../hooks/useFilteredGames";
import { useAppDispatch, useAppState } from "../../state/AppContext";
import type { SortDir, SortKey } from "../../state/types";
import "./GameTable.css";

interface ColumnDef {
  key: SortKey;
  label: string;
  width: string;
  align: "left" | "right";
}

const COLUMNS: ColumnDef[] = [
  { key: "latin_name", label: "English Name", width: "32%", align: "left" },
  { key: "japanese_name", label: "Japanese Name", width: "28%", align: "left" },
  { key: "developer_name", label: "Developer", width: "22%", align: "left" },
  { key: "release_year", label: "Year", width: "10%", align: "right" },
];

function ariaSort(active: boolean, dir: SortDir) {
  if (!active) return "none" as const;
  return dir === "asc" ? ("ascending" as const) : ("descending" as const);
}

export function GameTable() {
  const { sort, selected } = useAppState();
  const dispatch = useAppDispatch();
  const { rows } = useFilteredGames();

  return (
    <div className="game-table-wrap">
      <table className="game-table">
        <colgroup>
          {COLUMNS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
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
                    onClick={() => dispatch({ type: "SET_SORT", key: c.key })}
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
              <td colSpan={COLUMNS.length}>No titles match your search.</td>
            </tr>
          ) : (
            rows.map((g) => (
              <tr
                key={g.id}
                className={`game-row${selected === g.id ? " is-selected" : ""}`}
                onClick={() => dispatch({ type: "SET_SELECTED", id: g.id })}
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
    </div>
  );
}
