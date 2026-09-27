import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  /** The theme actually in effect, with "system" resolved. */
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  /** Flip between light and dark, resolving "system" first. */
  toggleTheme: () => void;
};

const STORAGE_KEY = "vite-ui-theme";

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const systemTheme = (): "dark" | "light" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// NOTE: the pre-paint theme script in index.html duplicates the STORAGE_KEY and
// resolution logic above. HTML cannot import from here, so the two must stay in
// sync -- src/theme-init.test.ts asserts the key matches.

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    return stored ?? defaultTheme;
  });
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() =>
    typeof window === "undefined" ? false : systemTheme() === "dark"
  );

  // Follow the OS live. The old provider only read prefers-color-scheme during
  // its initial effect, so switching the OS appearance with the tab focused
  // left the app stale until a reload.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: "dark" | "light" =
    theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        /* storage unavailable -- theme still applies for this session */
      }
      setThemeState(next);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
