import { useMemo } from "react";
import { GAMES } from "../data/games";
import { useAppState } from "../state/AppContext";
import type { Game, SortDir, SortKey } from "../state/types";

interface FilteredGames {
  rows: Game[];
  totalForSystem: number;
}

export function useFilteredGames(): FilteredGames {
  const { system, query, sort } = useAppState();

  return useMemo(() => {
    const forSystem = GAMES.filter((g) => g.system === system);
    const totalForSystem = forSystem.length;

    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? forSystem.filter(
          (g) =>
            g.latin_name.toLowerCase().includes(trimmed) ||
            g.japanese_name.toLowerCase().includes(trimmed) ||
            g.developer_name.toLowerCase().includes(trimmed) ||
            String(g.release_year).includes(trimmed),
        )
      : forSystem;

    const rows = [...filtered].sort(makeComparator(sort.key, sort.dir));
    return { rows, totalForSystem };
  }, [system, query, sort]);
}

function makeComparator(key: SortKey, dir: SortDir): (a: Game, b: Game) => number {
  const sign = dir === "asc" ? 1 : -1;
  return (a, b) => {
    if (key === "release_year") return sign * (a.release_year - b.release_year);
    return sign * String(a[key]).localeCompare(String(b[key]), "en");
  };
}
