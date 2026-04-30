import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";

export interface VpnServer {
  id: string;
  name: string;
  flag: string;
  configEndpoint?: string;
}

interface VpnStoreState {
  servers: VpnServer[];
  selectedServer: VpnServer | null;
  subscriptionKey: string;
  hydrated: boolean;
}

type VpnStoreAction =
  | { type: "SET_SERVERS"; payload: VpnServer[] }
  | { type: "SET_SELECTED_SERVER"; payload: VpnServer | null }
  | { type: "SET_SUBSCRIPTION_KEY"; payload: string }
  | { type: "SET_HYDRATED"; payload: boolean }
  | { type: "CLEAR_STORE" };

interface VpnStoreContextValue extends VpnStoreState {
  setServers: (servers: VpnServer[]) => Promise<void>;
  setSelectedServer: (server: VpnServer | null) => Promise<void>;
  setSubscriptionKey: (key: string) => Promise<void>;
  clearStore: () => Promise<void>;
}

const SERVERS_STORAGE_KEY = "vpn_servers_v1";
const SELECTED_SERVER_STORAGE_KEY = "vpn_selected_server_v1";
const SUBSCRIPTION_KEY_STORAGE_KEY = "vpn_subscription_key_v1";

const initialState: VpnStoreState = {
  servers: [],
  selectedServer: null,
  subscriptionKey: "",
  hydrated: false,
};

const VpnStoreContext = createContext<VpnStoreContextValue | null>(null);

function isVpnServer(value: unknown): value is VpnServer {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.flag === "string" &&
    (typeof row.configEndpoint === "undefined" || typeof row.configEndpoint === "string")
  );
}

function vpnStoreReducer(state: VpnStoreState, action: VpnStoreAction): VpnStoreState {
  switch (action.type) {
    case "SET_SERVERS": {
      const nextServers = action.payload;
      if (nextServers.length === 0) {
        return { ...state, servers: [], selectedServer: null };
      }

      if (!state.selectedServer) {
        return { ...state, servers: nextServers, selectedServer: nextServers[0] ?? null };
      }

      const stillExists = nextServers.find((server) => server.id === state.selectedServer?.id);
      return {
        ...state,
        servers: nextServers,
        selectedServer: stillExists ?? nextServers[0] ?? null,
      };
    }
    case "SET_SELECTED_SERVER":
      return { ...state, selectedServer: action.payload };
    case "SET_SUBSCRIPTION_KEY":
      return { ...state, subscriptionKey: action.payload };
    case "SET_HYDRATED":
      return { ...state, hydrated: action.payload };
    case "CLEAR_STORE":
      return { ...initialState, hydrated: true };
    default:
      return state;
  }
}

export function VpnStoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(vpnStoreReducer, initialState);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const [rawServers, rawSelectedServer, subscriptionKey] = await Promise.all([
          AsyncStorage.getItem(SERVERS_STORAGE_KEY),
          AsyncStorage.getItem(SELECTED_SERVER_STORAGE_KEY),
          SecureStore.getItemAsync(SUBSCRIPTION_KEY_STORAGE_KEY),
        ]);

        if (cancelled) return;

        if (rawServers) {
          const parsed = JSON.parse(rawServers) as unknown;
          if (Array.isArray(parsed)) {
            const validServers = parsed.filter(isVpnServer);
            if (validServers.length > 0) {
              dispatch({ type: "SET_SERVERS", payload: validServers });
            }
          }
        }

        if (rawSelectedServer) {
          const parsedSelected = JSON.parse(rawSelectedServer) as unknown;
          if (isVpnServer(parsedSelected)) {
            dispatch({ type: "SET_SELECTED_SERVER", payload: parsedSelected });
          }
        }

        if (subscriptionKey) {
          dispatch({ type: "SET_SUBSCRIPTION_KEY", payload: subscriptionKey });
        }
      } catch (error) {
        console.warn("Failed to hydrate VPN store:", error);
      } finally {
        if (!cancelled) {
          dispatch({ type: "SET_HYDRATED", payload: true });
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const setServers = useCallback(async (servers: VpnServer[]) => {
    await AsyncStorage.setItem(SERVERS_STORAGE_KEY, JSON.stringify(servers));
    dispatch({ type: "SET_SERVERS", payload: servers });
  }, []);

  const setSelectedServer = useCallback(async (server: VpnServer | null) => {
    if (!server) {
      await AsyncStorage.removeItem(SELECTED_SERVER_STORAGE_KEY);
      dispatch({ type: "SET_SELECTED_SERVER", payload: null });
      return;
    }

    await AsyncStorage.setItem(SELECTED_SERVER_STORAGE_KEY, JSON.stringify(server));
    dispatch({ type: "SET_SELECTED_SERVER", payload: server });
  }, []);

  const setSubscriptionKey = useCallback(async (key: string) => {
    if (key) {
      await SecureStore.setItemAsync(SUBSCRIPTION_KEY_STORAGE_KEY, key);
    } else {
      await SecureStore.deleteItemAsync(SUBSCRIPTION_KEY_STORAGE_KEY);
    }
    dispatch({ type: "SET_SUBSCRIPTION_KEY", payload: key });
  }, []);

  const clearStore = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(SERVERS_STORAGE_KEY),
      AsyncStorage.removeItem(SELECTED_SERVER_STORAGE_KEY),
      SecureStore.deleteItemAsync(SUBSCRIPTION_KEY_STORAGE_KEY),
    ]);
    dispatch({ type: "CLEAR_STORE" });
  }, []);

  const value = useMemo<VpnStoreContextValue>(
    () => ({
      ...state,
      setServers,
      setSelectedServer,
      setSubscriptionKey,
      clearStore,
    }),
    [state, setServers, setSelectedServer, setSubscriptionKey, clearStore],
  );

  return <VpnStoreContext.Provider value={value}>{children}</VpnStoreContext.Provider>;
}

export function useVpnStore(): VpnStoreContextValue {
  const ctx = useContext(VpnStoreContext);
  if (!ctx) {
    throw new Error("useVpnStore must be used inside VpnStoreProvider");
  }
  return ctx;
}
