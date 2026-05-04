import { useEffect } from "react";
import { useAppState } from "../state/AppContext";

const THEME_KEY = "neetan.theme";

export function useTheme(): void {
  const { theme } = useAppState();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage may be unavailable (e.g. private mode); theme still applies.
    }
  }, [theme]);
}
