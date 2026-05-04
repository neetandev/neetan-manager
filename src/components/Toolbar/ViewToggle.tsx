import { GridIcon, TableIcon } from "../../icons/Icons";
import { useAppDispatch, useAppState } from "../../state/AppContext";
import type { View } from "../../state/types";

export function ViewToggle() {
  const { view } = useAppState();
  const dispatch = useAppDispatch();

  function set(v: View) {
    dispatch({ type: "SET_VIEW", view: v });
  }

  return (
    <div className="view-toggle" role="group" aria-label="Switch content view">
      <button
        type="button"
        className={`view-toggle-btn${view === "table" ? " is-active" : ""}`}
        aria-pressed={view === "table"}
        aria-label="Table view"
        title="Table view"
        onClick={() => set("table")}
      >
        <TableIcon size={13} />
      </button>
      <button
        type="button"
        className={`view-toggle-btn${view === "grid" ? " is-active" : ""}`}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        title="Grid view"
        onClick={() => set("grid")}
      >
        <GridIcon size={13} />
      </button>
    </div>
  );
}
