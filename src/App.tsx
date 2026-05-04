import { MenuBar } from "./components/MenuBar/MenuBar";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { GameTable } from "./components/GameTable/GameTable";
import { GameGrid } from "./components/GameGrid/GameGrid";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { ModalRoot } from "./components/Modal/ModalRoot";
import { useTheme } from "./hooks/useTheme";
import { useAppState } from "./state/AppContext";

function App() {
  useTheme();
  const { view } = useAppState();

  return (
    <div className="app-root">
      <div className="app-window">
        <MenuBar />
        <Sidebar />
        <main className="main-pane">
          <Toolbar />
          <div className="content">
            {view === "table" ? <GameTable /> : <GameGrid />}
          </div>
        </main>
        <StatusBar />
      </div>
      <ModalRoot />
    </div>
  );
}

export default App;
