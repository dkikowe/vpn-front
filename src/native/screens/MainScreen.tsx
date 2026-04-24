import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { ScreenName } from "../../../App";
import { useAppTheme } from "../theme/ThemeContext";

interface MainScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function MainScreen({ onNavigate }: MainScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (connected) {
      setConnected(false);
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1500);
  };

  const statusColor = connecting ? colors.warning : connected ? colors.success : colors.text;
  const badgeBorder = connected ? `${colors.success}80` : `${colors.error}80`;
  const badgeText = connected ? colors.success : colors.error;
  const vpnLabelColor = connected ? colors.primary : colors.iconInactive;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.topBar}>
        <View style={[styles.badge, { borderColor: badgeBorder, backgroundColor: colors.surface }]}>
          <View style={[styles.badgeDot, { backgroundColor: badgeText }]} />
          <Text style={{ color: badgeText }}>
            {connecting ? t("main.connecting") : connected ? t("main.protected") : t("main.notProtected")}
          </Text>
        </View>
        <Text style={{ color: vpnLabelColor }}>
          {connected ? t("main.vpnOn") : t("main.vpnOff")}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("main.connectionStatus")}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {connecting ? t("main.connecting") : connected ? t("main.connected") : t("main.disconnected")}
        </Text>

        <Pressable
          style={[
            styles.connectButton,
            { backgroundColor: connected ? colors.success : connecting ? colors.warning : colors.primary },
          ]}
          onPress={handleConnect}
        >
          <MaterialCommunityIcons name="shield-check" size={54} color="#fff" />
          <Text style={styles.connectText}>
            {connecting ? "..." : connected ? t("main.disconnect") : t("main.connect")}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.serverCard,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => onNavigate("servers")}
        >
          <View>
            <Text style={[styles.serverLabel, { color: colors.textSecondary }]}>{t("main.currentServer")}</Text>
            <Text style={[styles.serverValue, { color: colors.text }]}>{t("main.serverFrankfurt")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </Pressable>
      </View>

      <BottomNav active="main" onNavigate={onNavigate} />
    </View>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  subtitle: { marginBottom: 8 },
  status: { fontSize: 30, marginBottom: 22, fontWeight: "700" },
  connectButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
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
});
