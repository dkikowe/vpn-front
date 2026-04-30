/** Поля, которые ожидает react-native-wireguard-vpn (iOS hasRequired). */
export type WireGuardNativeConfig = {
  privateKey: string;
  publicKey: string;
  serverAddress: string;
  serverPort: number;
  allowedIPs: string[];
  dns?: string[];
  address?: string;
  mtu?: number;
  presharedKey?: string;
};

export class VpnConfigParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VpnConfigParseError";
  }
}

function stripInlineComment(line: string): string {
  const hash = line.indexOf("#");
  if (hash >= 0) return line.slice(0, hash);
  return line;
}

function lineValueCI(body: string, key: string): string | undefined {
  const want = key.toLowerCase();
  for (const raw of body.split(/\r?\n/)) {
    const line = stripInlineComment(raw).trim();
    if (!line || line.startsWith("[")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim().toLowerCase();
    if (k === want) return line.slice(eq + 1).trim();
  }
  return undefined;
}

function splitList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseEndpoint(endpoint: string): { serverAddress: string; serverPort: number } {
  const e = endpoint.trim();
  if (!e) throw new VpnConfigParseError("endpoint");
  if (e.startsWith("[")) {
    const m = e.match(/^\[([^\]]+)\]:(\d+)\s*$/);
    if (!m) throw new VpnConfigParseError("endpoint");
    const port = Number(m[2]);
    if (!Number.isFinite(port)) throw new VpnConfigParseError("endpoint");
    return { serverAddress: m[1], serverPort: port };
  }
  const last = e.lastIndexOf(":");
  if (last <= 0 || last >= e.length - 1) throw new VpnConfigParseError("endpoint");
  const port = Number(e.slice(last + 1));
  if (!Number.isFinite(port)) throw new VpnConfigParseError("endpoint");
  return { serverAddress: e.slice(0, last), serverPort: port };
}

/**
 * Разбирает текст wg-quick (Interface / Peer) в объект для нативного connect().
 */
export function parseWireGuardIniToNative(ini: string): WireGuardNativeConfig {
  const text = ini.replace(/\r\n/g, "\n").trim();
  if (!text) throw new VpnConfigParseError("empty");

  const privateKey = lineValueCI(text, "PrivateKey");
  const publicKey = lineValueCI(text, "PublicKey");
  const endpointRaw = lineValueCI(text, "Endpoint");
  const allowedRaw = lineValueCI(text, "AllowedIPs");
  const addressRaw = lineValueCI(text, "Address");
  const dnsRaw = lineValueCI(text, "DNS");
  const mtuRaw = lineValueCI(text, "MTU");
  const pskRaw = lineValueCI(text, "PresharedKey");

  if (!privateKey) throw new VpnConfigParseError("PrivateKey");
  if (!publicKey) throw new VpnConfigParseError("PublicKey");
  if (!endpointRaw) throw new VpnConfigParseError("Endpoint");
  if (!allowedRaw) throw new VpnConfigParseError("AllowedIPs");

  const { serverAddress, serverPort } = parseEndpoint(endpointRaw);
  const allowedIPs = splitList(allowedRaw);
  if (!allowedIPs.length) throw new VpnConfigParseError("AllowedIPs");

  const out: WireGuardNativeConfig = {
    privateKey,
    publicKey,
    serverAddress,
    serverPort,
    allowedIPs,
  };

  if (addressRaw) {
    const first = splitList(addressRaw)[0];
    if (first) out.address = first;
  }
  if (dnsRaw) {
    const dns = splitList(dnsRaw);
    if (dns.length) out.dns = dns;
  }
  if (mtuRaw) {
    const mtu = Number(mtuRaw);
    if (Number.isFinite(mtu)) out.mtu = mtu;
  }
  if (pskRaw) out.presharedKey = pskRaw;

  return out;
}
