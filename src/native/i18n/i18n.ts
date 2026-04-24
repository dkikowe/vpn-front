import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

export const LANG_STORAGE_KEY = "app_language";

export type AppLanguage = "ru" | "en";

function deviceLanguage(): AppLanguage {
  const code = Localization.getLocales()[0]?.languageCode;
  return code === "en" ? "en" : "ru";
}

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: deviceLanguage(),
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

export async function loadStoredLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "ru") {
      await i18n.changeLanguage(saved);
    }
  } catch {
    /* ignore */
  }
}

export async function setAppLanguage(lng: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANG_STORAGE_KEY, lng);
  await i18n.changeLanguage(lng);
}

export default i18n;
