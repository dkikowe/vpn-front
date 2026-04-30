import { SafeAreaView, StatusBar, StyleSheet, View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import LoginScreen from "./src/native/screens/LoginScreen";
import MainScreen from "./src/native/screens/MainScreen";
import PremiumScreen from "./src/native/screens/PremiumScreen";
import RegisterScreen from "./src/native/screens/RegisterScreen";
import ServerScreen from "./src/native/screens/ServerScreen";
import SettingsScreen from "./src/native/screens/SettingsScreen";
import type { AuthPayload, AuthUser } from "./src/native/api/types";
import type { VpnServerId } from "./src/native/api/client";
import { fetchMeRequest } from "./src/native/api/client";
import { deleteToken, getToken, saveToken } from "./src/native/auth/tokenStorage";
import i18n, { loadStoredLanguage } from "./src/native/i18n/i18n";
import { ThemeProvider, useAppTheme } from "./src/native/theme/ThemeContext";
import type { WireGuardNativeConfig } from "./src/native/vpn/parseWireGuardIni";

export type ScreenName =
  | "login"
  | "register"
  | "main"
  | "servers"
  | "premium"
  | "settings";

function AppContent() {
  const { colors } = useAppTheme();
  const [screen, setScreen] = useState<ScreenName>("main");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<VpnServerId>("fra1");
  const [vpnConnected, setVpnConnected] = useState(false);
  const [authReturnScreen, setAuthReturnScreen] = useState<ScreenName>("premium");

  type WireGuardClient = {
    disconnect: () => Promise<void>;
    connect: (config: WireGuardNativeConfig) => Promise<void>;
    isSupported: () => Promise<boolean>;
  };

  const WireGuardVpn: WireGuardClient = (() => {
    const lib = require("react-native-wireguard-vpn");
    return (lib.default ?? lib) as WireGuardClient;
  })();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const me = await fetchMeRequest(token);
        if (!cancelled) {
          setUser(me);
          setIsAuthenticated(true);
          setScreen("main");
        }
      } catch {
        await deleteToken();
      } finally {
        if (!cancelled) setBootstrapDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthSuccess = async (payload: AuthPayload) => {
    await saveToken(payload.token);
    setUser(payload.user);
    setIsAuthenticated(true);
    setScreen(authReturnScreen);
  };

  const handleLogout = async () => {
    await deleteToken();
    setUser(null);
    setIsAuthenticated(false);
    setScreen("main");
  };

  const requireAuthFor = (target: ScreenName) => {
    if (isAuthenticated) {
      setScreen(target);
      return;
    }
    setAuthReturnScreen(target);
    setScreen("login");
  };

  const handleServerSelect = async (serverId: VpnServerId) => {
    if (serverId === selectedServerId) return;

    if (vpnConnected) {
      try {
        await WireGuardVpn.disconnect();
      } catch (e) {
        console.warn("Failed to stop VPN before server switch:", e);
      }
    }

    setSelectedServerId(serverId);
    setVpnConnected(false);
  };

  if (!bootstrapDone) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={colors.statusBarStyle === "light" ? "light-content" : "dark-content"} />
        <View style={styles.bootstrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBarStyle === "light" ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {screen === "login" && (
          <LoginScreen onLogin={handleAuthSuccess} onGoToRegister={() => setScreen("register")} />
        )}
        {screen === "register" && (
          <RegisterScreen onRegister={handleAuthSuccess} onGoToLogin={() => setScreen("login")} />
        )}
        {screen === "main" && (
          <MainScreen
            onNavigate={setScreen}
            selectedServerId={selectedServerId}
            connected={vpnConnected}
            onConnectionChange={setVpnConnected}
          />
        )}
        {screen === "servers" && (
          <ServerScreen
            onNavigate={setScreen}
            selectedServerId={selectedServerId}
            onSelectServer={handleServerSelect}
          />
        )}
        {screen === "premium" && (
          <PremiumScreen
            onNavigate={setScreen}
            isAuthenticated={isAuthenticated}
            onRequireAuth={() => requireAuthFor("premium")}
          />
        )}
        {screen === "settings" && (
          <SettingsScreen user={user} onNavigate={setScreen} onLogout={handleLogout} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    void loadStoredLanguage();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  bootstrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
