import React from "react";
import ReactDOM from "react-dom/client";
import {getCurrentWindow} from "@tauri-apps/api/window";
import App from "./App";
import {FirstSetupApp} from "./components/FirstSetup/FirstSetupApp";
import {AppProvider} from "./state/AppContext";
import {getLocale} from "./lib/api";
import {initI18n, isLocale} from "./i18n";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";

const isSetupWindow = getCurrentWindow().label === "setup";

const root = isSetupWindow ? (
    <FirstSetupApp/>
) : (
    <AppProvider>
        <App/>
    </AppProvider>
);

async function bootstrap(): Promise<void> {
    let locale: "en" | "ja" = "en";
    try {
        const fromBackend = await getLocale();
        if (isLocale(fromBackend)) {
            locale = fromBackend;
        }
    } catch {
        // First run before the backend is fully wired, or transient IPC failure - fall back to
        // English. The user picks a real locale in FirstSetup or Settings.
    }
    await initI18n(locale);
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
        <React.StrictMode>{root}</React.StrictMode>,
    );
}

void bootstrap();
