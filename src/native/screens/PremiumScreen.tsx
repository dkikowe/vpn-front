import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScreenName } from "../../../App";
import { useAppTheme } from "../theme/ThemeContext";

interface PremiumScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

const PLANS = [
  { nameKey: "premium.plan1m", price: "12.99$", perKey: "premium.perMonth1", savingsKey: undefined as string | undefined },
  { nameKey: "premium.plan6m", price: "59.99$", perKey: "premium.perMonth6", savingsKey: "premium.savings23" },
  { nameKey: "premium.plan12m", price: "89.99$", perKey: "premium.perMonth12", savingsKey: "premium.savings42" },
] as const;

const FEATURE_KEYS = ["premium.feat1", "premium.feat2", "premium.feat3", "premium.feat4"] as const;

export default function PremiumScreen({ onNavigate }: PremiumScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [selected, setSelected] = useState(2);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate("main")} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{t("premium.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {PLANS.map((plan, index) => (
          <Pressable
            key={plan.nameKey}
            style={[
              styles.plan,
              { borderColor: colors.border, backgroundColor: colors.surface },
              selected === index && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
            ]}
            onPress={() => setSelected(index)}
          >
            <View>
              <Text style={[styles.planName, { color: colors.text }]}>{t(plan.nameKey)}</Text>
              <Text style={[styles.planPrice, { color: colors.text }]}>{plan.price}</Text>
              <Text style={[styles.planSub, { color: colors.textSecondary }]}>{t(plan.perKey)}</Text>
              {plan.savingsKey ? (
                <Text style={[styles.savings, { color: colors.accent }]}>{t(plan.savingsKey)}</Text>
              ) : null}
            </View>
            {selected === index ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : (
              <Ionicons name="ellipse-outline" size={22} color={colors.iconInactive} />
            )}
          </Pressable>
        ))}

        <View style={[styles.features, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          {FEATURE_KEYS.map((key) => (
            <View style={styles.featureRow} key={key}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.accent} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <Pressable style={[styles.cta, { backgroundColor: colors.primary }]}>
          <Text style={styles.ctaText}>{t("premium.cta")}</Text>
        </Pressable>
      </ScrollView>
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
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  plan: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: { fontWeight: "700", fontSize: 16 },
  planPrice: { marginTop: 6, fontSize: 20, fontWeight: "700" },
  planSub: { marginTop: 2, fontSize: 12 },
  savings: { marginTop: 6, fontSize: 12 },
  features: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
    gap: 10,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: {},
  cta: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700" },
});
