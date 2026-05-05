import { GAMES } from "../../data/games";
import { useFilteredGames } from "../../hooks/useFilteredGames";
import { useAppState } from "../../state/AppContext";
import "./StatusBar.css";

const VERSION = "v0.1.0";

export function StatusBar() {
  const { system, selected } = useAppState();
  const { rows, totalForSystem } = useFilteredGames();

  const selectedGame = selected != null ? GAMES.find((g) => g.id === selected) : undefined;
  const summary = `${system} · ${rows.length} of ${totalForSystem} shown`;
  const trailer = selectedGame ? ` · ${selectedGame.latin_name} selected` : "";

  return (
    <footer className="status-bar">
      <div className="status-left" />
      <div className="status-center">{summary}{trailer}</div>
      <div className="status-right">{VERSION}</div>
    </footer>
  );
}
