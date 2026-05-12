import { NativeModules } from "react-native";

const { XrayVpnModule } = NativeModules;

export const XrayClient = {
  connect: async (vlessUrl: string) => {
    if (!XrayVpnModule) {
      throw new Error("XrayVpnModule не найден. Нативный модуль еще не слинкован.");
    }
    return await XrayVpnModule.connect(vlessUrl);
  },
  disconnect: async () => {
    if (!XrayVpnModule) return;
    return await XrayVpnModule.disconnect();
  },
};
