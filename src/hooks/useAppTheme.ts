import { useState, useEffect, useCallback } from "react";

const LS_KEY = "appThemeMode";

export function useAppTheme() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(LS_KEY);
    const initial = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.setAttribute("data-theme", initial);
    return initial;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem(LS_KEY, mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  return { isDark: mode === "dark", toggle };
}