import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {open} from "@tauri-apps/plugin-dialog";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {Button} from "../Modal/Button";
import {
    completeFirstSetup,
    defaultPortableDirectory,
    quitApp,
} from "../../lib/api";
import {isLocale, setLocale, type Locale} from "../../i18n";
import "./FirstSetup.css";

interface State {
    value: string | null;
    busy: boolean;
    error: string | null;
}

const INITIAL: State = {value: null, busy: false, error: null};

export function FirstSetupApp() {
    const {t, i18n} = useTranslation();
    const [state, setState] = useState<State>(INITIAL);

    const errorMessage = useCallback(
        (err: unknown): string => {
            if (typeof err === "string") return err;
            if (err instanceof Error) return err.message;
            try {
                return JSON.stringify(err);
            } catch {
                return t("common.unknownError");
            }
        },
        [t],
    );

    useEffect(() => {
        let cancelled = false;
        defaultPortableDirectory()
            .then((cwd) => {
                if (cancelled) return;
                setState((s) => (s.value === null ? {...s, value: cwd} : s));
            })
            .catch((err) => {
                if (cancelled) return;
                setState((s) => ({...s, error: errorMessage(err)}));
            });
        return () => {
            cancelled = true;
        };
    }, [errorMessage]);

    useEffect(() => {
        const w = getCurrentWindow();
        const unlisten = w.onCloseRequested((event) => {
            event.preventDefault();
            void quitApp();
        });
        return () => {
            void unlisten.then((fn) => fn());
        };
    }, []);

    const onBrowse = useCallback(async () => {
        setState((s) => ({...s, error: null}));
        let picked: string | string[] | null = null;
        try {
            picked = await open({
                directory: true,
                multiple: false,
                title: t("settings.selectPortableDirectory"),
            });
        } catch (err) {
            setState((s) => ({...s, error: errorMessage(err)}));
            return;
        }
        if (typeof picked === "string") {
            setState((s) => ({...s, value: picked as string, error: null}));
        }
    }, [t, errorMessage]);

    const onConfirm = useCallback(async () => {
        if (!state.value) return;
        setState((s) => ({...s, busy: true, error: null}));
        try {
            await completeFirstSetup(state.value);
            // Backend transitions windows on success; this view will be torn down.
        } catch (err) {
            setState((s) => ({...s, busy: false, error: errorMessage(err)}));
        }
    }, [state.value, errorMessage]);

    const onCancel = useCallback(async () => {
        try {
            await quitApp();
        } catch (err) {
            setState((s) => ({...s, error: errorMessage(err)}));
        }
    }, [errorMessage]);

    const currentLocale: Locale = isLocale(i18n.language) ? i18n.language : "en";
    const onLocaleChange = useCallback(
        async (next: Locale) => {
            try {
                await setLocale(next);
            } catch (err) {
                setState((s) => ({...s, error: errorMessage(err)}));
            }
        },
        [errorMessage],
    );

    const okDisabled = state.value === null || state.busy;

    return (
        <div className="first-setup">
            <header className="first-setup-header">
                <h1 className="first-setup-title">{t("firstSetup.title")}</h1>
            </header>

            <main className="first-setup-body">
                <div className="setting-row">
                    <div className="setting-row-head">
                        <label className="setting-label">{t("firstSetup.language")}</label>
                    </div>
                    <div className="setting-actions">
                        <select
                            className="select"
                            value={currentLocale}
                            onChange={(e) => void onLocaleChange(e.target.value as Locale)}
                            disabled={state.busy}
                            aria-label={t("firstSetup.language")}
                        >
                            <option value="en">{t("settings.languageEnglish")}</option>
                            <option value="ja">{t("settings.languageJapanese")}</option>
                        </select>
                    </div>
                </div>

                <div className="setting-row">
                    <div className="setting-row-head">
                        <label className="setting-label">{t("firstSetup.portableDirectory")}</label>
                        <p className="setting-help">{t("firstSetup.portableDirectoryHelp")}</p>
                    </div>

                    <div className="setting-value-strip">
                        {state.value ? (
                            <span className="setting-value setting-value-set">
                {state.value}
              </span>
                        ) : (
                            <span className="setting-value setting-value-unset">{t("common.notSet")}</span>
                        )}
                    </div>

                    <div className="setting-actions">
                        <Button variant="primary" onClick={onBrowse} disabled={state.busy}>
                            {t("common.browse")}
                        </Button>
                    </div>

                    {state.error && (
                        <div className="setting-error" role="alert">
                            {state.error}
                        </div>
                    )}
                </div>
            </main>

            <footer className="first-setup-footer">
                <Button variant="ghost" onClick={onCancel} disabled={state.busy}>
                    {t("common.cancel")}
                </Button>
                <Button variant="primary" onClick={onConfirm} disabled={okDisabled}>
                    {t("common.ok")}
                </Button>
            </footer>
        </div>
    );
}
