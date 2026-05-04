import { useMemo } from "react";
import { GAMES } from "../../data/games";
import { SYSTEMS } from "../../data/systems";
import { useAppDispatch, useAppState } from "../../state/AppContext";
import { SystemCard } from "./SystemCard";
import "./Sidebar.css";

export function Sidebar() {
  const { system } = useAppState();
  const dispatch = useAppDispatch();

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const g of GAMES) acc[g.system] = (acc[g.system] ?? 0) + 1;
    return acc;
  }, []);

  return (
    <aside className="sidebar">
      <h2 className="sidebar-section-label">SYSTEMS</h2>
      <div className="sidebar-list">
        {SYSTEMS.map((s) => (
          <SystemCard
            key={s.id}
            system={s}
            active={system === s.id}
            count={counts[s.id] ?? 0}
            onClick={() => dispatch({ type: "SET_SYSTEM", system: s.id })}
          />
        ))}
      </div>
    </aside>
  );
}
