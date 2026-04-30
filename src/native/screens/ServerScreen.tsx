import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { ScreenName } from "../../../App";
import type { VpnServerId } from "../api/client";
import { useAppTheme } from "../theme/ThemeContext";

interface ServerRow {
  id: VpnServerId;
  ping: number;
}

const SERVER_ROWS: ServerRow[] = [
  { id: "fra1", ping: 18 },
  { id: "ams2", ping: 32 },
  { id: "syd1", ping: 178 },
];

interface ServerScreenProps {
  onNavigate: (screen: ScreenName) => void;
  selectedServerId: VpnServerId;
  onSelectServer: (serverId: VpnServerId) => Promise<void>;
}

export default function ServerScreen({
  onNavigate,
  selectedServerId,
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
    if (!q) return SERVER_ROWS;
    return SERVER_ROWS.filter((row) => {
      const city = t(`servers.${row.id}.city`).toLowerCase();
      const country = t(`servers.${row.id}.country`).toLowerCase();
      return city.includes(q) || country.includes(q);
    });
  }, [query, t]);

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
          const isSelected = item.id === selectedServerId;
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
                  {`${t(`servers.${item.id}.flag`)} ${t(`servers.${item.id}.city`)}`}
                </Text>
                <Text style={[styles.country, { color: colors.textSecondary }]}>
                  {t(`servers.${item.id}.country`)}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.ping, { color: colors.success }]}>{t("servers.ping", { ms: item.ping })}</Text>
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
  country: { fontSize: 12, marginTop: 2 },
  right: { alignItems: "flex-end" },
  ping: { fontSize: 12 },
});
