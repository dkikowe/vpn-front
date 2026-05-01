/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "vpn-front-native",
    slug: "vpn-front-native",
    version: "1.0.0",
    scheme: "vpn-front-native",
    icon: "./assets/icon.png",
    ios: {
      bundleIdentifier: "com.didar.vpntest",
      supportsTablet: true,
      // ДОБАВЛЯЕМ ВОТ ЭТОТ БЛОК:
      entitlements: {
        "com.apple.security.application-groups": ["group.com.didar.vpntest"],
      },
    },
    android: {
      package: "com.didar.vpntest",
    },
    plugins: [
      "expo-secure-store",
      "expo-localization",
      [
        "react-native-wireguard-vpn",
        {
          appGroup: "group.com.didar.vpntest",
          extensionBundleId: "com.didar.vpntest.WGExtension",
        },
      ],
    ],
    extra: {
      // Продакшен / устройство в LAN: EXPO_PUBLIC_API_URL=https://api.example.com npx expo start
      apiUrl: process.env.EXPO_PUBLIC_API_URL || undefined,
      eas: {
        projectId: "96e7aecf-24ee-4eb8-80ad-d3e44fab4db5",
      },
    },
  },
};
