import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {invoke} from "@tauri-apps/api/core";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

export type Locale = "en" | "ja";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "ja"] as const;

const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Initializes i18next with the given locale. Must be awaited before mounting the React tree
 * so the first paint is in the right language.
 */
export function initI18n(locale: Locale): Promise<unknown> {
    return i18n.use(initReactI18next).init({
        lng: locale,
        fallbackLng: DEFAULT_LOCALE,
        resources: {
            en: {translation: en},
            ja: {translation: ja},
        },
        interpolation: {escapeValue: false},
        returnNull: false,
    });
}

/**
 * Persists the locale through the backend then switches the live i18next instance. If the
 * client-side switch throws after the backend has already persisted, we attempt to revert
 * the backend so the two halves can't drift.
 */
export async function setLocale(locale: Locale): Promise<void> {
    const previous = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
    await invoke("set_locale", {locale});
    try {
        await i18n.changeLanguage(locale);
    } catch (err) {
        try {
            await invoke("set_locale", {locale: previous});
        } catch {
            // Revert failed; backend now ahead of UI. The original error is still
            // the most actionable signal, so rethrow that.
        }
        throw err;
    }
}

export {i18n};
