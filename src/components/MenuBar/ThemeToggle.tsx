import {useTranslation} from "react-i18next";
import {MoonIcon, SunIcon} from "../../icons/Icons";
import {useAppDispatch, useAppState} from "../../state/AppContext";

export function ThemeToggle() {
    const {t} = useTranslation();
    const {theme} = useAppState();
    const dispatch = useAppDispatch();
    const isDark = theme === "dark";
    const label = isDark ? t("themeToggle.switchToLight") : t("themeToggle.switchToDark");
    return (
        <button
            type="button"
            className="theme-toggle"
            aria-label={label}
            title={label}
            onClick={() => dispatch({type: "TOGGLE_THEME"})}
        >
            {isDark ? <SunIcon size={14}/> : <MoonIcon size={14}/>}
        </button>
    );
}
