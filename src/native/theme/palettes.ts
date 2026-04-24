export type AppPalette = {
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  navBg: string;
  navBorder: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  success: string;
  warning: string;
  error: string;
  iconInactive: string;
  inputPlaceholder: string;
  overlaySelected: string;
  statusBarStyle: "light" | "dark";
  premium: string;
};

export const darkPalette: AppPalette = {
  bg: "#0B0F19",
  surface: "rgba(255,255,255,0.04)",
  surfaceMuted: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.12)",
  text: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  primary: "#06b6d4",
  primaryMuted: "rgba(6,182,212,0.16)",
  accent: "#22d3ee",
  navBg: "rgba(255,255,255,0.04)",
  navBorder: "rgba(255,255,255,0.08)",
  danger: "#f87171",
  dangerBg: "rgba(239,68,68,0.08)",
  dangerBorder: "rgba(239,68,68,0.35)",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  iconInactive: "#6b7280",
  inputPlaceholder: "#6b7280",
  overlaySelected: "rgba(6,182,212,0.14)",
  statusBarStyle: "light",
  premium: "#c084fc",
};

export const lightPalette: AppPalette = {
  bg: "#f4f6fb",
  surface: "#ffffff",
  surfaceMuted: "#eef1f8",
  border: "rgba(15,23,42,0.1)",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  primary: "#0891b2",
  primaryMuted: "rgba(8,145,178,0.12)",
  accent: "#0e7490",
  navBg: "#ffffff",
  navBorder: "rgba(15,23,42,0.08)",
  danger: "#dc2626",
  dangerBg: "rgba(220,38,38,0.08)",
  dangerBorder: "rgba(220,38,38,0.3)",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  iconInactive: "#94a3b8",
  inputPlaceholder: "#94a3b8",
  overlaySelected: "rgba(8,145,178,0.12)",
  statusBarStyle: "dark",
  premium: "#7c3aed",
};
