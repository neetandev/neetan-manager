import {useTranslation} from "react-i18next";
import {SYSTEMS} from "../../data/systems";
import {useAppVersion} from "../../hooks/useAppVersion";
import {useFilteredGames} from "../../hooks/useFilteredGames";
import {useAppState} from "../../state/AppContext";
import "./StatusBar.css";

export function StatusBar() {
    const {t} = useTranslation();
    const {system, selected, games} = useAppState();
    const {rows, totalForSystem} = useFilteredGames();
    const version = useAppVersion();

    const selectedGame =
        selected != null ? games.rows.find((g) => g.id === selected) : undefined;
    const systemName = SYSTEMS.find((s) => s.id === system)?.name ?? system;

    let center: string;
    if (games.status === "loading" && games.rows.length === 0) {
        center = `${systemName} · ${t("status.loading")}`;
    } else if (games.status === "error") {
        center = `${systemName} · ${t("status.failed", {error: games.error ?? t("common.unknownError")})}`;
    } else {
        const summary = t("status.summary", {
            system: systemName,
            shown: rows.length,
            total: totalForSystem,
        });
        const trailer = selectedGame
            ? ` · ${t("status.selected", {name: selectedGame.latin_name})}`
            : "";
        center = `${summary}${trailer}`;
    }

    return (
        <footer className="status-bar">
            <div className="status-left"/>
            <div className="status-center">{center}</div>
            <div className="status-right">{`v${version ?? "…"}`}</div>
        </footer>
    );
}
