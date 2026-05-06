import { SYSTEMS } from "../../data/systems";
import { useFilteredGames } from "../../hooks/useFilteredGames";
import { useAppState } from "../../state/AppContext";
import { ActionGroup } from "./ActionGroup";
import { SearchInput } from "./SearchInput";
import { ViewToggle } from "./ViewToggle";
import "./Toolbar.css";

export function Toolbar() {
  const { system } = useAppState();
  const { rows } = useFilteredGames();
  const meta = SYSTEMS.find((s) => s.id === system);
  const title = meta?.name ?? system;

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">{title}</h1>
        <span className="toolbar-count">
          {rows.length} title{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="toolbar-right">
        <ActionGroup />
        <SearchInput />
        <ViewToggle />
      </div>
    </header>
  );
}
