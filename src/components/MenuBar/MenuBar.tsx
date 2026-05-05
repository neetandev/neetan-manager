import { useState } from "react";
import { MenuDropdown, type MenuItem } from "./MenuDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { useAppDispatch } from "../../state/AppContext";
import { quitApp } from "../../lib/api";
import "./MenuBar.css";

type OpenMenu = "file" | "info" | null;

export function MenuBar() {
  const dispatch = useAppDispatch();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  const fileItems: MenuItem[] = [
    {
      kind: "item",
      label: "Settings…",
      shortcut: "⌘,",
      onSelect: () => dispatch({ type: "OPEN_MODAL", kind: "settings" }),
    },
    { kind: "divider" },
    {
      kind: "item",
      label: "Quit",
      shortcut: "⌘Q",
      onSelect: () => {
        void quitApp();
      },
    },
  ];

  const infoItems: MenuItem[] = [
    {
      kind: "item",
      label: "License",
      onSelect: () => dispatch({ type: "OPEN_MODAL", kind: "license" }),
    },
    {
      kind: "item",
      label: "Version",
      onSelect: () => dispatch({ type: "OPEN_MODAL", kind: "version" }),
    },
  ];

  function handleSelect(action: () => void) {
    action();
    setOpenMenu(null);
  }

  return (
    <div className="menu-bar" role="menubar">
      <div className="app-mark">
        <span className="app-mark-square" aria-hidden="true" />
        <span className="app-mark-name">
          <strong>neetan</strong>
          <span className="app-mark-suffix">manager</span>
        </span>
      </div>
      <div className="menu-bar-divider" aria-hidden="true" />
      <MenuDropdown
        id="file"
        label="File"
        items={fileItems}
        open={openMenu === "file"}
        anyOpen={openMenu !== null}
        onOpen={() => setOpenMenu("file")}
        onClose={() => setOpenMenu(null)}
        onHoverWhenAnotherOpen={() => setOpenMenu("file")}
        onSelect={handleSelect}
      />
      <MenuDropdown
        id="info"
        label="Info"
        items={infoItems}
        open={openMenu === "info"}
        anyOpen={openMenu !== null}
        onOpen={() => setOpenMenu("info")}
        onClose={() => setOpenMenu(null)}
        onHoverWhenAnotherOpen={() => setOpenMenu("info")}
        onSelect={handleSelect}
      />
      <div className="menu-bar-spacer" />
      <ThemeToggle />
    </div>
  );
}
