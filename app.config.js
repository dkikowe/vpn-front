/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "vpn-front-native",
    slug: "vpn-front-native",
    version: "1.0.0",
    scheme: "vpn-front-native",
    ios: {
      bundleIdentifier: "com.anonymous.vpn-front-native",
    },
    android: {
      package: "com.anonymous.vpnfrontnative",
    },
    plugins: ["expo-secure-store", "expo-localization"],
    extra: {
      // Продакшен / устройство в LAN: EXPO_PUBLIC_API_URL=https://api.example.com npx expo start
      apiUrl: process.env.EXPO_PUBLIC_API_URL || undefined,
    },
  },
};
