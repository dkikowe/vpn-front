import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { ScreenName } from "../../../App";
import type { AuthUser } from "../api/types";
import { setAppLanguage, type AppLanguage } from "../i18n/i18n";
import type { AppPalette } from "../theme/palettes";
import { useAppTheme } from "../theme/ThemeContext";

interface SettingsScreenProps {
  user: AuthUser | null;
  onNavigate: (screen: ScreenName) => void;
  onLogout: () => void | Promise<void>;
}

export default function SettingsScreen({ user, onNavigate, onLogout }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const { colors, preference, setPreference } = useAppTheme();
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [dnsLeak, setDnsLeak] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [langModal, setLangModal] = useState(false);

  const displayName = user?.email?.split("@")[0] ?? t("settings.userFallback");
  const neonPurple = colors.premium;

  const darkMode = preference === "dark";

  const languageLabel = i18n.language === "en" ? t("settings.languageEn") : t("settings.languageRu");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  const pickLanguage = async (lng: AppLanguage) => {
    await setAppLanguage(lng);
    setLangModal(false);
  };

  const settingsColors = useMemo(
    () => ({
      kill: ["#ef4444", "#f97316"] as [string, string],
      auto: ["#06b6d4", "#22d3ee"] as [string, string],
      dns: ["#10b981", "#14b8a6"] as [string, string],
      notifications: ["#f59e0b", "#eab308"] as [string, string],
      dark: ["#6366f1", "#a855f7"] as [string, string],
    }),
    [],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("settings.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t("settings.subtitle")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.card,
            styles.neonCard,
            {
              borderColor: `${neonPurple}66`,
              backgroundColor: colors.surface,
              shadowColor: neonPurple,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("settings.profile")}</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>{user?.email ?? "—"}</Text>
          <Pressable
            style={[styles.upgradeBtn, { backgroundColor: neonPurple, shadowColor: neonPurple }]}
            onPress={() => onNavigate("premium")}
          >
            <Text style={styles.upgradeText}>{t("settings.upgrade")}</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.card,
            styles.neonCard,
            {
              borderColor: `${neonPurple}40`,
              backgroundColor: colors.surface,
              shadowColor: neonPurple,
            },
          ]}
        >
          <SectionTitle color={colors.textMuted}>{t("settings.vpnSection")}</SectionTitle>
          <SettingRow
            icon="shield-checkmark-outline"
            title={t("settings.killSwitch")}
            value={killSwitch}
            onChange={setKillSwitch}
            colors={colors}
            activeColors={settingsColors.kill}
          />
          <SettingRow
            icon="wifi-outline"
            title={t("settings.autoConnect")}
            value={autoConnect}
            onChange={setAutoConnect}
            colors={colors}
            activeColors={settingsColors.auto}
          />
          <SettingRow
            icon="eye-outline"
            title={t("settings.dnsLeak")}
            value={dnsLeak}
            onChange={setDnsLeak}
            colors={colors}
            activeColors={settingsColors.dns}
            noBorder
          />
        </View>

        <View
          style={[
            styles.card,
            styles.neonCard,
            {
              borderColor: `${neonPurple}40`,
              backgroundColor: colors.surface,
              shadowColor: neonPurple,
            },
          ]}
        >
          <SectionTitle color={colors.textMuted}>{t("settings.generalSection")}</SectionTitle>
          <SettingRow
            icon="notifications-outline"
            title={t("settings.notifications")}
            value={notifications}
            onChange={setNotifications}
            colors={colors}
            activeColors={settingsColors.notifications}
          />
          <SettingRow
            icon="moon-outline"
            title={t("settings.darkTheme")}
            value={darkMode}
            onChange={(next) => setPreference(next ? "dark" : "light")}
            colors={colors}
            activeColors={settingsColors.dark}
          />
          <Pressable style={[styles.settingRow, styles.noBorder]} onPress={() => setLangModal(true)}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: `${settingsColors.auto[0]}26` }]}>
                <Ionicons name="language-outline" size={18} color={settingsColors.auto[0]} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t("settings.language")}</Text>
                <Text style={[styles.hint, { color: colors.textMuted }]}>{languageLabel}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.iconInactive} />
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.logoutBtn,
            { borderColor: colors.dangerBorder, backgroundColor: colors.dangerBg },
            loggingOut && styles.logoutBtnDisabled,
          ]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>{t("settings.logout")}</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <BottomNav active="settings" onNavigate={onNavigate} />

      <Modal visible={langModal} transparent animationType="fade" onRequestClose={() => setLangModal(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            style={[styles.modalBackdrop, { backgroundColor: "rgba(0,0,0,0.45)" }]}
            onPress={() => setLangModal(false)}
          />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: `${neonPurple}55`, shadowColor: neonPurple },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("settings.pickLanguage")}</Text>
            <Pressable
              style={[
                styles.modalRow,
                i18n.language === "ru" && { backgroundColor: `${neonPurple}2A` },
              ]}
              onPress={() => void pickLanguage("ru")}
            >
              <Text style={[styles.modalRowText, { color: colors.text }]}>{t("settings.languageRu")}</Text>
              {i18n.language === "ru" ? <Ionicons name="checkmark" size={20} color={neonPurple} /> : null}
            </Pressable>
            <Pressable
              style={[
                styles.modalRow,
                i18n.language === "en" && { backgroundColor: `${neonPurple}2A` },
              ]}
              onPress={() => void pickLanguage("en")}
            >
              <Text style={[styles.modalRowText, { color: colors.text }]}>{t("settings.languageEn")}</Text>
              {i18n.language === "en" ? <Ionicons name="checkmark" size={20} color={neonPurple} /> : null}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: boolean;
  onChange: (next: boolean) => void;
  colors: AppPalette;
  activeColors: [string, string];
  noBorder?: boolean;
}

function SettingRow({ icon, title, value, onChange, colors, activeColors, noBorder }: SettingRowProps) {
  return (
    <View style={[styles.settingRow, noBorder && styles.noBorder]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrap, { backgroundColor: `${activeColors[0]}26` }]}>
          <Ionicons name={icon} size={18} color={activeColors[0]} />
        </View>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <NeonToggle
        enabled={value}
        onToggle={() => onChange(!value)}
        activeColors={activeColors}
        isDark={colors.statusBarStyle === "light"}
      />
    </View>
  );
}

function SectionTitle({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{children}</Text>;
}

function NeonToggle({
  enabled,
  onToggle,
  activeColors,
  isDark,
}: {
  enabled: boolean;
  onToggle: () => void;
  activeColors: [string, string];
  isDark: boolean;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.toggleWrap}>
      {enabled ? (
        <View
          style={[
            styles.toggleTrack,
            {
              backgroundColor: activeColors[0],
              shadowColor: activeColors[1],
            },
            styles.toggleTrackOn,
          ]}
        >
          <View style={[styles.toggleKnob, styles.toggleKnobOn]} />
        </View>
      ) : (
        <View
          style={[
            styles.toggleTrack,
            styles.toggleTrackOff,
            !isDark && styles.toggleTrackOffLight,
          ]}
        >
          <View style={[styles.toggleKnob, !isDark && styles.toggleKnobLight]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { marginTop: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  neonCard: {
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  rowPress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardText: { fontSize: 14 },
  cardSub: { fontSize: 12 },
  upgradeBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  upgradeText: { color: "#fff", fontWeight: "700" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
  },
  noBorder: { borderBottomWidth: 0 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {},
  hint: { fontSize: 12, marginTop: 2 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    minHeight: 50,
  },
  logoutBtnDisabled: { opacity: 0.7 },
  logoutText: { fontWeight: "600" },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    zIndex: 1,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 9,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalRowText: { fontSize: 15 },
  toggleWrap: { paddingVertical: 2 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    justifyContent: "center",
  },
  toggleTrackOn: {
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  toggleTrackOff: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  toggleTrackOffLight: {
    backgroundColor: "#e2e8f0",
    borderColor: "#cbd5e1",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginLeft: 2,
  },
  toggleKnobLight: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  toggleKnobOn: {
    marginLeft: 22,
  },
});
