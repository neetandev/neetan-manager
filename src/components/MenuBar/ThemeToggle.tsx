import { MoonIcon, SunIcon } from "../../icons/Icons";
import { useAppDispatch, useAppState } from "../../state/AppContext";

export function ThemeToggle() {
  const { theme } = useAppState();
  const dispatch = useAppDispatch();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => dispatch({ type: "TOGGLE_THEME" })}
    >
      {isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
    </button>
  );
}
