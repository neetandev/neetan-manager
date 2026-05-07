import {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useAppState} from "../state/AppContext";
import type {Game, SortDir, SortKey} from "../state/types";

interface FilteredGames {
    rows: Game[];
    totalForSystem: number;
}

export function useFilteredGames(): FilteredGames {
    const {i18n} = useTranslation();
    const {system, query, sort, games} = useAppState();
    const locale = i18n.language;

    return useMemo(() => {
        const forSystem = games.rows.filter((g) => g.system === system);
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

        const rows = [...filtered].sort(makeComparator(sort.key, sort.dir, locale));
        return {rows, totalForSystem};
    }, [system, query, sort, games.rows, locale]);
}

function makeComparator(
    key: SortKey,
    dir: SortDir,
    locale: string,
): (a: Game, b: Game) => number {
    const sign = dir === "asc" ? 1 : -1;
    return (a, b) => {
        if (key === "release_year") return sign * (a.release_year - b.release_year);
        return sign * String(a[key]).localeCompare(String(b[key]), locale);
    };
}
