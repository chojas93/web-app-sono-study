// Design tokens (light + dark) from /app/design_guidelines.json.
// The in-app toggle (setColorScheme) overrides the device scheme and is saved on-device.
import { useMemo, useSyncExternalStore } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

import { storage } from "@/src/utils/storage";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FDFBF7",
  onSurface: "#1A1918",
  surfaceSecondary: "#F2EFE9",
  onSurfaceSecondary: "#1A1918",
  surfaceTertiary: "#E8E4DB",
  onSurfaceTertiary: "#4A4845",
  surfaceInverse: "#1A1918",
  onSurfaceInverse: "#FDFBF7",
  muted: "#7A7773",
  brand: "#E07A5F",
  onBrand: "#FFFFFF",
  brandPrimary: "#E07A5F",
  onBrandPrimary: "#1A1918",
  brandSecondary: "#F9C74F",
  onBrandSecondary: "#1A1918",
  brandTertiary: "#FAD7D4",
  onBrandTertiary: "#9A3923",
  success: "#4EA86A",
  onSuccess: "#1A1918",
  warning: "#F9C74F",
  onWarning: "#1A1918",
  error: "#E63946",
  onError: "#FFFFFF",
  info: "#8DB38B",
  onInfo: "#1A1918",
  border: "#E8E4DB",
  borderStrong: "#D6D0C4",
  divider: "#E8E4DB",
  topicOverview: "#D98A6C",
  topicLiver: "#FF9F43",
  topicGallbladder: "#4EA86A",
  topicPancreas: "#F9C74F",
  topicGITract: "#E07A5F",
  topicSpleen: "#B39DDB",
  topicUrinary: "#5DA9E9",
  topicAdrenal: "#F6AE2D",
  topicVasculature: "#F28482",
  topicChest: "#7FB7BE",
  topicBiliary: "#8FC93A",
  topicNeck: "#4CC9F0",
  topicMale: "#6C9BD2",
  topicMSK: "#E9A178",
  onTopic: "#1A1918",
};

export type ThemeColors = typeof light;

const dark: ThemeColors = {
  surface: "#181817",
  onSurface: "#FDFBF7",
  surfaceSecondary: "#242322",
  onSurfaceSecondary: "#FDFBF7",
  surfaceTertiary: "#302E2D",
  onSurfaceTertiary: "#D6D0C4",
  surfaceInverse: "#FDFBF7",
  onSurfaceInverse: "#1A1918",
  muted: "#9A9792",
  brand: "#E07A5F",
  onBrand: "#FFFFFF",
  brandPrimary: "#E07A5F",
  onBrandPrimary: "#1A1918",
  brandSecondary: "#F9C74F",
  onBrandSecondary: "#1A1918",
  brandTertiary: "#4A2A22",
  onBrandTertiary: "#FAD7D4",
  success: "#4EA86A",
  onSuccess: "#1A1918",
  warning: "#F9C74F",
  onWarning: "#1A1918",
  error: "#F25C69",
  onError: "#FFFFFF",
  info: "#8DB38B",
  onInfo: "#1A1918",
  border: "#302E2D",
  borderStrong: "#4A4845",
  divider: "#302E2D",
  topicOverview: "#D98A6C",
  topicLiver: "#FF9F43",
  topicGallbladder: "#4EA86A",
  topicPancreas: "#F9C74F",
  topicGITract: "#E07A5F",
  topicSpleen: "#B39DDB",
  topicUrinary: "#5DA9E9",
  topicAdrenal: "#F6AE2D",
  topicVasculature: "#F28482",
  topicChest: "#7FB7BE",
  topicBiliary: "#8FC93A",
  topicNeck: "#4CC9F0",
  topicMale: "#6C9BD2",
  topicMSK: "#E9A178",
  onTopic: "#1A1918",
};

export const themes: Record<ColorScheme, ThemeColors> = { light, dark };

export const fonts = { display: "Fredoka", text: "Nunito" };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 };

const THEME_KEY = "theme_pref";
let override: ColorScheme | null = null;
const listeners = new Set<() => void>();

export function setColorScheme(scheme: ColorScheme | null) {
  override = scheme;
  try {
    Appearance.setColorScheme?.(scheme ?? "unspecified");
  } catch {
    // web does not implement it
  }
  listeners.forEach((l) => l());
  storage.setItem(THEME_KEY, scheme);
}

export async function loadSavedScheme() {
  const saved = await storage.getItem(THEME_KEY, null as string | null);
  if (saved === "light" || saved === "dark") setColorScheme(saved);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
const getOverride = () => override;

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const o = useSyncExternalStore(subscribe, getOverride, getOverride);
  const scheme: ColorScheme = o ?? (system === "dark" ? "dark" : "light");
  return { scheme, colors: themes[scheme] };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
