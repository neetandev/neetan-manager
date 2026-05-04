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
            g.en.toLowerCase().includes(trimmed) ||
            g.jp.toLowerCase().includes(trimmed) ||
            g.dev.toLowerCase().includes(trimmed) ||
            String(g.year).includes(trimmed),
        )
      : forSystem;

    const rows = [...filtered].sort(makeComparator(sort.key, sort.dir));
    return { rows, totalForSystem };
  }, [system, query, sort]);
}

function makeComparator(key: SortKey, dir: SortDir): (a: Game, b: Game) => number {
  const sign = dir === "asc" ? 1 : -1;
  return (a, b) => {
    if (key === "year") return sign * (a.year - b.year);
    return sign * String(a[key]).localeCompare(String(b[key]), "en");
  };
}
