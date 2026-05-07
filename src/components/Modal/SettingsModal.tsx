import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {open} from "@tauri-apps/plugin-dialog";
import {
    getNeetanExecutable,
    getPortableDirectory,
    setNeetanExecutable,
    setPortableDirectory,
} from "../../lib/api";
import {isLocale, setLocale, type Locale} from "../../i18n";
import {Button} from "./Button";
import {Modal} from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
}

interface FieldState {
    value: string | null;
    loading: boolean;
    busy: boolean;
    error: string | null;
}

const INITIAL: FieldState = {
    value: null,
    loading: true,
    busy: false,
    error: null,
};

export function SettingsModal({open: isOpen, onClose}: Props) {
    const {t, i18n} = useTranslation();
    const [portable, setPortable] = useState<FieldState>(INITIAL);
    const [executable, setExecutable] = useState<FieldState>(INITIAL);
    const [localeError, setLocaleError] = useState<string | null>(null);

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
        if (!isOpen) return;
        let cancelled = false;
        setPortable({...INITIAL, loading: true});
        setExecutable({...INITIAL, loading: true});
        getPortableDirectory()
            .then((value) => {
                if (cancelled) return;
                setPortable({value, loading: false, busy: false, error: null});
            })
            .catch((err) => {
                if (cancelled) return;
                setPortable({
                    value: null,
                    loading: false,
                    busy: false,
                    error: errorMessage(err),
                });
            });
        getNeetanExecutable()
            .then((value) => {
                if (cancelled) return;
                setExecutable({value, loading: false, busy: false, error: null});
            })
            .catch((err) => {
                if (cancelled) return;
                setExecutable({
                    value: null,
                    loading: false,
                    busy: false,
                    error: errorMessage(err),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [isOpen, errorMessage]);

    const applyPortable = useCallback(
        async (next: string | null) => {
            setPortable((s) => ({...s, busy: true, error: null}));
            try {
                await setPortableDirectory(next);
                const fresh = await getPortableDirectory();
                setPortable({value: fresh, loading: false, busy: false, error: null});
            } catch (err) {
                setPortable((s) => ({...s, busy: false, error: errorMessage(err)}));
            }
        },
        [errorMessage],
    );

    const applyExecutable = useCallback(
        async (next: string | null) => {
            setExecutable((s) => ({...s, busy: true, error: null}));
            try {
                await setNeetanExecutable(next);
                const fresh = await getNeetanExecutable();
                setExecutable({value: fresh, loading: false, busy: false, error: null});
            } catch (err) {
                setExecutable((s) => ({...s, busy: false, error: errorMessage(err)}));
            }
        },
        [errorMessage],
    );

    const onBrowsePortable = useCallback(async () => {
        setPortable((s) => ({...s, error: null}));
        let picked: string | string[] | null = null;
        try {
            picked = await open({
                directory: true,
                multiple: false,
                title: t("settings.selectPortableDirectory"),
            });
        } catch (err) {
            setPortable((s) => ({...s, error: errorMessage(err)}));
            return;
        }
        if (typeof picked === "string") {
            void applyPortable(picked);
        }
    }, [applyPortable, t, errorMessage]);

    const onBrowseExecutable = useCallback(async () => {
        setExecutable((s) => ({...s, error: null}));
        let picked: string | string[] | null = null;
        try {
            picked = await open({
                directory: false,
                multiple: false,
                title: t("settings.selectNeetanExecutable"),
            });
        } catch (err) {
            setExecutable((s) => ({...s, error: errorMessage(err)}));
            return;
        }
        if (typeof picked === "string") {
            void applyExecutable(picked);
        }
    }, [applyExecutable, t, errorMessage]);

    const onClearPortable = useCallback(() => {
        void applyPortable(null);
    }, [applyPortable]);

    const onClearExecutable = useCallback(() => {
        void applyExecutable(null);
    }, [applyExecutable]);

    const currentLocale: Locale = isLocale(i18n.language) ? i18n.language : "en";
    const onLocaleChange = useCallback(
        async (next: Locale) => {
            setLocaleError(null);
            try {
                await setLocale(next);
            } catch (err) {
                setLocaleError(errorMessage(err));
            }
        },
        [errorMessage],
    );

    return (
        <Modal
            title={t("settings.title")}
            open={isOpen}
            onClose={onClose}
            footer={
                <Button variant="primary" onClick={onClose}>
                    {t("common.close")}
                </Button>
            }
        >
            <div className="setting-row">
                <div className="setting-row-head">
                    <label className="setting-label">{t("settings.language")}</label>
                </div>
                <div className="setting-actions">
                    <select
                        className="select"
                        value={currentLocale}
                        onChange={(e) => void onLocaleChange(e.target.value as Locale)}
                        aria-label={t("settings.language")}
                    >
                        <option value="en">{t("settings.languageEnglish")}</option>
                        <option value="ja">{t("settings.languageJapanese")}</option>
                    </select>
                </div>
                {localeError && (
                    <div className="setting-error" role="alert">
                        {localeError}
                    </div>
                )}
            </div>

            <div className="setting-row">
                <div className="setting-row-head">
                    <label className="setting-label">{t("settings.portableDirectory")}</label>
                    <p className="setting-help">{t("settings.portableDirectoryHelp")}</p>
                </div>

                <div className="setting-value-strip" aria-busy={portable.loading}>
                    {portable.loading ? (
                        <span className="setting-value setting-value-skeleton">{t("common.loading")}</span>
                    ) : portable.value ? (
                        <span className="setting-value setting-value-set">{portable.value}</span>
                    ) : (
                        <span className="setting-value setting-value-unset">{t("common.notSet")}</span>
                    )}
                </div>

                <div className="setting-actions">
                    <Button
                        variant="primary"
                        onClick={onBrowsePortable}
                        disabled={portable.loading || portable.busy}
                    >
                        {t("common.browse")}
                    </Button>
                    {portable.value !== null && (
                        <Button
                            variant="ghost"
                            onClick={onClearPortable}
                            disabled={portable.loading || portable.busy}
                        >
                            {t("common.clear")}
                        </Button>
                    )}
                </div>

                {portable.error && (
                    <div className="setting-error" role="alert">
                        {portable.error}
                    </div>
                )}
            </div>

            <div className="setting-row">
                <div className="setting-row-head">
                    <label className="setting-label">{t("settings.neetanExecutable")}</label>
                    <p className="setting-help">{t("settings.neetanExecutableHelp")}</p>
                </div>

                <div className="setting-value-strip" aria-busy={executable.loading}>
                    {executable.loading ? (
                        <span className="setting-value setting-value-skeleton">{t("common.loading")}</span>
                    ) : executable.value ? (
                        <span className="setting-value setting-value-set">
              {executable.value}
            </span>
                    ) : (
                        <span className="setting-value setting-value-unset">{t("common.notSet")}</span>
                    )}
                </div>

                <div className="setting-actions">
                    <Button
                        variant="primary"
                        onClick={onBrowseExecutable}
                        disabled={executable.loading || executable.busy}
                    >
                        {t("common.browse")}
                    </Button>
                    {executable.value !== null && (
                        <Button
                            variant="ghost"
                            onClick={onClearExecutable}
                            disabled={executable.loading || executable.busy}
                        >
                            {t("common.clear")}
                        </Button>
                    )}
                </div>

                {executable.error && (
                    <div className="setting-error" role="alert">
                        {executable.error}
                    </div>
                )}
            </div>
        </Modal>
    );
}
