import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { ScreenName } from "../../../App";
import { ApiHttpError, fetchVpnServersRequest } from "../api/client";
import { useVpnStore, type VpnServer } from "../store/useVpnStore";
import { useAppTheme } from "../theme/ThemeContext";

interface AddProfileScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function AddProfileScreen({ onNavigate }: AddProfileScreenProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { setServers, setSelectedServer, setSubscriptionKey, servers } = useVpnStore();
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualConfigInput, setManualConfigInput] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const canLoad = keyInput.trim().length > 0 && !loading;

  const handleLoadProfile = async () => {
    if (!canLoad) return;

    setLoading(true);
    setError("");
    try {
      const subscriptionKey = keyInput.trim();
      const loadedServers = await fetchVpnServersRequest(subscriptionKey);
      await setServers(loadedServers);
      await setSelectedServer(loadedServers[0] ?? null);
      await setSubscriptionKey(subscriptionKey);
      onNavigate("main");
    } catch (e) {
      const message = (() => {
        if (e instanceof ApiHttpError) return e.message;
        return e instanceof Error ? e.message : t("addProfile.errors.loadFailed");
      })();
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualConfigInput.trim()) return;

    setManualLoading(true);
    setError("");
    try {
      const parsedServer = parseWireGuardToCustomServer(manualConfigInput, t);
      const deduped = servers.filter((server) => server.id !== parsedServer.id);
      const nextServers = [parsedServer, ...deduped];
      await setServers(nextServers);
      await setSelectedServer(parsedServer);
      setManualModalOpen(false);
      setManualConfigInput("");
      onNavigate("main");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("addProfile.errors.importFailed"));
    } finally {
      setManualLoading(false);
    }
  };

  const placeholderColor = useMemo(() => colors.inputPlaceholder, [colors.inputPlaceholder]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate("main")} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{t("addProfile.title")}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("addProfile.subscriptionKeyLabel")}
        </Text>
        <TextInput
          value={keyInput}
          onChangeText={setKeyInput}
          editable={!loading}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t("addProfile.subscriptionKeyPlaceholder")}
          placeholderTextColor={placeholderColor}
          style={[
            styles.input,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
          ]}
        />

        <Pressable
          onPress={handleLoadProfile}
          disabled={!canLoad}
          style={[
            styles.loadButton,
            { backgroundColor: colors.primary },
            !canLoad && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loadButtonText}>{t("addProfile.loadProfile")}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setManualModalOpen(true)} style={styles.manualLinkWrap}>
          <Text style={[styles.manualLink, { color: colors.accent }]}>
            {t("addProfile.manualImport")}
          </Text>
        </Pressable>

        {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      </View>

      <Modal
        visible={manualModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setManualModalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setManualModalOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("addProfile.manualImport")}
            </Text>
            <ScrollView style={styles.modalInputWrap}>
              <TextInput
                value={manualConfigInput}
                onChangeText={setManualConfigInput}
                editable={!manualLoading}
                multiline
                textAlignVertical="top"
                placeholder={t("addProfile.manualPlaceholder")}
                placeholderTextColor={placeholderColor}
                style={[
                  styles.modalInput,
                  { borderColor: colors.border, backgroundColor: colors.bg, color: colors.text },
                ]}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonGhost, { borderColor: colors.border }]}
                onPress={() => setManualModalOpen(false)}
                disabled={manualLoading}
              >
                <Text style={[styles.modalButtonGhostText, { color: colors.textSecondary }]}>
                  {t("addProfile.cancel")}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: colors.primary },
                  manualLoading && styles.buttonDisabled,
                ]}
                onPress={handleManualImport}
                disabled={manualLoading}
              >
                {manualLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>{t("addProfile.import")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function parseWireGuardToCustomServer(
  rawConfig: string,
  t: (key: string) => string,
): VpnServer {
  const lines = rawConfig
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#") && !line.startsWith(";"));

  const endpointLine = lines.find((line) => /^Endpoint\s*=/.test(line));
  const addressLine = lines.find((line) => /^Address\s*=/.test(line));
  const privateKeyLine = lines.find((line) => /^PrivateKey\s*=/.test(line));
  const publicKeyLine = lines.find((line) => /^PublicKey\s*=/.test(line));

  if (!privateKeyLine || !publicKeyLine) {
    throw new Error(t("addProfile.errors.invalidWireGuardKeys"));
  }

  const endpoint = endpointLine?.split("=").slice(1).join("=").trim();
  const address = addressLine?.split("=").slice(1).join("=").trim();

  let name = "Custom Server";
  if (endpoint) {
    const host = endpoint.split(":")[0]?.trim();
    if (host) {
      name = `Custom (${host})`;
    }
  }

  if (!endpoint && !address) {
    throw new Error(t("addProfile.errors.invalidWireGuardEndpoint"));
  }

  return {
    id: "custom-local",
    name,
    flag: "🛠️",
    configEndpoint: endpoint || address,
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: "700" },
  content: { gap: 14 },
  label: { fontSize: 14, fontWeight: "500" },
  input: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
  },
  loadButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loadButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  manualLinkWrap: { alignItems: "center", marginTop: 8 },
  manualLink: { fontSize: 15, fontWeight: "600" },
  error: { textAlign: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    maxHeight: "78%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalInputWrap: { maxHeight: 320 },
  modalInput: {
    minHeight: 260,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonGhost: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  modalButtonGhostText: { fontSize: 15, fontWeight: "600" },
  modalButtonPrimary: {},
  modalButtonPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
