import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { AuthPayload } from "../api/types";
import { registerRequest } from "../api/client";
import { useAppTheme } from "../theme/ThemeContext";

interface RegisterScreenProps {
  onRegister: (payload: AuthPayload) => void | Promise<void>;
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onRegister, onGoToLogin }: RegisterScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t("auth.fillAllFields"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await registerRequest(email.trim(), password);
      await onRegister(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auth.errorRegister"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("auth.registerTitle")}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("auth.registerSubtitle")}</Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("auth.email")}
          placeholderTextColor={colors.inputPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          style={[
            styles.input,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
          ]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t("auth.password")}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry
          editable={!loading}
          style={[
            styles.input,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
          ]}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("auth.confirmPassword")}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry
          editable={!loading}
          style={[
            styles.input,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
          ]}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          loading && styles.primaryButtonDisabled,
        ]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>{t("auth.signUp")}</Text>
        )}
      </Pressable>

      <Pressable onPress={onGoToLogin} disabled={loading}>
        <Text style={[styles.linkText, { color: colors.accent }, loading && styles.linkDisabled]}>
          {t("auth.haveAccount")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 26,
  },
  form: {
    gap: 12,
    marginBottom: 20,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    fontSize: 12,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    textAlign: "center",
    marginTop: 16,
  },
  linkDisabled: {
    opacity: 0.5,
  },
});
