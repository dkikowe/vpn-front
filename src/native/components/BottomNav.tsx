import { Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScreenName } from "../../../App";
import { useAppTheme } from "../theme/ThemeContext";

interface BottomNavProps {
  active: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const inactive = colors.iconInactive;
  const activeC = colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
      <Pressable style={styles.item} onPress={() => onNavigate("main")}>
        <Ionicons name="home" size={20} color={active === "main" ? activeC : inactive} />
        <Text style={[styles.label, { color: inactive }, active === "main" && { color: activeC }]}>
          {t("nav.home")}
        </Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => onNavigate("servers")}>
        <FontAwesome6 name="location-dot" size={18} color={active === "servers" ? activeC : inactive} />
        <Text style={[styles.label, { color: inactive }, active === "servers" && { color: activeC }]}>
          {t("nav.servers")}
        </Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => onNavigate("settings")}>
        <MaterialIcons name="settings" size={20} color={active === "settings" ? activeC : inactive} />
        <Text style={[styles.label, { color: inactive }, active === "settings" && { color: activeC }]}>
          {t("nav.settings")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  item: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
});
