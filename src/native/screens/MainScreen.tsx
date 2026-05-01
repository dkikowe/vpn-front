import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { ScreenName } from "../../../App";
import { ApiHttpError, fetchVpnConfigRequest } from "../api/client";
import { getToken } from "../auth/tokenStorage";
import { useVpnStore } from "../store/useVpnStore";
import { useAppTheme } from "../theme/ThemeContext";
import type { WireGuardNativeConfig } from "../vpn/parseWireGuardIni";

type WireGuardClient = {
  isSupported: () => Promise<boolean>;
  connect: (config: WireGuardNativeConfig) => Promise<void>;
  disconnect: () => Promise<void>;
};

const IPV6_PLACEHOLDER_ADDRESS = "fd00::50/128";
const IPV6_DEFAULT_ROUTE = "::/0";

function patchWireGuardConfigForIos<
  T extends WireGuardNativeConfig & Record<string, unknown>,
>(config: T): T {
  const nextAddress = config.address?.trim()
    ? config.address.includes(IPV6_PLACEHOLDER_ADDRESS)
      ? config.address
      : `${config.address}, ${IPV6_PLACEHOLDER_ADDRESS}`
    : IPV6_PLACEHOLDER_ADDRESS;

  const allowedIPs = config.allowedIPs ?? [];
  const nextAllowedIPs = allowedIPs.includes(IPV6_DEFAULT_ROUTE)
    ? allowedIPs
    : [...allowedIPs, IPV6_DEFAULT_ROUTE];

  return {
    ...config,
    address: nextAddress,
    allowedIPs: nextAllowedIPs,
  };
}

const WireGuardVpn: WireGuardClient = (() => {
  const lib = require("react-native-wireguard-vpn");
  return (lib.default ?? lib) as WireGuardClient;
})();

interface MainScreenProps {
  onNavigate: (screen: ScreenName) => void;
  connected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export default function MainScreen({
  onNavigate,
  connected,
  onConnectionChange,
}: MainScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { servers, selectedServer, subscriptionKey } = useVpnStore();
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [wgReady, setWgReady] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const connectPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  useEffect(() => {
    if (connecting) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(connectPulse, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(connectPulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => {
        pulse.stop();
        connectPulse.setValue(1);
      };
    }
    connectPulse.setValue(1);
  }, [connectPulse, connecting]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supported = await WireGuardVpn.isSupported();
        if (!supported) {
          throw new Error(t("main.vpnUnsupported"));
        }
        if (!cancelled) setWgReady(true);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : t("main.connectFailed");
          setConnectError(msg);
          Alert.alert(t("main.connectFailed"), msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleConnect = async () => {
    if (connected) {
      try {
        await WireGuardVpn.disconnect();
        onConnectionChange(false);
        setConnectError("");
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("main.disconnectFailed");
        Alert.alert(t("main.disconnectFailed"), msg);
      }
      return;
    }
    setConnectError("");
    setConnecting(true);

    try {
      if (!wgReady) {
        throw new Error(t("main.vpnNotReady"));
      }
      if (!selectedServer) {
        throw new Error(t("main.noServerSelected"));
      }
      const token = subscriptionKey || (await getToken());
      const vpnConfig = await fetchVpnConfigRequest(selectedServer.id, token);
      const patchedVpnConfig = patchWireGuardConfigForIos(vpnConfig);

      (patchedVpnConfig as any).appGroup = "group.com.didar.vpntest";
      (patchedVpnConfig as any).extensionBundleId =
        "com.didar.vpntest.WGExtension";
      console.log("VPN config object:", patchedVpnConfig);
      await WireGuardVpn.connect(patchedVpnConfig);
      onConnectionChange(true);
    } catch (e) {
      const msg = (() => {
        if (e instanceof ApiHttpError) {
          if (e.status === 401) return t("main.authRequired");
          if (e.status === 404) return t("main.locationUnavailable");
          if (e.status === 409) return t("main.vpnConflict");
          return e.message || t("main.connectFailed");
        }
        return e instanceof Error ? e.message : t("main.connectFailed");
      })();
      setConnectError(msg);
      Alert.alert(t("main.connectFailed"), msg);
      onConnectionChange(false);
    } finally {
      setConnecting(false);
    }
  };

  const connectDisabled = connecting || (!connected && !wgReady);
  const statusColor = connecting
    ? colors.warning
    : connected
      ? colors.success
      : colors.text;
  const badgeBorder = connected ? `${colors.success}80` : `${colors.error}80`;
  const badgeText = connected ? colors.success : colors.error;
  const vpnLabelColor = connected ? colors.primary : colors.iconInactive;
  const isEmptyState = servers.length === 0;

  return (
    <Animated.View
      style={[
        styles.screen,
        {
          backgroundColor: colors.bg,
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        },
      ]}
    >
      {!isEmptyState && (
        <View style={styles.topBar}>
          <View
            style={[
              styles.badge,
              { borderColor: badgeBorder, backgroundColor: colors.surface },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: badgeText }]} />
            <Text style={{ color: badgeText }}>
              {connecting
                ? t("main.connecting")
                : connected
                  ? t("main.protected")
                  : t("main.notProtected")}
            </Text>
          </View>
          <Text style={{ color: vpnLabelColor }}>
            {connected ? t("main.vpnOn") : t("main.vpnOff")}
          </Text>
        </View>
      )}

      <View style={styles.center}>
        {isEmptyState ? (
          <View style={styles.emptyStateWrap}>
            <Text
              style={[styles.emptyStateText, { color: colors.textSecondary }]}
            >
              {t("main.emptyStateMessage")}
            </Text>
            <Pressable
              style={[
                styles.addProfileButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => onNavigate("addProfile")}
            >
              <Text style={styles.addProfileButtonText}>
                {t("main.addProfile")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("main.connectionStatus")}
            </Text>
            <Text style={[styles.status, { color: statusColor }]}>
              {connecting
                ? t("main.connecting")
                : connected
                  ? t("main.connected")
                  : t("main.disconnected")}
            </Text>
            {!!connectError && (
              <Text style={[styles.error, { color: colors.error }]}>
                {connectError}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.connectButton,
                {
                  backgroundColor: connected
                    ? colors.success
                    : connecting
                      ? colors.warning
                      : colors.primary,
                  opacity: connectDisabled ? 0.75 : 1,
                },
                pressed && styles.connectButtonPressed,
              ]}
              onPress={handleConnect}
              disabled={connectDisabled}
            >
              <Animated.View
                style={{
                  alignItems: "center",
                  transform: [{ scale: connectPulse }],
                }}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={54}
                  color="#fff"
                />
                <Text style={styles.connectText}>
                  {connecting
                    ? "..."
                    : connected
                      ? t("main.disconnect")
                      : t("main.connect")}
                </Text>
              </Animated.View>
            </Pressable>

            <Pressable
              style={[
                styles.serverCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => onNavigate("servers")}
            >
              <View>
                <Text
                  style={[styles.serverLabel, { color: colors.textSecondary }]}
                >
                  {t("main.currentServer")}
                </Text>
                <Text style={[styles.serverValue, { color: colors.text }]}>
                  {selectedServer
                    ? `${selectedServer.flag} ${selectedServer.name}`
                    : t("main.noServerSelected")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </Pressable>
          </>
        )}
      </View>

      <BottomNav active="main" onNavigate={onNavigate} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  subtitle: { marginBottom: 8 },
  status: { fontSize: 30, marginBottom: 22, fontWeight: "700" },
  error: {
    marginTop: -12,
    marginBottom: 14,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  connectButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
  },
  connectButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  connectText: { color: "#fff", marginTop: 8, fontSize: 18, fontWeight: "600" },
  serverCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serverLabel: { fontSize: 12 },
  serverValue: { marginTop: 2, fontSize: 16 },
  emptyStateWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 24,
  },
  addProfileButton: {
    minWidth: 220,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 16,
    alignItems: "center",
  },
  addProfileButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
