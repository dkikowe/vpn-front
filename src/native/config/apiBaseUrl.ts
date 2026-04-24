import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Базовый URL API.
 * - iOS Simulator: по умолчанию http://localhost:3000
 * - Android Emulator: по умолчанию http://10.0.2.2:3000 (хост macOS/Windows)
 * - Физическое устройство / прод: задайте EXPO_PUBLIC_API_URL (и при необходимости extra.apiUrl в сборке)
 */
function defaultDevBaseUrl(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
}

const fromExpoExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const fromEnv =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : undefined;

export const API_BASE_URL = (fromExpoExtra || fromEnv || defaultDevBaseUrl()).replace(/\/$/, "");
