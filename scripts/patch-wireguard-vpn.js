const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-native-wireguard-vpn",
  "ios",
  "WireGuardVpn.m",
);

if (!fs.existsSync(target)) {
  console.log("[patch-wireguard-vpn] target file not found, skipping");
  process.exit(0);
}

const source = fs.readFileSync(target, "utf8");

if (source.includes("BOOL _hasListeners;")) {
  console.log("[patch-wireguard-vpn] already patched");
  process.exit(0);
}

let patched = source;

patched = patched.replace(
  "@implementation WireGuardVpn {\n  id _neStatusObserver;\n}",
  "@implementation WireGuardVpn {\n  id _neStatusObserver;\n  BOOL _hasListeners;\n}",
);

patched = patched.replace(
  "- (void)startObserving\n{\n  if (_neStatusObserver != nil) return;\n",
  "- (void)startObserving\n{\n  _hasListeners = YES;\n  if (_neStatusObserver != nil) return;\n",
);

patched = patched.replace(
  "- (void)stopObserving\n{\n  if (_neStatusObserver == nil) return;\n",
  "- (void)stopObserving\n{\n  _hasListeners = NO;\n  if (_neStatusObserver == nil) return;\n",
);

patched = patched.replace("if (![self hasListeners]) return;", "if (!_hasListeners) return;");

if (patched === source) {
  console.log("[patch-wireguard-vpn] no changes applied");
  process.exit(0);
}

fs.writeFileSync(target, patched, "utf8");
console.log("[patch-wireguard-vpn] patch applied");
