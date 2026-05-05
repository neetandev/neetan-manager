import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import App from "./App";
import { FirstSetupApp } from "./components/FirstSetup/FirstSetupApp";
import { AppProvider } from "./state/AppContext";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";

const isSetupWindow = getCurrentWindow().label === "setup";

const root = isSetupWindow ? (
  <FirstSetupApp />
) : (
  <AppProvider>
    <App />
  </AppProvider>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{root}</React.StrictMode>,
);
