import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { ScreenName } from "../../../App";
import { useAppTheme } from "../theme/ThemeContext";

type ServerId = "frankfurt" | "newyork" | "london" | "tokyo" | "paris" | "singapore";

interface ServerRow {
  id: ServerId;
  ping: number;
  premium?: boolean;
}

const SERVER_ROWS: ServerRow[] = [
  { id: "frankfurt", ping: 18 },
  { id: "newyork", ping: 92 },
  { id: "london", ping: 32 },
  { id: "tokyo", ping: 145 },
  { id: "paris", ping: 24 },
  { id: "singapore", ping: 178, premium: true },
];

interface ServerScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function ServerScreen({ onNavigate }: ServerScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<ServerId>("frankfurt");

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
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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
          const isSelected = item.id === selectedId;
          return (
            <Pressable
              onPress={() => (item.premium ? onNavigate("premium") : setSelectedId(item.id))}
              style={[
                styles.serverCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
                item.premium && styles.serverCardPremium,
              ]}
            >
              <View>
                <Text style={[styles.city, { color: colors.text }]}>{t(`servers.${item.id}.city`)}</Text>
                <Text style={[styles.country, { color: colors.textSecondary }]}>
                  {t(`servers.${item.id}.country`)}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.ping, { color: colors.success }]}>{t("servers.ping", { ms: item.ping })}</Text>
                {item.premium ? (
                  <Text style={[styles.premiumTag, { color: colors.premium }]}>{t("servers.premium")}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />

      <BottomNav active="servers" onNavigate={onNavigate} />
    </View>
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
  serverCardPremium: { opacity: 0.72 },
  city: { fontSize: 16, fontWeight: "600" },
  country: { fontSize: 12, marginTop: 2 },
  right: { alignItems: "flex-end" },
  ping: { fontSize: 12 },
  premiumTag: { fontSize: 11, marginTop: 4 },
});
