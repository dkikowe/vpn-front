import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { ScreenName } from "../../../App";
import type { VpnServer } from "../store/useVpnStore";
import { useAppTheme } from "../theme/ThemeContext";

interface ServerScreenProps {
  onNavigate: (screen: ScreenName) => void;
  servers: VpnServer[];
  selectedServer: VpnServer | null;
  onSelectServer: (serverId: string) => Promise<void>;
}

export default function ServerScreen({
  onNavigate,
  servers,
  selectedServer,
  onSelectServer,
}: ServerScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return servers;
    return servers.filter((server) => server.name.toLowerCase().includes(q));
  }, [query, servers]);

  return (
    <Animated.View
      style={[
        styles.screen,
        { backgroundColor: colors.bg, opacity: fadeIn, transform: [{ translateY: slideUp }] },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate("main")} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{t("servers.title")}</Text>
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t("servers.searchPlaceholder")}
          placeholderTextColor={colors.inputPlaceholder}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedServer?.id;
          return (
            <Pressable
              onPress={() => {
                void onSelectServer(item.id);
              }}
              style={({ pressed }) => [
                styles.serverCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
                pressed && styles.serverCardPressed,
              ]}
            >
              <View>
                <Text style={[styles.city, { color: colors.text }]}>
                  {`${item.flag} ${item.name}`}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.ping, { color: colors.success }]}>
                  {t("servers.ping", { ms: getPingByServerId(item.id) })}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <BottomNav active="servers" onNavigate={onNavigate} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: "700" },
  searchWrap: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1 },
  list: { paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  serverCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serverCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  city: { fontSize: 16, fontWeight: "600" },
  right: { alignItems: "flex-end" },
  ping: { fontSize: 12 },
});

function getPingByServerId(serverId: string): number {
  let hash = 0;
  for (let i = 0; i < serverId.length; i += 1) {
    hash = (hash * 31 + serverId.charCodeAt(i)) % 180;
  }
  return 20 + hash;
}
