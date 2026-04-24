import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import type { AppPalette } from "./palettes";
import { darkPalette, lightPalette } from "./palettes";

const STORAGE_KEY = "app_theme_preference";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  preference: ThemePreference;
  /** Учитывает system, если preference === system */
  resolved: "light" | "dark";
  colors: AppPalette;
  setPreference: (next: ThemePreference) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (raw === "light" || raw === "dark" || raw === "system")) {
          setPreferenceState(raw);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const resolved: "light" | "dark" =
    preference === "system" ? (system === "dark" ? "dark" : "light") : preference;

  const colors = resolved === "dark" ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({
      preference,
      resolved,
      colors,
      setPreference,
      isDark: resolved === "dark",
    }),
    [preference, resolved, colors, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return ctx;
}
